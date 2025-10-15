import { NextRequest, NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdfProcessor';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { message, max_results = 5 } = body;
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user's vector database
    const pdfProcessor = new PDFProcessor(userId);
    const collection = await pdfProcessor.getVectorstore();
    
    if (!collection) {
      return NextResponse.json({ 
        error: 'No documents found. Please upload some documents first to enable chat.' 
      }, { status: 400 });
    }

    // Query the vector database for relevant context
    const results = await pdfProcessor.queryVectorstore(message, max_results);
    
    if (!results.documents || results.documents[0].length === 0) {
      return NextResponse.json({ 
        error: 'No relevant information found in your documents.' 
      }, { status: 400 });
    }

    // Prepare context from search results
    const context = results.documents[0].map((doc, index) => ({
      content: doc,
      source: results.metadatas[0][index]?.source || 'Unknown',
      distance: results.distances[0][index] || 0
    }));

    // Create context string for the prompt
    const contextString = context
      .map(item => `Source: ${item.source}\\nContent: ${item.content}`)
      .join('\\n\\n---\\n\\n');

    // Initialize Google Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Create chat prompt
    const chatPrompt = `You are a helpful AI assistant that answers questions based on the provided context from the user's documents. 

Use the following context to answer the user's question. If the answer cannot be found in the context, say so clearly.

Context:
${contextString}

Question: ${message}

Please provide a helpful and accurate answer based on the context above. If you reference specific information, mention which source it came from.

Answer:`;

    // Get response from Google Gemini
    const result = await model.generateContent(chatPrompt);
    const response = result.response.text() || 'No response generated.';

    return NextResponse.json({
      user_id: userId,
      question: message,
      answer: response,
      context_used: context.map(item => ({
        source: item.source,
        relevance_score: 1 - item.distance // Convert distance to relevance score
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json({
      error: 'Failed to process chat message',
      details: error.message
    }, { status: 500 });
  }
}