import os
import hashlib
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from utils.youtube import extract_video_id, get_transcript
from utils.pdf_processor import PDFProcessor
from utils.quiz_generator import QuizGenerator
from utils.notes_generator import NotesGenerator
from utils.cache_manager import CacheManager
from utils.user_manager import create_user_directories
from config import Config

app = Flask(__name__)
# Enable CORS for all routes and origins (for development)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})
app.config.from_object(Config)

# Initialize components
quiz_generator = QuizGenerator()
notes_generator = NotesGenerator()
cache_manager = CacheManager()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@app.route('/api/user/<user_id>/upload/pdf', methods=['POST'])
def upload_pdf(user_id):
    """Upload PDF or DOCX for a specific user."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
        
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Only PDF and DOCX files are allowed.'}), 400
    
    try:
        # Create user-specific PDF processor
        pdf_processor = PDFProcessor(user_id)
        
        filename = secure_filename(file.filename)
        file_data = file.read()
        
        # Save file to user's data folder
        file_path = pdf_processor.save_file(file_data, filename)
        
        # Process file and store in user's vector database
        vectorstore = pdf_processor.store_chroma_function()
        
        # Generate cache ID from file content and user ID
        file_hash = hashlib.md5(file_data).hexdigest()
        cache_id = f'doc_{user_id}_{file_hash}'
        
        return jsonify({
            'message': f'{filename} processed successfully',
            'cache_id': cache_id,
            'user_id': user_id,
            'file_type': 'pdf' if filename.endswith('.pdf') else 'docx'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<user_id>/upload/youtube', methods=['POST'])
def process_youtube(user_id):
    """Process YouTube video for a specific user."""
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'No URL provided'}), 400
    
    try:
        print(f"Processing YouTube URL: {data['url']}")
        video_id = extract_video_id(data['url'])
        print(f"Extracted video ID: {video_id}")
        
        if not video_id:
            return jsonify({'error': 'Invalid YouTube URL'}), 400
        
        # Check cache first
        cache_id = f'yt_{user_id}_{video_id}'
        cached_transcript = cache_manager.get_from_cache(cache_id)
        
        if cached_transcript:
            print(f"Transcript found in cache for {video_id}")
            return jsonify({
                'message': 'Transcript retrieved from cache',
                'cache_id': cache_id,
                'user_id': user_id
            })
        
        # Fetch and process transcript
        print(f"Fetching transcript for video {video_id}...")
        transcript = get_transcript(video_id)
        print(f"Transcript fetched successfully, length: {len(transcript)} characters")
        cache_manager.save_to_cache(transcript, cache_id)
        
        return jsonify({
            'message': 'YouTube transcript processed successfully',
            'cache_id': cache_id,
            'user_id': user_id
        })
        
    except Exception as e:
        print(f"ERROR processing YouTube video: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<user_id>/generate/quiz', methods=['POST'])
def generate_quiz(user_id):
    """Generate quiz for a specific user."""
    data = request.get_json()
    if not data or 'cache_id' not in data:
        return jsonify({'error': 'No cache ID provided'}), 400
    
    try:
        # Get parameters
        params = {
            'num_questions': int(data.get('num_questions', 10)),
            'difficulty': data.get('difficulty', 'mixed'),
            'similarity_threshold': float(data.get('similarity_threshold', Config.DEFAULT_SIMILARITY_THRESHOLD))
        }
        
        # Validate parameters
        if params['num_questions'] > Config.MAX_QUESTIONS_PER_QUIZ:
            return jsonify({'error': f'Maximum {Config.MAX_QUESTIONS_PER_QUIZ} questions allowed'}), 400
        
        if params['difficulty'] not in ['mixed', 'easy', 'medium', 'hard']:
            return jsonify({'error': 'Invalid difficulty level'}), 400
        
        # Check for cached quiz
        quiz_cache_id = f"{data['cache_id']}_{params['num_questions']}_{params['difficulty']}"
        cached_quiz = cache_manager.get_from_cache(quiz_cache_id)
        
        if cached_quiz:
            return jsonify({
                'message': 'Quiz retrieved from cache',
                'quiz': cached_quiz,
                'user_id': user_id
            })
        
        # Generate new quiz
        if data['cache_id'].startswith(f'yt_{user_id}_'):
            # Handle YouTube transcript
            transcript = cache_manager.get_from_cache(data['cache_id'])
            if not transcript:
                return jsonify({'error': 'Transcript not found'}), 404
            
            quiz = quiz_generator.generate_quiz([transcript], params)
        elif data['cache_id'].startswith(f'doc_{user_id}_'):
            # Handle document (PDF/DOCX) content
            pdf_processor = PDFProcessor(user_id)
            vectorstore = pdf_processor.get_vectorstore()
            if not vectorstore:
                return jsonify({'error': 'No documents in vector store'}), 404
            
            all_docs = vectorstore.get()
            if not all_docs or 'documents' not in all_docs:
                return jsonify({'error': 'No documents found'}), 404
            
            quiz = quiz_generator.generate_quiz(all_docs['documents'], params)
        else:
            return jsonify({'error': 'Invalid cache ID format'}), 400
        
        # Cache the generated quiz
        cache_manager.save_to_cache(quiz, quiz_cache_id)
        
        print(f"DEBUG: Generated {len(quiz)} quiz questions")
        if len(quiz) > 0:
            print(f"DEBUG: First question format: {json.dumps(quiz[0], indent=2)}")
        
        return jsonify({
            'message': 'Quiz generated successfully',
            'quiz': quiz,
            'user_id': user_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<user_id>/generate/notes', methods=['POST'])
def generate_notes(user_id):
    """Generate notes for a specific user."""
    data = request.get_json()
    if not data or 'cache_id' not in data:
        return jsonify({'error': 'No cache ID provided'}), 400
    
    try:
        # Get parameters
        params = {
            'similarity_threshold': float(data.get('similarity_threshold', Config.DEFAULT_SIMILARITY_THRESHOLD)),
            'batch_size': int(data.get('batch_size', Config.DEFAULT_BATCH_SIZE))
        }
        
        # Check for cached notes
        notes_cache_id = f"{data['cache_id']}_notes_{params['similarity_threshold']}"
        cached_notes = cache_manager.get_from_cache(notes_cache_id)
        
        if cached_notes:
            return jsonify({
                'message': 'Notes retrieved from cache',
                'notes': cached_notes,
                'user_id': user_id
            })
        
        # Generate new notes
        if data['cache_id'].startswith(f'yt_{user_id}_'):
            # Handle YouTube transcript
            transcript = cache_manager.get_from_cache(data['cache_id'])
            if not transcript:
                return jsonify({'error': 'Transcript not found'}), 404
            
            notes = notes_generator.generate_notes([transcript], params)
        elif data['cache_id'].startswith(f'doc_{user_id}_'):
            # Handle document (PDF/DOCX) content
            pdf_processor = PDFProcessor(user_id)
            vectorstore = pdf_processor.get_vectorstore()
            if not vectorstore:
                return jsonify({'error': 'No documents in vector store'}), 404
            
            all_docs = vectorstore.get()
            if not all_docs or 'documents' not in all_docs:
                return jsonify({'error': 'No documents found'}), 404
            
            notes = notes_generator.generate_notes(all_docs['documents'], params)
        else:
            return jsonify({'error': 'Invalid cache ID format'}), 400
        
        # Cache the generated notes
        cache_manager.save_to_cache(notes, notes_cache_id)
        
        # Also generate markdown version
        markdown_content = notes_generator.convert_notes_to_markdown(notes)
        
        return jsonify({
            'message': 'Notes generated successfully',
            'notes': notes,
            'markdown': markdown_content,
            'user_id': user_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<user_id>/files', methods=['GET'])
def list_user_files(user_id):
    """List all files for a specific user."""
    try:
        from utils.user_manager import list_user_files
        files = list_user_files(user_id)
        file_names = [os.path.basename(f) for f in files]
        
        return jsonify({
            'user_id': user_id,
            'files': file_names,
            'count': len(file_names)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<user_id>/chat', methods=['POST'])
def chat_with_documents(user_id):
    """Chat with user's documents using RAG."""
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'No message provided'}), 400
    
    try:
        user_message = data['message']
        
        # Initialize PDF processor for the user
        pdf_processor = PDFProcessor(user_id)
        vectorstore = pdf_processor.get_vectorstore()
        
        if not vectorstore:
            return jsonify({
                'error': 'No documents uploaded. Please upload PDF or DOCX files first.',
                'response': 'I don\'t have any documents to search through. Please upload some PDF or DOCX files first, and I\'ll be able to help answer questions about them!'
            }), 200
        
        # Search for relevant documents
        try:
            relevant_docs = vectorstore.similarity_search(user_message, k=5)
        except Exception as search_error:
            return jsonify({
                'error': 'No documents found',
                'response': 'I couldn\'t find any relevant information in your uploaded documents. Try asking a different question or upload more documents.'
            }), 200
        
        if not relevant_docs:
            return jsonify({
                'response': 'I couldn\'t find relevant information in your documents for that question. Try asking something else or upload more documents.',
                'sources': []
            })
        
        # Prepare context from relevant documents
        context = "\n\n".join([doc.page_content for doc in relevant_docs])
        
        # Generate response using the notes generator (reusing existing AI logic)
        prompt = f"""Based on the following context from the user's documents, answer their question accurately and helpfully.

Context:
{context}

Question: {user_message}

Please provide a comprehensive answer based only on the information in the context. If the context doesn't contain enough information to answer the question, say so clearly."""
        
        # Use the existing notes generator for consistent AI responses
        response = notes_generator.generate_response(prompt)
        
        # Format sources
        sources = []
        for i, doc in enumerate(relevant_docs):
            sources.append({
                'content': doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                'relevance_score': float(0.95 - i * 0.1)  # Mock relevance score
            })
        
        return jsonify({
            'response': response,
            'sources': sources,
            'user_id': user_id,
            'message_count': len(sources)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<user_id>/clear', methods=['DELETE'])
def clear_user_data(user_id):
    """Clear all data for a specific user."""
    try:
        from utils.user_manager import delete_user_data
        delete_user_data(user_id)
        
        return jsonify({
            'message': f'All data cleared for user {user_id}',
            'user_id': user_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-taboo-card', methods=['POST'])
def generate_taboo_card():
    """Generate AI-powered taboo cards for the game."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        subject = data.get('subject', 'Biology')
        topic = data.get('topic', 'general')
        difficulty = data.get('difficulty', 'medium')
        
        # Create prompt for AI to generate taboo card
        prompt = f"""
Create a taboo game card for the subject "{subject}" related to "{topic}" with {difficulty} difficulty.

Generate a JSON response with this exact structure:

{{
  "concept": "The main concept/term to guess",
  "description": "A clear description without using forbidden words (2-3 sentences)",
  "forbiddenWords": ["word1", "word2", "word3", "word4", "word5", "word6"],
  "difficulty": "{difficulty.capitalize()}",
  "subject": "{subject}"
}}

Rules:
1. The concept should be a single term or short phrase
2. The description should be clear but avoid obvious words
3. Include exactly 6 forbidden words that would make guessing too easy
4. Make sure the description doesn't contain any forbidden words
5. Difficulty should match the complexity of the concept

Make it educational and engaging for students studying {subject}.
"""

        # Use the existing quiz generator's AI client
        from google import genai
        client = genai.Client()
        
        content = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt
        )
        
        response_text = content.text.strip()
        
        # Clean the response
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        elif response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        # Parse JSON
        import json
        card_data = json.loads(response_text)
        
        # Validate the card structure
        required_fields = ['concept', 'description', 'forbiddenWords', 'difficulty', 'subject']
        if not all(field in card_data for field in required_fields):
            raise ValueError("Invalid card structure")
        
        if not isinstance(card_data['forbiddenWords'], list) or len(card_data['forbiddenWords']) != 6:
            raise ValueError("Must have exactly 6 forbidden words")
        
        return jsonify(card_data)
        
    except json.JSONDecodeError as e:
        return jsonify({'error': 'Failed to parse AI response'}), 500
    except Exception as e:
        print(f"Error generating taboo card: {str(e)}")
        
        # Fallback cards if AI fails
        fallback_cards = {
            'Biology': {
                'concept': 'Photosynthesis',
                'description': 'This process allows green organisms to convert light energy into chemical energy, producing glucose and releasing a gas essential for animal life.',
                'forbiddenWords': ['sunlight', 'chlorophyll', 'plant', 'oxygen', 'green', 'leaves'],
                'difficulty': difficulty.capitalize(),
                'subject': subject
            },
            'Physics': {
                'concept': 'Gravity',
                'description': 'An invisible force that pulls objects toward each other, keeping us grounded and causing dropped items to fall downward.',
                'forbiddenWords': ['force', 'fall', 'Newton', 'weight', 'attraction', 'mass'],
                'difficulty': difficulty.capitalize(),
                'subject': subject
            },
            'Chemistry': {
                'concept': 'Catalyst',
                'description': 'A substance that speeds up chemical reactions without being consumed, lowering the energy barrier needed for reactions to occur.',
                'forbiddenWords': ['reaction', 'speed', 'chemical', 'enzyme', 'activation', 'energy'],
                'difficulty': difficulty.capitalize(),
                'subject': subject
            }
        }
        
        fallback = fallback_cards.get(subject, fallback_cards['Biology'])
        return jsonify(fallback)

# Create required directories and initialize app
def create_app():
    os.makedirs(Config.BASE_DATA_DIR, exist_ok=True)
    os.makedirs(Config.CACHE_FOLDER, exist_ok=True)

create_app()

# Periodic cleanup of expired cache
@app.before_request
def cleanup_cache():
    cache_manager.clear_expired_cache()

if __name__ == '__main__':
    app.run(debug=True)