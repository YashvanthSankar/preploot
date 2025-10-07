import json
import re
from google import genai
from config import Config
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class QuizGenerator:
    def __init__(self):
        self.client = genai.Client()
        
    def deduplicate_chunks(self, chunks, threshold=0.85):
        """Deduplicate similar chunks using TF-IDF and cosine similarity."""
        if len(chunks) <= 1:
            return chunks
        
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(chunks)
        similarities = cosine_similarity(tfidf_matrix)
        
        keep_indices = []
        seen = set()
        
        for i in range(len(chunks)):
            if i in seen:
                continue
            keep_indices.append(i)
            for j in range(i + 1, len(chunks)):
                if similarities[i][j] > threshold:
                    seen.add(j)
        
        return [chunks[i] for i in keep_indices]
    
    def batch_chunks(self, chunks, batch_size=5):
        """Batch chunks together to reduce API calls."""
        batches = []
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            combined = "\n\n--- SECTION ---\n\n".join(batch)
            batches.append(combined)
        return batches
    
    def generate_quiz_from_batch(self, batch_text, params):
        """Generate quiz questions from a batch of text."""
        # Use the exact same prompt from the notebook
        transcript_prompt = f"""
You are a teacher creating quizzes from a lecture transcript. Using the text below, generate a quiz with a question for each important topic. The quiz should include **multiple-choice questions (MCQs)** only. Each question should have:

1. A "question" string.
2. An "options" list with exactly 4 options.
3. An "answer" string indicating the correct option.
4. A "difficulty" string which can be "easy", "medium", or "hard".

Output the quiz strictly in JSON format like this:

[
  {{
    "question": "Example question?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option B",
    "difficulty": "medium",
    "explanation": "Explanation for the correct answer."
  }},
  ...
]

Make sure the output is parsable. Do not include any other characters other than the structure I have specified.

**Transcript:**
"{batch_text}"
"""
        try:
            # Generate content using Gemini
            content = self.client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=transcript_prompt
            )
            
            # Get the text response
            response_text = content.text
            
            # Clean the response (remove markdown code blocks and extra whitespace)
            response_text = response_text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            elif response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            print(f"DEBUG: Response text length: {len(response_text)}")
            print(f"DEBUG: First 200 chars: {response_text[:200]}")
            
            # Try to extract JSON array if embedded in text
            json_match = re.search(r'\[\s*\{.*\}\s*\]', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(0)
                print(f"DEBUG: Extracted JSON array, length: {len(response_text)}")
            
            # Parse JSON
            try:
                questions = json.loads(response_text)
            except json.JSONDecodeError as je:
                print(f"JSON decode error: {str(je)}")
                print(f"Problematic text around error: {response_text[max(0, je.pos-100):min(len(response_text), je.pos+100)]}")
                # Try to fix common JSON issues
                response_text = response_text.replace('\n', ' ').replace('\r', '')
                response_text = re.sub(r',\s*]', ']', response_text)  # Remove trailing commas
                response_text = re.sub(r',\s*}', '}', response_text)  # Remove trailing commas in objects
                questions = json.loads(response_text)
            
            print(f"DEBUG: Successfully parsed {len(questions)} questions")
            
            # Validate question format
            validated_questions = []
            for q in questions:
                if all(key in q for key in ['question', 'options', 'answer', 'difficulty']):
                    # Ensure explanation exists
                    if 'explanation' not in q:
                        q['explanation'] = 'No explanation provided.'
                    validated_questions.append(q)
                else:
                    print(f"WARNING: Skipping invalid question: {q.get('question', 'Unknown')}")
            
            print(f"DEBUG: {len(validated_questions)} questions passed validation")
            
            # Apply filters from params if provided
            if params.get('difficulty') and params['difficulty'] != 'mixed':
                validated_questions = [q for q in validated_questions if q['difficulty'] == params['difficulty']]
            
            if params.get('num_questions'):
                validated_questions = validated_questions[:params['num_questions']]
                
            return validated_questions
            
        except Exception as e:
            print(f"Error generating quiz: {str(e)}")
            import traceback
            traceback.print_exc()
            return []
    
    def generate_quiz(self, text_chunks, params=None):
        """Generate a complete quiz from text chunks with customization."""
        if params is None:
            params = {}
            
        # Set default parameters
        default_params = {
            'num_questions': 10,
            'difficulty': 'mixed',
            'similarity_threshold': Config.DEFAULT_SIMILARITY_THRESHOLD,
            'batch_size': Config.DEFAULT_BATCH_SIZE
        }
        
        params = {**default_params, **params}
        
        # Deduplicate chunks
        unique_chunks = self.deduplicate_chunks(
            text_chunks,
            threshold=params['similarity_threshold']
        )
        
        # Batch chunks
        batched_chunks = self.batch_chunks(
            unique_chunks,
            batch_size=params['batch_size']
        )
        
        # Generate questions from each batch
        all_questions = []
        questions_needed = params['num_questions']
        
        for batch in batched_chunks:
            if len(all_questions) >= questions_needed:
                break
                
            # Adjust number of questions for this batch
            remaining = questions_needed - len(all_questions)
            params['num_questions'] = min(remaining, 5)  # Max 5 questions per batch
            
            questions = self.generate_quiz_from_batch(batch, params)
            all_questions.extend(questions)
        
        return all_questions[:questions_needed]