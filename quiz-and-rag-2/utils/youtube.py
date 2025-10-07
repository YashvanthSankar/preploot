from youtube_transcript_api import YouTubeTranscriptApi
import re

def extract_video_id(url):
    """Extract YouTube video ID from various URL formats."""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/watch\?.*v=([^&\n?#]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_transcript(video_id):
    """Get transcript from YouTube video with multi-language support."""
    try:
        # Try preferred languages in order: English, Hindi, any auto-generated
        preferred_languages = ['en', 'hi', 'en-US', 'en-GB']
        
        fetched_transcript = None
        
        # First try to get transcript with preferred languages
        for lang in preferred_languages:
            try:
                # Use the instance method correctly
                api = YouTubeTranscriptApi()
                fetched_transcript = api.get_transcript(video_id, languages=[lang])
                break
            except Exception:
                continue
        
        # If no preferred language worked, try to get any available transcript
        if fetched_transcript is None:
            try:
                # Get transcript in any available language
                api = YouTubeTranscriptApi()
                fetched_transcript = api.get_transcript(video_id)
            except Exception as e:
                # Simple fallback - try without any parameters
                try:
                    api = YouTubeTranscriptApi()
                    fetched_transcript = api.fetch(video_id)
                except Exception as final_error:
                    raise Exception(f"No transcripts available. Tried all methods. Final error: {str(final_error)}")
        
        # Process transcript
        full_text = ""
        for snippet in fetched_transcript:
            # Handle both dictionary and object formats
            text = snippet.get('text', '') if isinstance(snippet, dict) else getattr(snippet, 'text', '')
            full_text += text + " "
            
        return full_text
        
    except Exception as e:
        raise Exception(f"Failed to fetch transcript: {str(e)}")