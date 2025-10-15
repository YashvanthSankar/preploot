import { GoogleGenerativeAI } from '@google/generative-ai';

export class NotesGenerator {
  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️  No GOOGLE_API_KEY found, notes generation will fail');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      console.log('🚀 NotesGenerator: Initialized with Google AI');
    }
  }

  deduplicateChunks(chunks, threshold = 0.85) {
    // Simple deduplication based on text similarity
    if (chunks.length <= 1) return chunks;
    
    const keepIndices = [];
    const seen = new Set();
    
    for (let i = 0; i < chunks.length; i++) {
      if (seen.has(i)) continue;
      
      keepIndices.push(i);
      
      for (let j = i + 1; j < chunks.length; j++) {
        // Simple similarity check - count common words
        const words1 = chunks[i].toLowerCase().split(/\s+/);
        const words2 = chunks[j].toLowerCase().split(/\s+/);
        const commonWords = words1.filter(word => words2.includes(word));
        const similarity = commonWords.length / Math.max(words1.length, words2.length);
        
        if (similarity > threshold) {
          seen.add(j);
        }
      }
    }
    
    return keepIndices.map(i => chunks[i]);
  }

  batchChunks(chunks, batchSize = 5) {
    const batches = [];
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const combined = batch.join('\n\n--- SECTION ---\n\n');
      batches.push(combined);
    }
    return batches;
  }

  cleanJsonResponse(responseText) {
    // Remove markdown code blocks
    responseText = responseText.replace(/```json\s*/gi, '');
    responseText = responseText.replace(/```\s*/g, '');
    
    // Remove any leading/trailing whitespace
    responseText = responseText.trim();
    
    // Try to extract JSON object if embedded in other text
    const match = responseText.match(/\{[\s\S]*\}/);
    if (match) {
      responseText = match[0];
    }
    
    // Remove any text before the first {
    const firstBrace = responseText.indexOf('{');
    if (firstBrace > 0) {
      responseText = responseText.substring(firstBrace);
    }
    
    // Remove any text after the last }
    const lastBrace = responseText.lastIndexOf('}');
    if (lastBrace !== -1 && lastBrace < responseText.length - 1) {
      responseText = responseText.substring(0, lastBrace + 1);
    }
    
    return responseText.trim();
  }

  async generateNotesFromBatch(batchText, batchIndex, totalBatches, model) {
    console.log(`📝 Generating notes from batch ${batchIndex + 1}/${totalBatches}`);
    console.log(`📊 Batch content length: ${batchText.length} characters`);
    
    // Check if the content is fallback content (no transcript available) - multiple detection methods
    const isFallbackContent = 
      batchText.includes('fallback content') || 
      batchText.includes('no transcript available') ||
      batchText.includes('general educational content') ||
      batchText.includes('does not have an available transcript') ||
      batchText.includes('transcript is not available') ||
      batchText.includes('fallback when video transcripts are not available') ||
      batchText.includes('Educational Video Analysis - YouTube Video ID');
    
    if (isFallbackContent) {
      console.warn('⚠️  FALLBACK CONTENT DETECTED in batch! Using generic notes generation.');
    } else {
      console.log('✅ Real transcript content in batch!');
    }

    let notesPrompt;
    
    if (isFallbackContent) {
      notesPrompt = `
You are an expert note-taker creating comprehensive, well-structured notes. The following content is general educational material about a topic (not from a specific video transcript).

IMPORTANT: Generate ALL notes in ENGLISH only. Do not use any other language.

Create detailed notes that:
1. Organize information into clear topics and subtopics
2. Extract key concepts, definitions, and important points
3. Include relevant examples and explanations
4. Use bullet points for clarity
5. Highlight important terminology

Output the notes in JSON format with this EXACT structure (ensure proper JSON syntax):

{
  "sections": [
    {
      "title": "Main Topic Title",
      "content": "Overview or introduction to this section",
      "subsections": [
        {
          "subtitle": "Subtopic Title",
          "points": [
            "Key point 1",
            "Key point 2",
            "Key point 3"
          ]
        }
      ],
      "key_terms": [
        {
          "term": "Important Term",
          "definition": "Definition of the term"
        }
      ],
      "examples": [
        "Example 1 explanation",
        "Example 2 explanation"
      ]
    }
  ]
}

Make sure the output is valid JSON with proper quotes, commas, and brackets. Do not include any text before or after the JSON.

**Content:**
${batchText}
`;
    } else {
      notesPrompt = `
You are an expert note-taker creating comprehensive, well-structured notes from the following video transcript content (which contains multiple sections separated by "--- SECTION ---").

IMPORTANT: Generate ALL notes in ENGLISH only. Even if the transcript is in another language, translate and create notes in English.

Create detailed notes that:
1. Organize information into clear topics and subtopics
2. Extract key concepts, definitions, and important points
3. Include relevant examples and explanations
4. Use bullet points for clarity
5. Highlight important terminology

Output the notes in JSON format with this EXACT structure (ensure proper JSON syntax):

{
  "sections": [
    {
      "title": "Main Topic Title",
      "content": "Overview or introduction to this section",
      "subsections": [
        {
          "subtitle": "Subtopic Title",
          "points": [
            "Key point 1",
            "Key point 2",
            "Key point 3"
          ]
        }
      ],
      "key_terms": [
        {
          "term": "Important Term",
          "definition": "Definition of the term"
        }
      ],
      "examples": [
        "Example 1 explanation",
        "Example 2 explanation"
      ]
    }
  ]
}

Make sure the output is valid JSON with proper quotes, commas, and brackets. Do not include any text before or after the JSON.

**Content:**
${batchText}
`;
    }

    try {
      console.log('🤖 Calling AI model for notes generation...');
      const result = await model.generateContent(notesPrompt);
      let responseText = result.response.text() || '';
      
      console.log('📝 Raw AI response length:', responseText.length);
      
      // Clean the response
      responseText = this.cleanJsonResponse(responseText);
      console.log('🧹 Cleaned response length:', responseText.length);

      try {
        const notes = JSON.parse(responseText);
        console.log(`✅ Successfully parsed notes JSON with ${notes.sections?.length || 0} sections`);
        return notes;
      } catch (parseError) {
        console.error(`❌ JSON parsing error for batch ${batchIndex + 1}:`, parseError.message);
        console.error('Failed JSON content (first 500 chars):', responseText.substring(0, 500));
        
        // Try to fix common JSON issues
        try {
          // Remove trailing commas
          let fixedJson = responseText.replace(/,(\s*[}\]])/g, '$1');
          // Fix unescaped quotes in strings
          fixedJson = fixedJson.replace(/([^\\])"/g, '$1\\"');
          // Try parsing again
          const notes = JSON.parse(fixedJson);
          console.log('✅ Successfully parsed notes after JSON fixes');
          return notes;
        } catch (fixError) {
          console.error('❌ Failed to fix JSON, using fallback section');
          return {
            sections: [{
              title: `Section ${batchIndex + 1}`,
              content: "Error processing this section - JSON parsing failed",
              subsections: [],
              key_terms: [],
              examples: []
            }]
          };
        }
      }
    } catch (error) {
      console.error(`❌ Error generating notes for batch ${batchIndex + 1}:`, error);
      return {
        sections: [{
          title: `Section ${batchIndex + 1}`,
          content: "Error processing this section",
          subsections: [],
          key_terms: [],
          examples: []
        }]
      };
    }
  }

  async generateDetailedNotes(textChunks, params = {}) {
    if (!this.genAI) {
      console.error('❌ Google AI not initialized - cannot generate notes');
      throw new Error('Google AI not configured. Please set GOOGLE_API_KEY environment variable.');
    }

    const defaultParams = {
      similarity_threshold: 0.85,
      batch_size: 5,
      include_summary: true,
      include_key_terms: true
    };

    const finalParams = { ...defaultParams, ...params };

    console.log(`📊 Processing ${textChunks.length} chunks with batch size ${finalParams.batch_size}`);

    // Deduplicate chunks
    const uniqueChunks = this.deduplicateChunks(
      textChunks,
      finalParams.similarity_threshold
    );
    console.log(`✅ Deduplicated to ${uniqueChunks.length} unique chunks`);

    // Batch chunks
    const batchedChunks = this.batchChunks(
      uniqueChunks,
      finalParams.batch_size
    );
    console.log(`📦 Created ${batchedChunks.length} batches`);

    // Initialize the model
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // Generate notes from each batch
    const allSections = [];
    
    for (let i = 0; i < batchedChunks.length; i++) {
      const batch = batchedChunks[i];
      console.log(`🔄 Processing batch ${i + 1}/${batchedChunks.length}`);
      
      try {
        const batchNotes = await this.generateNotesFromBatch(batch, i, batchedChunks.length, model);
        
        if (batchNotes.sections && Array.isArray(batchNotes.sections)) {
          allSections.push(...batchNotes.sections);
          console.log(`✅ Added ${batchNotes.sections.length} sections from batch ${i + 1}`);
        }
      } catch (error) {
        console.error(`❌ Error processing batch ${i + 1}:`, error.message);
        // Add a fallback section for failed batches
        allSections.push({
          title: `Section ${i + 1} (Error)`,
          content: "Unable to generate notes for this section due to processing error.",
          subsections: [],
          key_terms: [],
          examples: []
        });
      }
    }

    console.log(`✅ Generated total of ${allSections.length} sections`);

    if (allSections.length === 0) {
      throw new Error('No sections were generated from the content');
    }

    // Combine all sections and generate summary
    const finalNotes = {
      title: "Generated Notes",
      created_at: new Date().toISOString(),
      sections: allSections,
      summary: "",
      total_sections: allSections.length
    };

    // Generate overall summary if requested
    if (finalParams.include_summary && allSections.length > 0) {
      try {
        console.log('📝 Generating overall summary...');
        finalNotes.summary = await this.generateSummary(allSections, model);
      } catch (error) {
        console.warn('⚠️  Failed to generate summary:', error.message);
        finalNotes.summary = "Summary generation failed.";
      }
    }

    return finalNotes;
  }

  async generateSummary(sections, model) {
    const sectionTexts = sections.map(section => {
      let text = `${section.title}: ${section.content}`;
      if (section.subsections) {
        section.subsections.forEach(sub => {
          text += ` ${sub.subtitle}: ${sub.points?.join(', ') || ''}`;
        });
      }
      return text;
    }).join(' ');

    const summaryPrompt = `
Create a concise summary (2-3 paragraphs) of the following notes content. Focus on the main themes, key concepts, and important takeaways:

${sectionTexts}

Summary:
`;

    try {
      const result = await model.generateContent(summaryPrompt);
      return result.response.text() || "Summary generation failed.";
    } catch (error) {
      console.error('Error generating summary:', error);
      return "Summary generation failed.";
    }
  }
}