# Flask Backend Integration

This document explains how to run the Flask backend for quiz generation and notes extraction from YouTube videos.

## Setup Instructions

### 1. Navigate to the Flask backend directory
```bash
cd quiz--and-rag
```

### 2. Install Python dependencies
```bash
pip install -r flask_requirements.txt
```

### 3. Set up environment variables
Create a `.env` file in the `quiz--and-rag` directory with:
```
FLASK_SECRET_KEY=your-secret-key-here
GOOGLE_API_KEY=your-youtube-api-key
```

### 4. Run the Flask server
```bash
python app.py
```

The Flask server will start on `http://localhost:5000`

## API Endpoints

### Process YouTube Video
- **POST** `/api/user/{user_id}/upload/youtube`
- Body: `{ "url": "https://www.youtube.com/watch?v=VIDEO_ID" }`
- Returns: `{ "cache_id": "yt_user_video_id", "user_id": "user_id" }`

### Generate Quiz
- **POST** `/api/user/{user_id}/generate/quiz`
- Body: `{ "cache_id": "yt_user_video_id", "num_questions": 5, "difficulty": "mixed" }`
- Returns: `{ "quiz": { "questions": [...] } }`

### Generate Notes
- **POST** `/api/user/{user_id}/generate/notes`
- Body: `{ "cache_id": "yt_user_video_id" }`
- Returns: `{ "notes": {...}, "markdown": "# Notes content..." }`

## Frontend Integration

The Next.js frontend (`components/video-sidebar.jsx`) is configured to:
1. Call the Flask backend when "Generate Quiz" button is clicked
2. Display AI-generated quiz questions with multiple choice answers
3. Call the Flask backend when "Generate Notes" button is clicked
4. Display formatted markdown notes extracted from video content

## Features

- **AI Quiz Generation**: Creates multiple choice questions from YouTube video transcripts
- **Study Notes**: Extracts and formats comprehensive notes in markdown
- **Caching**: Results are cached for faster subsequent requests
- **User Separation**: Each user has isolated data and cache
- **Fallback**: Mock data is shown if Flask backend is unavailable

## Troubleshooting

1. **CORS Issues**: Flask backend has CORS enabled for localhost:3000
2. **API Keys**: Ensure YouTube Data API key is properly configured
3. **Dependencies**: Make sure all Python packages are installed
4. **Port Conflicts**: Flask runs on port 5000, ensure it's available

## Next Steps

1. Start the Flask backend: `cd quiz--and-rag && python app.py`
2. Start the Next.js frontend: `npm run dev`
3. Navigate to a video page and test the "Generate Quiz" and "Generate Notes" buttons