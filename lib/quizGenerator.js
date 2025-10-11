import { GoogleGenerativeAI } from '@google/generative-ai';

export class QuizGenerator {
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

  async generateQuizFromBatch(batchText, params) {
    // Check if this is fallback content
    const isFallbackContent = batchText.includes('does not have an available transcript');
    
    let transcriptPrompt;
    
    if (isFallbackContent) {
      // For videos without transcripts, generate general educational questions
      transcriptPrompt = `
You are a teacher creating educational quiz questions. The video content is not available, but you can create relevant questions based on common educational topics. Generate quiz questions that would be appropriate for educational content.

Create ${params.num_questions || 5} multiple-choice questions with the following format:

1. A "question" string.
2. An "options" list with exactly 4 options.
3. An "answer" string indicating the correct option.
4. A "difficulty" string which can be "easy", "medium", or "hard".

Focus on general knowledge, critical thinking, and educational concepts that would be relevant to video-based learning.

Output the quiz strictly in JSON format like this:

[
  {
    "question": "What is an important skill when learning from video content?",
    "options": ["Passive watching", "Active note-taking", "Fast-forwarding", "Multitasking"],
    "answer": "Active note-taking",
    "difficulty": "easy",
    "explanation": "Active note-taking helps retain information and engage with the content."
  }
]

Make sure the output is parsable. Do not include any other characters other than the structure I have specified.
`;
    } else {
      // Original prompt for videos with transcripts
      transcriptPrompt = `
You are a teacher creating quizzes from a lecture transcript. Using the text below, generate a quiz with a question for each important topic. The quiz should include **multiple-choice questions (MCQs)** only. Each question should have:

1. A "question" string.
2. An "options" list with exactly 4 options.
3. An "answer" string indicating the correct option.
4. A "difficulty" string which can be "easy", "medium", or "hard".

Output the quiz strictly in JSON format like this:

[
  {
    "question": "Example question?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option B",
    "difficulty": "medium",
    "explanation": "Explanation for the correct answer."
  }
]

Make sure the output is parsable. Do not include any other characters other than the structure I have specified.

**Transcript:**
"${batchText}"
`;
    }

    try {
      const result = await this.model.generateContent(transcriptPrompt);
      let responseText = result.response.text() || '';
      
      // Clean the response
      responseText = responseText.trim();
      if (responseText.startsWith('```json')) {
        responseText = responseText.slice(7);
      } else if (responseText.startsWith('```')) {
        responseText = responseText.slice(3);
      }
      if (responseText.endsWith('```')) {
        responseText = responseText.slice(0, -3);
      }
      responseText = responseText.trim();

      // Extract JSON array if embedded in text
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }

      // Parse JSON
      let questions;
      try {
        questions = JSON.parse(responseText);
      } catch (error) {
        // Try to fix common JSON issues
        responseText = responseText.replace(/\n/g, ' ').replace(/\r/g, '');
        responseText = responseText.replace(/,\s*]/g, ']'); // Remove trailing commas
        responseText = responseText.replace(/,\s*}/g, '}'); // Remove trailing commas in objects
        questions = JSON.parse(responseText);
      }

      // Validate question format
      const validatedQuestions = [];
      for (const q of questions) {
        if (q.question && q.options && q.answer && q.difficulty) {
          if (!q.explanation) {
            q.explanation = 'No explanation provided.';
          }
          validatedQuestions.push(q);
        }
      }

      // Apply filters from params if provided
      let filteredQuestions = validatedQuestions;
      if (params.difficulty && params.difficulty !== 'mixed') {
        filteredQuestions = filteredQuestions.filter(q => q.difficulty === params.difficulty);
      }

      if (params.num_questions) {
        filteredQuestions = filteredQuestions.slice(0, params.num_questions);
      }

      return filteredQuestions;
    } catch (error) {
      console.error('Error generating quiz:', error);
      return [];
    }
  }

  async generateQuiz(textChunks, params = {}) {
    // Set default parameters
    const defaultParams = {
      num_questions: 10,
      difficulty: 'mixed',
      similarity_threshold: 0.85,
      batch_size: 7
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

    // Generate questions from each batch
    const allQuestions = [];
    let questionsNeeded = finalParams.num_questions;

    for (const batch of batchedChunks) {
      if (allQuestions.length >= questionsNeeded) {
        break;
      }

      // Adjust number of questions for this batch
      const remaining = questionsNeeded - allQuestions.length;
      const batchParams = {
        ...finalParams,
        num_questions: Math.min(remaining, 5) // Max 5 questions per batch
      };

      const questions = await this.generateQuizFromBatch(batch, batchParams);
      allQuestions.push(...questions);
    }

    return allQuestions.slice(0, questionsNeeded);
  }
}