import { NextRequest, NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdfProcessor';
import { NotesGenerator } from '@/lib/notesGenerator';

export async function POST(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { cache_id } = body;

    console.log(`📝 Generating notes for user ${userId}`);
    console.log(`Cache ID: ${cache_id}`);

    // Get user's vector database
    const pdfProcessor = new PDFProcessor(userId);
    
    // Check if vector store exists
    try {
      await pdfProcessor.initializeVectorStore();
    } catch (error) {
      return NextResponse.json({ 
        error: 'No documents found. Please upload some documents first.' 
      }, { status: 400 });
    }

    // Get documents from the vector database
    let results;
    if (cache_id) {
      // If cache_id is provided, extract video ID from it and filter by source
      const videoId = cache_id.split('_').pop(); 
      const sourceFilter = `youtube_${videoId}`;
      
      results = await pdfProcessor.getDocumentsBySource(sourceFilter);
      console.log(`📚 Found ${results.documents?.length || 0} documents for video ${videoId}`);
    } else {
      results = await pdfProcessor.getAllDocuments();
      console.log(`📚 Found ${results.documents?.length || 0} documents total`);
    }

    if (!results.documents || results.documents.length === 0) {
      const errorMsg = cache_id 
        ? 'No content available for this video. Please process the video first.'
        : 'No content available for notes generation. Please upload documents first.';
      
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Extract text chunks from the vector database
    const textChunks = results.documents;
    console.log(`📊 Processing ${textChunks.length} text chunks for notes`);

    // Check if this is fallback content
    const sampleContent = textChunks.slice(0, 3).join(' ');
    const isFallbackContent = 
      sampleContent.includes('does not have an available transcript') ||
      sampleContent.includes('transcript is not available') ||
      sampleContent.includes('fallback when video transcripts are not available') ||
      sampleContent.includes('Educational Video Analysis - YouTube Video ID');
    
    if (isFallbackContent) {
      console.warn('⚠️  FALLBACK CONTENT DETECTED in notes generation!');
      console.warn('⚠️  Notes will be generic, not video-specific.');
    } else {
      console.log('✅ Real transcript content detected for notes!');
    }

    // Generate notes using NotesGenerator
    const notesGenerator = new NotesGenerator();
    const notesData = await notesGenerator.generateDetailedNotes(textChunks, {
      similarity_threshold: 0.85,
      batch_size: 5,
      include_summary: true,
      include_key_terms: true
    });

    if (!notesData || !notesData.sections || notesData.sections.length === 0) {
      throw new Error('Failed to generate notes - no sections created');
    }

    console.log(`✅ Successfully generated notes with ${notesData.sections.length} sections`);

    // Convert notes to markdown format for display
    const markdown = convertNotesToMarkdown(notesData);

    return NextResponse.json({
      notes_id: `notes_${userId}_${Date.now()}`,
      user_id: userId,
      notes: notesData,
      markdown: markdown,
      metadata: {
        total_sections: notesData.sections.length,
        generated_at: new Date().toISOString(),
        source: cache_id || 'general',
        generator: 'notes_ai',
        source_chunks: textChunks.length,
        has_summary: !!notesData.summary,
        is_fallback: isFallbackContent
      }
    });

  } catch (error) {
    console.error('❌ Error generating notes:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({
      error: 'Failed to generate notes',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

/**
 * Convert structured notes JSON to markdown format
 */
function convertNotesToMarkdown(notesData) {
  let markdown = '';

  // Add title
  if (notesData.title) {
    markdown += `# ${notesData.title}\n\n`;
  }

  // Add summary if available
  if (notesData.summary) {
    markdown += `## Summary\n\n${notesData.summary}\n\n`;
    markdown += `---\n\n`;
  }

  // Add sections
  if (notesData.sections && Array.isArray(notesData.sections)) {
    notesData.sections.forEach((section, sectionIndex) => {
      // Section title
      if (section.title) {
        markdown += `## ${section.title}\n\n`;
      }

      // Section content
      if (section.content) {
        markdown += `${section.content}\n\n`;
      }

      // Subsections
      if (section.subsections && Array.isArray(section.subsections)) {
        section.subsections.forEach((subsection) => {
          if (subsection.subtitle) {
            markdown += `### ${subsection.subtitle}\n\n`;
          }

          // Points as bullet list
          if (subsection.points && Array.isArray(subsection.points)) {
            subsection.points.forEach(point => {
              markdown += `- ${point}\n`;
            });
            markdown += `\n`;
          }
        });
      }

      // Key terms
      if (section.key_terms && Array.isArray(section.key_terms) && section.key_terms.length > 0) {
        markdown += `#### Key Terms\n\n`;
        section.key_terms.forEach(term => {
          if (term.term && term.definition) {
            markdown += `- **${term.term}**: ${term.definition}\n`;
          }
        });
        markdown += `\n`;
      }

      // Examples
      if (section.examples && Array.isArray(section.examples) && section.examples.length > 0) {
        markdown += `#### Examples\n\n`;
        section.examples.forEach((example, idx) => {
          markdown += `${idx + 1}. ${example}\n`;
        });
        markdown += `\n`;
      }

      // Add separator between sections (except last one)
      if (sectionIndex < notesData.sections.length - 1) {
        markdown += `---\n\n`;
      }
    });
  }

  // Add metadata footer
  markdown += `\n---\n\n`;
  markdown += `*Generated: ${notesData.created_at || new Date().toISOString()}*\n`;
  if (notesData.total_sections) {
    markdown += `*Total Sections: ${notesData.total_sections}*\n`;
  }

  return markdown;
}
