export const Config = {
  // File Upload Configuration
  MAX_CONTENT_LENGTH: 16 * 1024 * 1024, // 16MB max file size
  ALLOWED_EXTENSIONS: ['pdf', 'docx'],
  
  // Quiz Generation Configuration
  DEFAULT_BATCH_SIZE: 7,
  DEFAULT_SIMILARITY_THRESHOLD: 0.85,
  MAX_QUESTIONS_PER_QUIZ: 50,
  
  // API Configuration
  DEFAULT_CHUNK_SIZE: 2000,
  DEFAULT_CHUNK_OVERLAP: 100,
  
  // Environment variables
  getGroqApiKey: () => process.env.GROQ_API_KEY,
  getGoogleApiKey: () => process.env.GOOGLE_API_KEY,
};