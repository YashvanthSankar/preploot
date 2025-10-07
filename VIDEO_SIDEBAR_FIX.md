# Video Sidebar Quiz Format Fix

## Issue
The `video-sidebar.jsx` component was throwing an error:
```
Invalid quiz format received from backend
```

## Root Cause
The component expected a different format than what the Flask backend returns:

### Expected Format (Component):
```javascript
{
  questions: [
    {
      id: "abc123",
      question: "...",
      options: ["A", "B", "C", "D"],
      correct: 1,  // Index number
      difficulty: "easy",
      explanation: "..."
    }
  ]
}
```

### Actual Format (Backend):
```javascript
{
  message: "Quiz generated successfully",
  quiz: [
    {
      question: "...",
      options: ["A", "B", "C", "D"],
      answer: "B",  // String value, not index
      difficulty: "easy",
      explanation: "..."
    }
  ],
  user_id: "..."
}
```

## Solution Applied

### 1. Format Transformation
Updated the `loadQuiz()` function in `components/video-sidebar.jsx` to transform the backend response:

```javascript
if (data.quiz && Array.isArray(data.quiz)) {
  // Transform backend format to component format
  const transformedQuiz = {
    questions: data.quiz.map(q => ({
      id: Math.random().toString(36).substr(2, 9),  // Generate ID
      question: q.question,
      options: q.options,
      correct: q.options.indexOf(q.answer),  // Convert string to index
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || 'No explanation provided.'
    }))
  };
  
  setQuizData(transformedQuiz);
}
```

### 2. User ID Format Fix
The component was using `session.user.id` which doesn't exist. Updated to use email-based ID:

**Before:**
```javascript
const response = await fetch(`${FLASK_BASE_URL}/api/user/${session.user.id}/generate/quiz`, {
```

**After:**
```javascript
// Get user ID in the format expected by Flask
const getUserId = () => {
  if (!session?.user?.email) return null;
  return session.user.email.replace('@', '_').replace(/\./g, '_');
};

const userId = getUserId();
const response = await fetch(`${FLASK_BASE_URL}/api/user/${userId}/generate/quiz`, {
```

## Changes Made

### File: `components/video-sidebar.jsx`

1. **Added getUserId() helper function** (line ~38)
   - Converts email to Flask-compatible format
   - Example: `user@example.com` → `user_example_com`

2. **Updated processYouTubeVideo()** (line ~43)
   - Uses `getUserId()` instead of `session.user.id`

3. **Updated loadQuiz()** (line ~84)
   - Uses `getUserId()` instead of `session.user.id`
   - Transforms backend response format to component format
   - Converts `answer` string to `correct` index using `indexOf()`
   - Generates unique IDs for each question

4. **Updated loadNotes()** (line ~149)
   - Uses `getUserId()` instead of `session.user.id`

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (Flask)                                              │
├─────────────────────────────────────────────────────────────┤
│ Response: {                                                  │
│   quiz: [                                                    │
│     {                                                        │
│       question: "What is Bohr's model?",                    │
│       options: ["A", "B", "C", "D"],                        │
│       answer: "B"  ← String                                 │
│     }                                                        │
│   ]                                                          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ TRANSFORMATION (video-sidebar.jsx)                           │
├─────────────────────────────────────────────────────────────┤
│ • Wrap in { questions: [...] }                              │
│ • Convert answer string to correct index                    │
│ • Generate unique IDs                                       │
│ • Add default values for missing fields                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ COMPONENT STATE                                              │
├─────────────────────────────────────────────────────────────┤
│ quizData: {                                                  │
│   questions: [                                               │
│     {                                                        │
│       id: "abc123",                                         │
│       question: "What is Bohr's model?",                    │
│       options: ["A", "B", "C", "D"],                        │
│       correct: 1  ← Index (indexOf("B") = 1)               │
│     }                                                        │
│   ]                                                          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ UI RENDERING                                                 │
├─────────────────────────────────────────────────────────────┤
│ • Displays question text                                     │
│ • Renders 4 option buttons                                  │
│ • Compares user selection (index) with correct (index)      │
│ • Shows explanation after submission                         │
└─────────────────────────────────────────────────────────────┘
```

## Testing

### Test Case 1: Quiz Generation
1. Navigate to video page
2. Click sidebar quiz tab
3. Click "Generate Quiz from Video"
4. ✅ Quiz should load without "Invalid quiz format" error
5. ✅ Questions should display with 4 options each
6. ✅ Can select answers

### Test Case 2: Answer Validation
1. Answer all questions
2. Click "Submit Quiz"
3. ✅ Correct answers highlighted in green
4. ✅ Wrong answers highlighted in red
5. ✅ Explanations shown
6. ✅ Score calculated correctly

### Test Case 3: User ID Format
1. Check browser console for API requests
2. ✅ URL should be `/api/user/user_example_com/generate/quiz`
3. ✅ No 404 errors for user not found

## Key Points

1. **Backend format is CORRECT** - no changes needed to Flask API
2. **Frontend transformation is REQUIRED** - component expects different structure
3. **User ID must be email-based** - session.user.id doesn't exist in NextAuth
4. **Answer format conversion** - `answer` string → `correct` index using `indexOf()`

## Related Files

- ✅ `components/video-sidebar.jsx` - Fixed (this file)
- ✅ `app/quiz/page.js` - Already using correct format
- ✅ `quiz-and-rag-2/app.py` - No changes needed
- ✅ `quiz-and-rag-2/utils/quiz_generator.py` - No changes needed

## Status

🎉 **FIXED** - The video sidebar quiz feature now works correctly with the Flask backend!

All three quiz interfaces now properly transform the backend format:
1. ✅ Main quiz page (`app/quiz/page.js`)
2. ✅ Video sidebar quiz (`components/video-sidebar.jsx`)
3. ✅ Backend cache format (consistent across all)
