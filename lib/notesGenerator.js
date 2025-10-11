import { GoogleGenerativeAI } from '@google/generative-ai';

export class NotesGenerator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
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
    responseText = responseText.replace(/```json\s*/g, '');
    responseText = responseText.replace(/```\s*/g, '');
    
    const match = responseText.match(/\{.*\}/s);
    if (match) {
      responseText = match[0];
    }
    
    return responseText.trim();
  }

  async generateNotesFromBatch(batchText, batchIndex, totalBatches) {
    // Check if the content is fallback content (no transcript available)
    const isFallbackContent = batchText.includes('fallback content') || 
                             batchText.includes('no transcript available') ||
                             batchText.includes('general educational content');

    let notesPrompt;
    
    if (isFallbackContent) {
      notesPrompt = `
You are an expert note-taker creating comprehensive, well-structured notes. The following content is general educational material about a topic (not from a specific video transcript).

Create detailed notes that:
1. Organize information into clear topics and subtopics
2. Extract key concepts, definitions, and important points
3. Include relevant examples and explanations
4. Use bullet points for clarity
5. Highlight important terminology

Output the notes in JSON format with this structure:

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

Make sure the output is valid JSON. Do not include any other text outside the JSON structure.

**Content:**
${batchText}
`;
    } else {
      notesPrompt = `
You are an expert note-taker creating comprehensive, well-structured notes from the following video transcript content (which contains multiple sections separated by "--- SECTION ---").

Create detailed notes that:
1. Organize information into clear topics and subtopics
2. Extract key concepts, definitions, and important points
3. Include relevant examples and explanations
4. Use bullet points for clarity
5. Highlight important terminology

Output the notes in JSON format with this structure:

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

Make sure the output is valid JSON. Do not include any other text outside the JSON structure.

**Content:**
${batchText}
`;
    }

    try {
      const result = await this.model.generateContent(notesPrompt);
      let responseText = result.response.text() || '';
      responseText = this.cleanJsonResponse(responseText);

      try {
        const notes = JSON.parse(responseText);
        return notes;
      } catch (error) {
        console.error(`Error parsing JSON for batch ${batchIndex + 1}:`, error);
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
    } catch (error) {
      console.error(`Error generating notes for batch ${batchIndex + 1}:`, error);
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
    const defaultParams = {
      similarity_threshold: 0.85,
      batch_size: 5,
      include_summary: true,
      include_key_terms: true
    };

    const finalParams = { ...defaultParams, ...params };

    // Deduplicate chunks
    const uniqueChunks = this.deduplicateChunks(
      textChunks,
      finalParams.similarity_threshold
    );

    // Batch chunks
    const batchedChunks = this.batchChunks(
      uniqueChunks,
      finalParams.batch_size
    );

    // Generate notes from each batch
    const allSections = [];
    
    for (let i = 0; i < batchedChunks.length; i++) {
      const batch = batchedChunks[i];
      const batchNotes = await this.generateNotesFromBatch(batch, i, batchedChunks.length);
      
      if (batchNotes.sections) {
        allSections.push(...batchNotes.sections);
      }
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
      finalNotes.summary = await this.generateSummary(allSections);
    }

    return finalNotes;
  }

  async generateSummary(sections) {
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
      const result = await this.model.generateContent(summaryPrompt);
      return result.response.text() || "Summary generation failed.";
    } catch (error) {
      console.error('Error generating summary:', error);
      return "Summary generation failed.";
    }
  }
}