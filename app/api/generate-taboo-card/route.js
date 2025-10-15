import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      subject = 'Biology',
      topic = 'general',
      difficulty = 'medium'
    } = body;

    // Initialize Google Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create prompt for AI to generate taboo card
    const prompt = `
Create a taboo game card for the subject "${subject}" related to "${topic}" with ${difficulty} difficulty.

Generate a JSON response with this exact structure:

{
  "concept": "The main concept/term to guess",
  "description": "A clear description without using forbidden words (2-3 sentences)",
  "forbiddenWords": ["word1", "word2", "word3", "word4", "word5", "word6"],
  "difficulty": "${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}",
  "subject": "${subject}"
}

Rules:
1. The concept should be a single term or short phrase
2. The description should be clear but avoid obvious words
3. Include exactly 6 forbidden words that would make guessing too easy
4. Make sure the description doesn't contain any forbidden words
5. Difficulty should match the complexity of the concept

Make it educational and engaging for students studying ${subject}.
`;

    const result = await model.generateContent(prompt);
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

    // Parse JSON
    let cardData;
    try {
      cardData = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error('Failed to parse AI response');
    }

    // Validate the card structure
    const requiredFields = ['concept', 'description', 'forbiddenWords', 'difficulty', 'subject'];
    if (!requiredFields.every(field => field in cardData)) {
      throw new Error('Invalid card structure');
    }

    if (!Array.isArray(cardData.forbiddenWords) || cardData.forbiddenWords.length !== 6) {
      throw new Error('Must have exactly 6 forbidden words');
    }

    return NextResponse.json(cardData);

  } catch (error) {
    console.error('Error generating taboo card:', error);
    
    // Fallback cards if AI fails
    const fallbackCards = {
      'Biology': {
        'concept': 'Photosynthesis',
        'description': 'This process allows green organisms to convert light energy into chemical energy, producing glucose and releasing a gas essential for animal life.',
        'forbiddenWords': ['sunlight', 'chlorophyll', 'plant', 'oxygen', 'green', 'leaves'],
        'difficulty': 'Medium',
        'subject': 'Biology'
      },
      'Physics': {
        'concept': 'Gravity',
        'description': 'An invisible force that pulls objects toward each other, keeping us grounded and causing dropped items to fall downward.',
        'forbiddenWords': ['force', 'fall', 'Newton', 'weight', 'attraction', 'mass'],
        'difficulty': 'Medium',
        'subject': 'Physics'
      },
      'Chemistry': {
        'concept': 'Catalyst',
        'description': 'A substance that speeds up chemical reactions without being consumed, lowering the energy barrier needed for reactions to occur.',
        'forbiddenWords': ['reaction', 'speed', 'chemical', 'enzyme', 'activation', 'energy'],
        'difficulty': 'Medium',
        'subject': 'Chemistry'
      }
    };

    const body = await request.json();
    const subject = body.subject || 'Biology';
    const difficulty = body.difficulty || 'medium';
    
    const fallback = fallbackCards[subject] || fallbackCards['Biology'];
    fallback.difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    fallback.subject = subject;
    
    return NextResponse.json(fallback);
  }
}