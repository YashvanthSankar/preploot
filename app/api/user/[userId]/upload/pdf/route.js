import { NextRequest, NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdfProcessor';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import fs from 'fs';
import path from 'path';

export async function POST(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.name === '') {
      return NextResponse.json({ error: 'No file selected' }, { status: 400 });
    }

    // Check file type
    const allowedExtensions = ['pdf', 'docx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF and DOCX files are allowed.' 
      }, { status: 400 });
    }

    // Check file size (16MB limit)
    const maxSize = 16 * 1024 * 1024; // 16MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 16MB.' 
      }, { status: 400 });
    }

    // Create PDF processor for this user
    const pdfProcessor = new PDFProcessor(userId);
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save file to user's data directory
    const filePath = path.join(pdfProcessor.dataFolder, file.name);
    await fs.promises.writeFile(filePath, buffer);
    
    // Process the file to extract text
    const extractedText = await pdfProcessor.processFile(buffer, file.name, file.type);
    
    // Initialize embeddings
    await pdfProcessor.initializeEmbeddings();
    
    // Split text into chunks and add to vector storage
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 100
    });
    
    const chunks = await textSplitter.createDocuments([extractedText], [{
      source: file.name,
      type: file.type,
      userId: userId,
      uploadDate: new Date().toISOString()
    }]);
    
    const texts = chunks.map(chunk => chunk.pageContent);
    const metadatas = chunks.map(chunk => chunk.metadata);
    
    // Add to vector storage
    await pdfProcessor.addTextsToVectorstore(texts, metadatas);
    
    return NextResponse.json({
      message: 'File uploaded and processed successfully',
      filename: file.name,
      file_path: filePath,
      chunks_processed: chunks.length,
      user_id: userId
    });

  } catch (error) {
    console.error('Error uploading PDF:', error);
    return NextResponse.json({
      error: 'Failed to upload and process file',
      details: error.message
    }, { status: 500 });
  }
}