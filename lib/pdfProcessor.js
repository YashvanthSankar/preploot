import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
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
    // Create user directories if they don't exist
    UserManager.createUserDirectories(userId);
    this.vectordbFolder = UserManager.getUserVectordbFolder(userId);
    this.dataFolder = UserManager.getUserDataFolder(userId);
    this.embeddings = null;
    this.vectorStoreFile = path.join(this.vectordbFolder, 'vectors.json');
    this.metadataFile = path.join(this.vectordbFolder, 'metadata.json');
  }

  async initializeEmbeddings() {
    try {
      // Initialize embedding model - using a lighter model for serverless
      this.embeddings = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      
      // Ensure user directories exist
      // Ensure user directories exist (already done in constructor)
      // UserManager.createUserDirectories(this.userId);
      
      // Initialize vector store files if they don't exist
      await this.initializeVectorStore();
      
    } catch (error) {
      console.error('Error initializing embeddings:', error);
      throw error;
    }
  }

  async initializeVectorStore() {
    try {
      // Check if vector store files exist, if not create them
      if (!fs.existsSync(this.vectorStoreFile)) {
        await fs.promises.writeFile(this.vectorStoreFile, JSON.stringify([]), 'utf8');
      }
      if (!fs.existsSync(this.metadataFile)) {
        await fs.promises.writeFile(this.metadataFile, JSON.stringify([]), 'utf8');
      }
    } catch (error) {
      console.error('Error initializing vector store:', error);
      throw error;
    }
  }

  async getVectorstore() {
    try {
      await this.initializeEmbeddings();
      
      // Check if we have any vectors stored
      const vectors = JSON.parse(await fs.promises.readFile(this.vectorStoreFile, 'utf8'));
      const metadata = JSON.parse(await fs.promises.readFile(this.metadataFile, 'utf8'));
      
      return vectors.length > 0 ? { vectors, metadata } : null;
    } catch (error) {
      console.error('Error getting vector store:', error);
      return null;
    }
  }

  async queryVectorstore(query, topK = 5) {
    try {
      // Get query embedding
      const queryEmbedding = await this.getEmbedding(query);
      
      // Load stored vectors and metadata
      const vectors = JSON.parse(await fs.promises.readFile(this.vectorStoreFile, 'utf8'));
      const metadata = JSON.parse(await fs.promises.readFile(this.metadataFile, 'utf8'));
      
      if (vectors.length === 0) {
        return { documents: [[]], metadatas: [[]], distances: [[]] };
      }
      
      // Calculate similarities
      const similarities = vectors.map((vector, index) => ({
        index,
        similarity: this.cosineSimilarity(queryEmbedding, vector.embedding),
        distance: 1 - this.cosineSimilarity(queryEmbedding, vector.embedding)
      }));
      
      // Sort by similarity (highest first) and take top K
      similarities.sort((a, b) => b.similarity - a.similarity);
      const topResults = similarities.slice(0, topK);
      
      // Format results to match ChromaDB format
      const documents = [topResults.map(result => vectors[result.index].text)];
      const metadatas = [topResults.map(result => metadata[result.index])];
      const distances = [topResults.map(result => result.distance)];
      
      return { documents, metadatas, distances };
    } catch (error) {
      console.error('Error querying vector store:', error);
      return { documents: [[]], metadatas: [[]], distances: [[]] };
    }
  }

  async getEmbedding(text) {
    if (!this.embeddings) {
      console.error('Embeddings not initialized! Call initializeEmbeddings() first.');
      throw new Error('Embeddings not initialized');
    }
    console.log(`Generating embedding for text of length ${text.length}...`);
    const embedding = await this.embeddings(text, { pooling: 'mean', normalize: true });
    console.log(`Generated embedding with ${embedding.data.length} dimensions`);
    return Array.from(embedding.data);
  }

  async getAllDocuments() {
    try {
      // Load stored vectors and metadata
      const vectors = JSON.parse(await fs.promises.readFile(this.vectorStoreFile, 'utf8'));
      const metadata = JSON.parse(await fs.promises.readFile(this.metadataFile, 'utf8'));
      
      // Return in ChromaDB format for compatibility
      return {
        documents: vectors.map(v => v.text),
        metadatas: metadata
      };
    } catch (error) {
      console.error('Error getting all documents:', error);
      return { documents: [], metadatas: [] };
    }
  }

  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async addTextsToVectorstore(texts, metadatas) {
    try {
      console.log(`Adding ${texts.length} texts to vector store for user ${this.userId}`);
      
      // Load existing vectors and metadata
      const existingVectors = JSON.parse(await fs.promises.readFile(this.vectorStoreFile, 'utf8'));
      const existingMetadata = JSON.parse(await fs.promises.readFile(this.metadataFile, 'utf8'));
      
      console.log(`Existing vectors: ${existingVectors.length}, existing metadata: ${existingMetadata.length}`);
      
      // Generate embeddings for new texts
      for (let i = 0; i < texts.length; i++) {
        console.log(`Processing text ${i + 1}/${texts.length}...`);
        const embedding = await this.getEmbedding(texts[i]);
        existingVectors.push({
          text: texts[i],
          embedding: embedding
        });
        existingMetadata.push(metadatas[i]);
      }
      
      console.log(`Saving ${existingVectors.length} vectors and ${existingMetadata.length} metadata entries`);
      
      // Save updated vectors and metadata
      await fs.promises.writeFile(this.vectorStoreFile, JSON.stringify(existingVectors), 'utf8');
      await fs.promises.writeFile(this.metadataFile, JSON.stringify(existingMetadata), 'utf8');
      
      console.log(`Successfully stored ${texts.length} chunks for user ${this.userId}`);
      return { success: true, count: texts.length };
    } catch (error) {
      console.error('Error adding texts to vector store:', error);
      throw error;
    }
  }

  async clearVectorstore() {
    try {
      await fs.promises.writeFile(this.vectorStoreFile, JSON.stringify([]), 'utf8');
      await fs.promises.writeFile(this.metadataFile, JSON.stringify([]), 'utf8');
      return { success: true };
    } catch (error) {
      console.error('Error clearing vector store:', error);
      throw error;
    }
  }

  async processFile(fileBuffer, fileName, fileType) {
    let text = '';
    
    try {
      if (fileType === 'application/pdf') {
        text = await this.extractTextFromPDF(fileBuffer);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await this.extractTextFromDOCX(fileBuffer);
      } else {
        throw new Error('Unsupported file type');
      }

      return text;
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  }

  async extractTextFromPDF(buffer) {
    const pdfLib = await initPdfJs();
    
    try {
      const loadingTask = pdfLib.getDocument({
        data: new Uint8Array(buffer),
        disableFontFace: true,
        verbosity: 0
      });
      
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  async extractTextFromDOCX(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error('Error extracting text from DOCX:', error);
      throw new Error('Failed to extract text from DOCX');
    }
  }

  async storeChromaFunction(content, fileName) {
    try {
      console.log('Processing document for user:', this.userId);
      
      // Initialize embeddings if not already done
      if (!this.embeddings) {
        await this.initializeEmbeddings();
      }

      // Split text into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const docs = [new Document({ pageContent: content, metadata: { source: fileName } })];
      const chunks = await textSplitter.splitDocuments(docs);

      // Extract texts and metadata
      const texts = chunks.map(doc => doc.pageContent);
      const metadatas = chunks.map(doc => ({ 
        source: fileName, 
        userId: this.userId,
        timestamp: new Date().toISOString()
      }));

      // Add to vector store
      const result = await this.addTextsToVectorstore(texts, metadatas);
      
      console.log(`Successfully stored ${result.count} chunks for ${fileName}`);
      return result;
    } catch (error) {
      console.error('Error in storeChromaFunction:', error);
      throw error;
    }
  }

  async getUserFiles() {
    try {
      const dataFiles = UserManager.listUserFiles(this.userId);
      return dataFiles.map(fileName => ({
        name: fileName,
        type: fileName.endsWith('.pdf') ? 'PDF' : fileName.endsWith('.docx') ? 'DOCX' : 'Unknown',
        uploaded_at: new Date().toISOString() // You might want to store actual timestamps
      }));
    } catch (error) {
      console.error('Error getting user files:', error);
      return [];
    }
  }

  async clearUserData() {
    try {
      UserManager.deleteUserData(this.userId);
      return { success: true, message: 'All user data cleared successfully' };
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }
}