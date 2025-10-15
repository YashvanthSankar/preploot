import { GoogleGenerativeAI } from '@google/generative-ai';

export class QuizGenerator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    console.log('🚀 QuizGenerator: Initialized with Google AI');
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
    const { num_questions = 5, difficulty = 'medium' } = params;
    
    console.log(`🎯 Generating ${num_questions} quiz questions with difficulty: ${difficulty}`);
    console.log(`📊 Content length: ${batchText.length} characters`);
    console.log(`📄 Content preview: ${batchText.substring(0, 200)}...`);
    
    // Determine content type
    const isMetadataContent = batchText.includes('VIDEO CONTENT ANALYSIS') && 
                              batchText.includes('Note: This content is derived from video metadata');
    const isFallbackContent = 
      batchText.includes('does not have an available transcript') ||
      batchText.includes('transcript is not available') ||
      batchText.includes('fallback when video transcripts are not available') ||
      batchText.includes('Educational Video Analysis - YouTube Video ID');
    
    let contentType = 'transcript';
    if (isMetadataContent) {
      contentType = 'metadata';
      console.log('📋 METADATA CONTENT DETECTED! Using title/description-based quiz generation.');
    } else if (isFallbackContent) {
      contentType = 'fallback';
      console.warn('⚠️ FALLBACK CONTENT DETECTED! Using generic quiz generation.');
      console.warn('⚠️ This means the YouTube video data was NOT fetched successfully.');
    } else {
      console.log('✅ Real transcript content detected! Generating contextual questions.');
    }
    
    let transcriptPrompt;
    
    if (contentType === 'metadata') {
      // For videos without captions but with good metadata (title, description)
      transcriptPrompt = `You are an expert educator creating quiz questions based on educational video metadata (title, description, and context). Your goal is to create relevant questions about the video's topic.

CRITICAL INSTRUCTIONS:
1. Generate ALL questions in ENGLISH only
2. Create ${num_questions} multiple-choice questions at ${difficulty} difficulty level
3. Questions MUST be based on the topics, concepts, and ideas mentioned in the video title and description
4. Focus on testing understanding of the subject matter described in the video metadata
5. Use specific terms, concepts, and topics explicitly mentioned in the title/description
6. Make questions that someone who watched this video would be able to answer
7. Avoid generic questions - be specific to the topics this video covers

VIDEO INFORMATION PROVIDED:
---
${batchText}
---

QUESTION CREATION STRATEGY:
- Extract key concepts from the video title
- Use topics mentioned in the description
- Reference the educational goals stated
- Ask about the main subject matter
- Test understanding of the concepts the video teaches

DIFFICULTY GUIDELINES:
- Easy: Basic understanding of main topic from title/description
- Medium: Apply concepts mentioned in description to scenarios
- Hard: Synthesize multiple concepts or analyze deeper implications

OUTPUT FORMAT (strict JSON):
[
  {
    "question": "Based on the video about [topic from title], what is [concept from description]?",
    "options": [
      "Correct answer using specific terms from description",
      "Plausible but incorrect interpretation",
      "Related but wrong concept",
      "Another reasonable-sounding but incorrect option"
    ],
    "answer": "Correct answer using specific terms from description",
    "difficulty": "${difficulty}",
    "explanation": "This is correct because the video description specifically mentions [concept]. This video focuses on [main topic from title], and [reasoning based on description]."
  }
]

Generate ${num_questions} high-quality questions about the topics and concepts mentioned in this video's title and description. Questions should be answerable by someone who learned about these topics from this video.`;
    } else if (contentType === 'fallback') {
      // For complete failures - generic educational questions
      transcriptPrompt = `You are a teacher creating educational quiz questions. Generate ${num_questions} multiple-choice questions with difficulty level: ${difficulty}.

Create questions that would be appropriate for educational content about learning and study skills.

IMPORTANT: Generate ALL questions in ENGLISH only. Do not use any other language.

Output the quiz strictly in JSON format like this:
[
  {
    "question": "What is an effective study strategy?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A",
    "difficulty": "${difficulty}",
    "explanation": "Brief explanation why this answer is correct"
  }
]

Make sure the output is valid JSON. Do not include any other text.`;
    } else {
      // Enhanced prompt for videos with transcripts - generates deep, contextual questions
      transcriptPrompt = `You are an expert educator creating a challenging and insightful quiz based on the following lecture transcript. Your goal is to test true understanding, not just memorization.

CRITICAL INSTRUCTIONS:
1. Generate ALL questions in ENGLISH only, even if the source is in another language
2. Create ${num_questions} multiple-choice questions at ${difficulty} difficulty level
3. Questions MUST be directly based on the specific content, concepts, and ideas presented in the transcript
4. Focus on understanding, application, and critical thinking - NOT just recall of facts
5. Each question should test a different key concept or insight from the lecture
6. Make distractors (wrong options) plausible but clearly incorrect to those who understood the content
7. Avoid generic questions - be specific to THIS lecture's unique content and examples

DIFFICULTY GUIDELINES:
- Easy: Test basic comprehension of main ideas explicitly stated
- Medium: Require connecting ideas or applying concepts from the lecture  
- Hard: Demand synthesis, inference, or deep understanding of implications

QUESTION QUALITY REQUIREMENTS:
✓ Use specific examples, terms, or scenarios MENTIONED in the lecture
✓ Reference the speaker's actual arguments, evidence, or reasoning
✓ Test conceptual understanding, not trivial details
✓ Make students think about WHY something is true, not just WHAT was said
✓ Create realistic distractors that would appeal to someone who didn't fully understand
✗ Avoid questions that could be answered without reading the transcript
✗ Don't ask about generic concepts not specifically discussed
✗ Don't create questions where the answer is obvious without context

OUTPUT FORMAT (strict JSON):
[
  {
    "question": "Based on the speaker's argument about [specific concept], which of the following best illustrates [key point]?",
    "options": [
      "A detailed option referencing specific content",
      "A plausible but incorrect interpretation", 
      "Another reasonable-sounding but wrong option",
      "The correct answer with specific detail"
    ],
    "answer": "The correct answer with specific detail",
    "difficulty": "${difficulty}",
    "explanation": "The correct answer is X because the speaker specifically argued that [reasoning]. This was illustrated when they discussed [example]. The other options are incorrect because [why]."
  }
]

LECTURE TRANSCRIPT:
---
${batchText}
---

Generate ${num_questions} high-quality questions that truly test understanding of THIS specific lecture's content, arguments, and insights. Make me think!`;
    }

    try {
      console.log('🤖 Calling Google AI...');
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      const result = await model.generateContent(transcriptPrompt);
      let responseText = result.response.text() || '';
      
      console.log('📝 Raw response received, length:', responseText.length);
      
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
        console.log(`✅ Successfully parsed ${questions.length} questions from Google AI`);
      } catch (error) {
        console.warn('❌ JSON parsing failed, trying to fix:', error.message);
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
          validatedQuestions.push({
            question: q.question,
            options: Array.isArray(q.options) ? q.options : [],
            answer: q.answer,
            difficulty: q.difficulty,
            explanation: q.explanation || 'No explanation provided.'
          });
        }
      }

      console.log(`🎉 Returning ${validatedQuestions.length} validated questions`);
      return validatedQuestions;

    } catch (error) {
      console.error('❌ Google AI Error:', error.message);
      
      // Fallback to simple questions if Google AI fails
      console.log('🔄 Using fallback questions...');
      const fallbackQuestions = [];
      for (let i = 0; i < num_questions; i++) {
        fallbackQuestions.push({
          question: `What is an important concept from this educational content? (Question ${i + 1})`,
          options: [
            "A fundamental principle covered in the material",
            "A supporting detail mentioned briefly", 
            "An unrelated topic not discussed",
            "Background information only"
          ],
          answer: "A fundamental principle covered in the material",
          difficulty: difficulty,
          explanation: "This question tests understanding of key concepts from the educational material."
        });
      }
      return fallbackQuestions;
    }
  }

  async generateQuizFromBatchWithGoogleAI(batchText, params) {
    // Check if this is fallback content - multiple detection methods
    const isFallbackContent = 
      batchText.includes('does not have an available transcript') ||
      batchText.includes('transcript is not available') ||
      batchText.includes('fallback when video transcripts are not available') ||
      batchText.includes('Educational Video Analysis - YouTube Video ID');
    
    if (isFallbackContent) {
      console.warn('⚠️ FALLBACK CONTENT in GoogleAI method! Transcript fetch failed.');
    }
    
    let transcriptPrompt;
    
    if (isFallbackContent) {
      // For videos without transcripts, generate general educational questions
      transcriptPrompt = `
You are a teacher creating educational quiz questions. The video content is not available, but you can create relevant questions based on common educational topics. Generate quiz questions that would be appropriate for educational content.

IMPORTANT: Generate ALL questions in ENGLISH only. Do not use any other language.

Create ${params.num_questions || 5} multiple-choice questions with the following format:

1. A "question" string in ENGLISH.
2. An "options" list with exactly 4 options in ENGLISH.
3. An "answer" string indicating the correct option in ENGLISH.
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
You are a teacher creating quizzes from a lecture transcript. Using the text below, generate a quiz with a question for each important topic. The quiz should include **multiple-choice questions (MCQs)** only.

IMPORTANT: Generate ALL questions in ENGLISH only. Even if the transcript is in another language, translate and create questions in English.

Each question should have:

1. A "question" string in ENGLISH.
2. An "options" list with exactly 4 options in ENGLISH.
3. An "answer" string indicating the correct option in ENGLISH.
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