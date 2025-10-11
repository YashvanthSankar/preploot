import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { ChromaClient } from 'chromadb';
import { pipeline } from '@xenova/transformers';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import { UserManager } from './userManager.js';

// Dynamic import for pdfjs-dist to avoid build issues
let pdfjsLib;

async function initPdfJs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
  }
  return pdfjsLib;
}

export class PDFProcessor {
  constructor(userId) {
    this.userId = userId;
    const { dataFolder, vectordbFolder } = UserManager.createUserDirectories(userId);
    this.dataFolder = dataFolder;
    this.vectordbFolder = vectordbFolder;
    this.stateFile = UserManager.getUserStateFile(userId);
    this.embeddings = null;
    this.chromaClient = null;
    this.collection = null;
    
    this.initializeEmbeddings();
  }

  async initializeEmbeddings() {
    try {
      // Initialize embedding model - using a lighter model for serverless
      this.embeddings = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      
      // Initialize ChromaDB client - use in-memory for Next.js serverless
      this.chromaClient = new ChromaClient();
      
      // Create a simple embedding function that doesn't require external dependencies
      class CustomEmbeddingFunction {
        async generate(texts) {
          const embeddings = [];
          for (const text of texts) {
            try {
              const embedding = await this.embeddings(text, { pooling: 'mean', normalize: true });
              embeddings.push(Array.from(embedding.data));
            } catch (error) {
              // Fallback to simple hash-based embedding if transformers fail
              const simpleEmbedding = this.createSimpleEmbedding(text);
              embeddings.push(simpleEmbedding);
            }
          }
          return embeddings;
        }
        
        createSimpleEmbedding(text) {
          // Create a simple 384-dimensional embedding from text hash
          const hash = this.hashString(text);
          const embedding = new Array(384).fill(0);
          for (let i = 0; i < 384; i++) {
            embedding[i] = Math.sin(hash + i) * 0.5;
          }
          return embedding;
        }
        
        hashString(str) {
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
          }
          return hash;
        }
      }
      
      const customEmbeddingFunction = new CustomEmbeddingFunction();
      customEmbeddingFunction.embeddings = this.embeddings;
      
      // Get or create collection for this user
      const collectionName = `user_${this.userId}_docs`;
      try {
        this.collection = await this.chromaClient.getCollection({
          name: collectionName,
          embeddingFunction: customEmbeddingFunction
        });
      } catch (error) {
        // Collection doesn't exist, create it
        this.collection = await this.chromaClient.createCollection({
          name: collectionName,
          metadata: { userId: this.userId },
          embeddingFunction: customEmbeddingFunction
        });
      }
    } catch (error) {
      console.error('Error initializing embeddings:', error);
      throw error;
    }
  }

  async getTextFromPdf(filePath) {
    try {
      const pdfjs = await initPdfJs();
      const dataBuffer = fs.readFileSync(filePath);
      const data = new Uint8Array(dataBuffer);
      
      const pdf = await pdfjs.getDocument({ data }).promise;
      let text = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        text += pageText + '\n';
      }
      
      return text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw error;
    }
  }

  async getTextFromDocx(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      console.error('Error extracting text from DOCX:', error);
      throw error;
    }
  }

  async getTextFromFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.pdf') {
      return await this.getTextFromPdf(filePath);
    } else if (ext === '.docx') {
      return await this.getTextFromDocx(filePath);
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  checkNewFiles() {
    try {
      // Get all PDF and DOCX files
      const allFiles = fs.readdirSync(this.dataFolder)
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ext === '.pdf' || ext === '.docx';
        })
        .map(file => path.join(this.dataFolder, file));

      const processedFiles = UserManager.getUserProcessedFiles(this.userId);

      // Detect removed files
      const removedFiles = Object.keys(processedFiles).filter(
        file => !allFiles.includes(file)
      );
      
      // Remove from processed files tracking
      removedFiles.forEach(file => {
        delete processedFiles[file];
      });

      // Detect new/updated files
      const newFiles = [];
      for (const file of allFiles) {
        const stats = fs.statSync(file);
        const lastModified = stats.mtime.getTime();
        
        if (!(file in processedFiles) || processedFiles[file] < lastModified) {
          newFiles.push(file);
          processedFiles[file] = lastModified;
        }
      }

      // Save updated state
      UserManager.saveUserProcessedFiles(this.userId, processedFiles);

      return { newFiles, removedFiles };
    } catch (error) {
      console.error('Error checking new files:', error);
      return { newFiles: [], removedFiles: [] };
    }
  }

  async generateEmbedding(text) {
    try {
      if (!this.embeddings) {
        await this.initializeEmbeddings();
      }
      
      const result = await this.embeddings(text);
      // Convert tensor to array if needed
      return Array.isArray(result) ? result : result.data;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  async storeChromaFunction() {
    try {
      const { newFiles, removedFiles } = this.checkNewFiles();
      
      // Ensure embeddings are initialized
      if (!this.embeddings || !this.collection) {
        await this.initializeEmbeddings();
      }

      // Delete vectors for removed files
      if (removedFiles.length > 0) {
        for (const file of removedFiles) {
          try {
            await this.collection.delete({
              where: { source: file }
            });
            console.log(`Deleted vectors for: ${file}`);
          } catch (error) {
            console.error(`Error deleting vectors for ${file}:`, error);
          }
        }
      }

      // Check if there are any files at all
      const allFiles = fs.readdirSync(this.dataFolder)
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ext === '.pdf' || ext === '.docx';
        });

      if (allFiles.length === 0) {
        console.log('No PDF or DOCX files in the user directory.');
        
        // Delete the collection
        try {
          await this.chromaClient.deleteCollection({
            name: `user_${this.userId}_docs`
          });
        } catch (error) {
          console.error('Error deleting collection:', error);
        }
        
        // Delete state file
        if (fs.existsSync(this.stateFile)) {
          fs.unlinkSync(this.stateFile);
        }
        
        return null;
      }

      // No new files to process
      if (newFiles.length === 0) {
        console.log('No new files, skipping embeddings.');
        return this.collection;
      }

      // Process new files
      console.log('New/updated files found:', newFiles);
      const docs = [];
      
      for (const file of newFiles) {
        try {
          const text = await this.getTextFromFile(file);
          docs.push(new Document({
            pageContent: text,
            metadata: { source: file, userId: this.userId }
          }));
        } catch (error) {
          console.error(`Error processing file ${file}:`, error);
        }
      }

      if (docs.length === 0) {
        console.log('No valid documents to process.');
        return this.collection;
      }

      // Split documents into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 2000,
        chunkOverlap: 100
      });
      const chunks = await textSplitter.splitDocuments(docs);

      // Generate embeddings and add to ChromaDB
      const embeddings = [];
      const documents = [];
      const metadatas = [];
      const ids = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
          const embedding = await this.generateEmbedding(chunk.pageContent);
          embeddings.push(embedding);
          documents.push(chunk.pageContent);
          metadatas.push(chunk.metadata);
          ids.push(`${this.userId}_${Date.now()}_${i}`);
        } catch (error) {
          console.error(`Error generating embedding for chunk ${i}:`, error);
        }
      }

      if (embeddings.length > 0) {
        await this.collection.add({
          ids,
          embeddings,
          documents,
          metadatas
        });
        console.log(`Added ${embeddings.length} chunks to vector database`);
      }

      return this.collection;
    } catch (error) {
      console.error('Error in storeChromaFunction:', error);
      throw error;
    }
  }

  async getVectorstore() {
    try {
      if (!this.collection) {
        await this.initializeEmbeddings();
      }
      return this.collection;
    } catch (error) {
      console.error('Error getting vectorstore:', error);
      return null;
    }
  }

  async saveFile(fileBuffer, filename) {
    try {
      const filePath = path.join(this.dataFolder, filename);
      fs.writeFileSync(filePath, fileBuffer);
      return filePath;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  async queryVectorstore(query, numResults = 5) {
    try {
      if (!this.collection || !this.embeddings) {
        await this.initializeEmbeddings();
      }

      const queryEmbedding = await this.generateEmbedding(query);
      
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: numResults,
        include: ['documents', 'metadatas', 'distances']
      });

      return results;
    } catch (error) {
      console.error('Error querying vectorstore:', error);
      throw error;
    }
  }
}