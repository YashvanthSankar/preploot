// Mock Quiz Generator for immediate functionality
export class MockQuizGenerator {
  constructor() {
    console.log('🚀 Using MockQuizGenerator for immediate functionality');
  }

  async generateQuiz(textChunks, options = {}) {
    const { num_questions = 5, difficulty = 'mixed' } = options;
    
    console.log(`Generating ${num_questions} mock quiz questions from ${textChunks.length} chunks...`);
    
    // Create realistic mock questions based on the content
    const questions = [];
    for (let i = 0; i < Math.min(num_questions, 10); i++) {
      const question = this.generateMockQuestion(textChunks, i, difficulty);
      questions.push(question);
    }
    
    return questions;
  }

  generateMockQuestion(textChunks, index, difficulty) {
    // Extract some keywords from the text chunks for realistic questions
    const allText = textChunks.join(' ').toLowerCase();
    const words = allText.split(/\s+/).filter(word => word.length > 4);
    const uniqueWords = [...new Set(words)].slice(0, 20);
    
    // Template questions that work for educational content
    const templates = [
      {
        question: "What is the main concept discussed in this educational content?",
        options: [
          "Primary educational concept",
          "Secondary topic area", 
          "Related subject matter",
          "Background information"
        ],
        answer: "Primary educational concept",
        difficulty: "easy"
      },
      {
        question: "Which of the following best describes the key principle covered?",
        options: [
          "Fundamental principle",
          "Supporting detail",
          "Introductory concept", 
          "Advanced application"
        ],
        answer: "Fundamental principle",
        difficulty: "medium"
      },
      {
        question: "What is the relationship between the main topics discussed?",
        options: [
          "Direct correlation",
          "Inverse relationship",
          "Independent concepts",
          "Hierarchical structure"
        ],
        answer: "Direct correlation", 
        difficulty: "medium"
      },
      {
        question: "How would you apply the concepts from this educational material?",
        options: [
          "Practical application",
          "Theoretical understanding",
          "Conceptual framework",
          "Problem-solving approach"
        ],
        answer: "Practical application",
        difficulty: "hard"
      },
      {
        question: "What is the significance of the main topic covered?",
        options: [
          "Educational importance",
          "Historical context",
          "Scientific relevance", 
          "Practical utility"
        ],
        answer: "Educational importance",
        difficulty: "easy"
      }
    ];
    
    const template = templates[index % templates.length];
    
    // Add some content-specific words if available
    if (uniqueWords.length > 0) {
      const keyword = uniqueWords[index % uniqueWords.length];
      template.question = template.question.replace('main concept', `concept of ${keyword}`);
    }
    
    return {
      question: template.question,
      options: template.options,
      answer: template.answer,
      difficulty: template.difficulty,
      explanation: `This question tests understanding of the key concepts presented in the educational material. The correct answer relates to the primary focus of the content.`
    };
  }

  async generateQuizFromBatch(textChunks, options = {}) {
    return this.generateQuiz(textChunks, options);
  }
}