import { NextResponse } from 'next/server'

// Subjects and topics for generating diverse content
const subjects = [
  {
    name: "Biology",
    topics: ["cell biology", "genetics", "evolution", "ecology", "human anatomy", "photosynthesis", "respiration", "DNA", "proteins", "enzymes"]
  },
  {
    name: "Chemistry", 
    topics: ["atomic structure", "chemical bonds", "reactions", "periodic table", "acids and bases", "organic chemistry", "molecules", "compounds"]
  },
  {
    name: "Physics",
    topics: ["mechanics", "electricity", "magnetism", "waves", "thermodynamics", "quantum physics", "relativity", "forces", "energy"]
  },
  {
    name: "History",
    topics: ["ancient civilizations", "world wars", "revolutions", "renaissance", "industrial revolution", "colonialism", "democracy", "empires"]
  },
  {
    name: "Geography",
    topics: ["climate", "ecosystems", "continents", "mountains", "rivers", "weather patterns", "natural disasters", "population"]
  },
  {
    name: "Mathematics",
    topics: ["algebra", "geometry", "calculus", "statistics", "probability", "trigonometry", "fractions", "equations"]
  }
]

export async function POST(req) {
  try {
    const { difficulty = 'medium', subject = null, count = 1 } = await req.json()

    // Select random subject if not specified
    const selectedSubject = subject ? subjects.find(s => s.name.toLowerCase() === subject.toLowerCase()) : subjects[Math.floor(Math.random() * subjects.length)]
    
    if (!selectedSubject) {
      return NextResponse.json({ error: 'Invalid subject' }, { status: 400 })
    }

    // Generate cards
    const cards = []
    
    for (let i = 0; i < count; i++) {
      const randomTopic = selectedSubject.topics[Math.floor(Math.random() * selectedSubject.topics.length)]
      
      // Call our new Next.js taboo card generation API
      try {
        const tabooResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-taboo-card`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: selectedSubject.name,
            topic: randomTopic,
            difficulty: difficulty
          })
        })

        if (tabooResponse.ok) {
          const aiCard = await tabooResponse.json()
          cards.push(aiCard)
          continue
        }
      } catch (error) {
        console.log('Taboo card generation failed, using fallback cards:', error)
      }

      // Fallback to predefined cards if Flask is not available
      const fallbackCards = {
        biology: [
          {
            concept: "Mitochondria",
            description: "Often called the powerhouse of the cell, this organelle produces energy for cellular activities through a process involving glucose and oxygen.",
            forbiddenWords: ["powerhouse", "cell", "energy", "ATP", "organelle", "cellular"],
            difficulty: "Hard",
            subject: "Biology"
          },
          {
            concept: "Photosynthesis", 
            description: "This biological process converts light energy into chemical energy, producing glucose and releasing a gas we breathe. Green organisms use this to make their own food.",
            forbiddenWords: ["sunlight", "chlorophyll", "plant", "oxygen", "green", "leaves"],
            difficulty: "Medium",
            subject: "Biology"
          }
        ],
        physics: [
          {
            concept: "Gravity",
            description: "An invisible force that pulls objects toward each other. It keeps us on the ground and causes things to fall downward when dropped.",
            forbiddenWords: ["force", "fall", "Newton", "weight", "attraction", "mass"],
            difficulty: "Easy",
            subject: "Physics"
          },
          {
            concept: "Electromagnetic Induction",
            description: "The process by which a changing magnetic field creates an electric current in a conductor. This principle is used in generators and transformers.",
            forbiddenWords: ["magnetic", "electric", "current", "conductor", "generator", "transformer"],
            difficulty: "Hard", 
            subject: "Physics"
          }
        ],
        chemistry: [
          {
            concept: "Catalyst",
            description: "A substance that speeds up chemical reactions without being consumed in the process. It lowers the activation energy needed for reactions to occur.",
            forbiddenWords: ["reaction", "speed", "chemical", "enzyme", "activation", "energy"],
            difficulty: "Medium",
            subject: "Chemistry"
          }
        ],
        history: [
          {
            concept: "Renaissance",
            description: "A cultural movement in Europe that marked the transition from medieval to modern times, characterized by renewed interest in art, science, and classical learning.",
            forbiddenWords: ["art", "Europe", "medieval", "culture", "classical", "rebirth"],
            difficulty: "Medium",
            subject: "History"
          }
        ],
        geography: [
          {
            concept: "Erosion",
            description: "The process by which rock and soil are worn away and transported by natural forces like wind, water, and ice over long periods of time.",
            forbiddenWords: ["wind", "water", "ice", "weathering", "transport", "wearing"],
            difficulty: "Easy",
            subject: "Geography"
          }
        ],
        mathematics: [
          {
            concept: "Pythagorean Theorem",
            description: "A mathematical relationship in right triangles stating that the square of the longest side equals the sum of squares of the other two sides.",
            forbiddenWords: ["triangle", "square", "hypotenuse", "right", "theorem", "sides"],
            difficulty: "Medium",
            subject: "Mathematics"
          }
        ]
      }

      const subjectKey = selectedSubject.name.toLowerCase()
      const availableCards = fallbackCards[subjectKey] || fallbackCards.biology
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)]
      
      // Adjust difficulty if needed
      const adjustedCard = {
        ...randomCard,
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
      }
      
      cards.push(adjustedCard)
    }

    return NextResponse.json({ cards })

  } catch (error) {
    console.error('Error generating taboo cards:', error)
    return NextResponse.json({ error: 'Failed to generate cards' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'AI Taboo Card Generator API',
    subjects: subjects.map(s => s.name),
    difficulties: ['easy', 'medium', 'hard']
  })
}