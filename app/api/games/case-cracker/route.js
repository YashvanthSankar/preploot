import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { action, subject, difficulty, caseId, userAnswer, timeSpent } = await request.json()

    if (action === 'generate') {
      const caseData = generateCase(subject, difficulty)
      return NextResponse.json({ case: caseData })
    } else if (action === 'evaluate') {
      const feedback = evaluateAnswer(subject, difficulty, userAnswer, caseId, timeSpent)
      return NextResponse.json({ feedback })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in case cracker API:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

function generateCase(subject, difficulty) {
  const caseId = Math.random().toString(36).substr(2, 9)
  
  // Physics Cases
  if (subject === 'physics') {
    const physicsCases = {
      easy: [
        {
          id: caseId,
          subject: 'physics',
          difficulty: 'easy',
          title: 'The Playground Swing Safety',
          context: 'A local park wants to install new swings that are both fun and safe for children.',
          scenario: 'You are consulting for a playground equipment company. They want to install swings that can accommodate children of different weights (20kg to 60kg) while ensuring safety. The swing chains are 3 meters long.',
          challenge: 'Determine the maximum safe angle the swing should reach and explain what physics principle ensures the child won\'t fall out at the highest point.',
          parameters: [
            'Chain length: 3 meters',
            'Child weight range: 20-60 kg',
            'Desired safety factor: 2x',
            'Maximum allowed tension: 1200 N'
          ],
          keyConcepts: ['Circular Motion', 'Centripetal Force', 'Weight', 'Tension'],
          timeLimit: 300
        },
        {
          id: caseId,
          subject: 'physics',
          difficulty: 'easy',
          title: 'The Coffee Cup Warmth',
          context: 'A café owner wants to keep coffee warm longer without using electricity.',
          scenario: 'A small café serves coffee in different types of cups: ceramic, metal, and styrofoam. Customers complain that their coffee gets cold too quickly, especially in winter.',
          challenge: 'Recommend which cup material to use and explain the physics behind heat transfer. Suggest two additional methods to keep coffee warm longer.',
          parameters: [
            'Room temperature: 20°C',
            'Coffee temperature: 85°C',
            'Ceramic cup thickness: 5mm',
            'Metal cup thickness: 2mm',
            'Styrofoam thickness: 8mm'
          ],
          keyConcepts: ['Heat Transfer', 'Conduction', 'Convection', 'Radiation', 'Thermal Conductivity'],
          timeLimit: 300
        }
      ],
      medium: [
        {
          id: caseId,
          subject: 'physics',
          difficulty: 'medium',
          title: 'The Roller Coaster Loop Design',
          context: 'An amusement park is designing a new roller coaster with a circular loop.',
          scenario: 'You are a safety engineer for a theme park. The new roller coaster has a vertical circular loop with a radius of 8 meters. Cars with passengers (total mass 500 kg) enter the loop at various speeds.',
          challenge: 'Calculate the minimum speed needed at the bottom of the loop to ensure passengers don\'t fall out at the top. Explain what forces are acting on passengers at different points in the loop.',
          parameters: [
            'Loop radius: 8 meters',
            'Total mass (car + passengers): 500 kg',
            'Acceleration due to gravity: 9.81 m/s²',
            'Safety margin required: 20% above minimum'
          ],
          keyConcepts: ['Circular Motion', 'Centripetal Force', 'Normal Force', 'Energy Conservation', 'Free Body Diagrams'],
          timeLimit: 420
        },
        {
          id: caseId,
          subject: 'physics',
          difficulty: 'medium',
          title: 'The Solar Panel Efficiency',
          context: 'A homeowner wants to optimize their solar panel installation for maximum energy production.',
          scenario: 'You are consulting for a residential solar installation. The homeowner has a south-facing roof with a 30° slope. They want to install 20 solar panels, each 1.6m × 1m, with 20% efficiency.',
          challenge: 'Calculate the optimal tilt angle for maximum yearly energy production. Determine daily energy output for summer and winter, considering the sun\'s path.',
          parameters: [
            'Panel dimensions: 1.6m × 1m each',
            'Panel efficiency: 20%',
            'Location latitude: 40°N',
            'Roof slope: 30°',
            'Average solar irradiance: 1000 W/m² (peak), 500 W/m² (average)'
          ],
          keyConcepts: ['Solar Irradiance', 'Angle of Incidence', 'Energy Conversion', 'Trigonometry', 'Seasonal Variation'],
          timeLimit: 420
        }
      ],
      hard: [
        {
          id: caseId,
          subject: 'physics',
          difficulty: 'hard',
          title: 'The Satellite Communication Link',
          context: 'A telecommunications company needs to establish a reliable satellite communication link.',
          scenario: 'You are designing a communication system for a remote research station. The system uses a geostationary satellite at 36,000 km altitude. The ground station has a 3-meter parabolic dish antenna.',
          challenge: 'Calculate the signal strength, delay, and power requirements. Design the system to handle weather interference and ensure 99.9% uptime. Consider the Doppler effect and atmospheric attenuation.',
          parameters: [
            'Satellite altitude: 36,000 km',
            'Antenna diameter: 3 meters',
            'Transmission frequency: 12 GHz',
            'Required data rate: 10 Mbps',
            'Weather attenuation: up to 10 dB (rain)',
            'Atmospheric loss: 0.2 dB'
          ],
          keyConcepts: ['Electromagnetic Radiation', 'Inverse Square Law', 'Doppler Effect', 'Antenna Gain', 'Signal-to-Noise Ratio', 'Atmospheric Physics'],
          timeLimit: 600
        }
      ]
    }
    
    const cases = physicsCases[difficulty] || physicsCases.medium
    return cases[Math.floor(Math.random() * cases.length)]
  }

  // Chemistry Cases
  if (subject === 'chemistry') {
    const chemistryCases = {
      easy: [
        {
          id: caseId,
          subject: 'chemistry',
          difficulty: 'easy',
          title: 'The Rusty Bridge Crisis',
          context: 'A city maintenance team discovered extensive rust on a critical bridge.',
          scenario: 'You are a materials engineer called to assess a 50-year-old steel bridge showing significant rust damage. The city wants to know the cause and prevention methods.',
          challenge: 'Explain the chemical process causing the rust, identify environmental factors accelerating it, and recommend three prevention strategies with their chemical principles.',
          parameters: [
            'Bridge age: 50 years',
            'Location: Coastal area (high humidity)',
            'Material: Carbon steel',
            'Average rainfall: 1200mm/year',
            'Salt exposure: Moderate (10km from ocean)'
          ],
          keyConcepts: ['Oxidation', 'Reduction', 'Electrochemical Reactions', 'Corrosion', 'Environmental Chemistry'],
          timeLimit: 300
        }
      ],
      medium: [
        {
          id: caseId,
          subject: 'chemistry',
          difficulty: 'medium',
          title: 'The Water Treatment Challenge',
          context: 'A small town needs to upgrade their water treatment plant to remove heavy metals.',
          scenario: 'The town\'s water supply contains dangerous levels of lead (0.05 ppm) and mercury (0.02 ppm). You must design a treatment process to reduce these to safe levels (Pb: 0.01 ppm, Hg: 0.002 ppm).',
          challenge: 'Design a multi-step treatment process. Calculate required chemical amounts, reaction times, and efficiency. Consider cost, environmental impact, and waste disposal.',
          parameters: [
            'Daily water volume: 10 million liters',
            'Lead concentration: 0.05 ppm',
            'Mercury concentration: 0.02 ppm',
            'Target Lead: <0.01 ppm',
            'Target Mercury: <0.002 ppm',
            'Budget: $500,000 for setup'
          ],
          keyConcepts: ['Precipitation Reactions', 'Adsorption', 'Ion Exchange', 'Stoichiometry', 'Environmental Chemistry'],
          timeLimit: 480
        }
      ],
      hard: [
        {
          id: caseId,
          subject: 'chemistry',
          difficulty: 'hard',
          title: 'The Pharmaceutical Synthesis Optimization',
          context: 'A pharmaceutical company needs to optimize production of a life-saving drug.',
          scenario: 'You are optimizing the synthesis of aspirin (acetylsalicylic acid) for industrial production. Current yield is 65%, but the company needs 85% yield to remain profitable while keeping the drug affordable.',
          challenge: 'Analyze the reaction mechanism, identify limiting factors, and design process improvements. Consider reaction kinetics, thermodynamics, catalyst options, and green chemistry principles.',
          parameters: [
            'Current yield: 65%',
            'Target yield: 85%',
            'Production target: 1000 kg/day',
            'Raw materials: Salicylic acid, Acetic anhydride',
            'Current reaction time: 2 hours at 85°C',
            'Waste disposal cost: $50/kg'
          ],
          keyConcepts: ['Reaction Mechanisms', 'Kinetics', 'Thermodynamics', 'Catalysis', 'Green Chemistry', 'Process Optimization'],
          timeLimit: 600
        }
      ]
    }
    
    const cases = chemistryCases[difficulty] || chemistryCases.medium
    return cases[Math.floor(Math.random() * cases.length)]
  }

  // History Cases
  if (subject === 'history') {
    const historyCases = {
      easy: [
        {
          id: caseId,
          subject: 'history',
          difficulty: 'easy',
          title: 'The Trade Route Decision',
          context: 'You are an advisor to a medieval king deciding on trade routes.',
          scenario: 'It\'s 1200 CE, and your kingdom sits between the Byzantine Empire and Western Europe. Merchants want to establish new trade routes through your territory.',
          challenge: 'Advise the king on whether to allow these trade routes. Consider economic benefits, security risks, and cultural impacts. What policies would you recommend?',
          parameters: [
            'Kingdom population: 50,000',
            'Current economy: Primarily agricultural',
            'Military strength: 500 soldiers',
            'Geographic position: Mountain passes to the east',
            'Neighboring relations: Neutral with most'
          ],
          keyConcepts: ['Medieval Trade', 'Economic Policy', 'Cultural Exchange', 'Security', 'Diplomacy'],
          timeLimit: 300
        }
      ],
      medium: [
        {
          id: caseId,
          subject: 'history',
          difficulty: 'medium',
          title: 'The Ashoka Policy Dilemma',
          context: 'You are advising Emperor Ashoka after the brutal Kalinga War.',
          scenario: 'The year is 261 BCE. Emperor Ashoka has just witnessed the devastating aftermath of the Kalinga War, with over 100,000 casualties. He is questioning his policies of expansion through violence.',
          challenge: 'Draft a comprehensive policy recommendation that addresses governance, justice, religious tolerance, and expansion. How should the Mauryan Empire change its approach while maintaining stability?',
          parameters: [
            'Empire population: ~50 million',
            'Recent casualties: 100,000+ in Kalinga',
            'Territory: Most of Indian subcontinent',
            'Religious diversity: Hindu, Buddhist, Jain populations',
            'Administrative challenge: Governing diverse cultures',
            'External threats: Greek kingdoms in northwest'
          ],
          keyConcepts: ['Ancient Governance', 'Religious Policy', 'Administrative Systems', 'Military Strategy', 'Cultural Integration', 'Moral Philosophy'],
          timeLimit: 480
        }
      ],
      hard: [
        {
          id: caseId,
          subject: 'history',
          difficulty: 'hard',
          title: 'The Cuban Missile Crisis Strategy',
          context: 'You are a key advisor to President Kennedy during the Cuban Missile Crisis.',
          scenario: 'October 1962: Soviet missiles have been discovered in Cuba. You have 13 days to resolve this crisis without triggering nuclear war. Multiple options are on the table: air strikes, invasion, blockade, or negotiation.',
          challenge: 'Develop a comprehensive strategy considering nuclear deterrence theory, alliance relationships, domestic politics, and long-term Cold War implications. Justify your approach with historical precedents.',
          parameters: [
            'Soviet missiles in Cuba: 42 operational',
            'US missiles in Turkey: 15 Jupiter missiles',
            'NATO alliance considerations',
            'UN involvement possible',
            'Domestic pressure for military action',
            'Nuclear arsenals: US ~3,500, USSR ~500',
            'Timeline: Crisis must resolve within 2 weeks'
          ],
          keyConcepts: ['Cold War Strategy', 'Nuclear Deterrence', 'Diplomacy', 'Alliance Politics', 'Crisis Management', 'Historical Precedent'],
          timeLimit: 600
        }
      ]
    }
    
    const cases = historyCases[difficulty] || historyCases.medium
    return cases[Math.floor(Math.random() * cases.length)]
  }

  // Default case for other subjects
  return generateGenericCase(subject, difficulty, caseId)
}

function generateGenericCase(subject, difficulty, caseId) {
  const timeLimit = difficulty === 'easy' ? 300 : difficulty === 'medium' ? 420 : 600
  
  return {
    id: caseId,
    subject: subject,
    difficulty: difficulty,
    title: `${subject.charAt(0).toUpperCase() + subject.slice(1)} Problem-Solving Challenge`,
    context: `You are working as a professional consultant in the field of ${subject}.`,
    scenario: `A client has approached you with a complex problem that requires application of ${subject} principles and critical thinking to solve.`,
    challenge: `Analyze the situation, identify key concepts that apply, and provide a detailed solution with clear reasoning and step-by-step approach.`,
    parameters: [
      'Consider multiple approaches to the problem',
      'Identify potential constraints and limitations',
      'Evaluate the effectiveness of your solution',
      'Consider real-world implications and practical implementation'
    ],
    keyConcepts: ['Problem Analysis', 'Critical Thinking', 'Applied Knowledge', 'Solution Design', 'Implementation Strategy'],
    timeLimit: timeLimit
  }
}

function evaluateAnswer(subject, difficulty, userAnswer, caseId, timeSpent) {
  // This is a simplified evaluation system
  // In a real application, you would use AI/ML for more sophisticated analysis
  
  const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length
  const hasKeywords = checkForKeywords(userAnswer, subject)
  const hasStructure = checkAnswerStructure(userAnswer)
  const timeBonus = timeSpent < 180 ? 10 : timeSpent < 300 ? 5 : 0
  
  // Calculate base score
  let score = 0
  
  // Length and detail (0-30 points)
  if (wordCount < 50) score += 10
  else if (wordCount < 100) score += 20
  else if (wordCount >= 100) score += 30
  
  // Keyword relevance (0-40 points)
  score += hasKeywords ? 40 : 20
  
  // Structure and clarity (0-20 points)
  score += hasStructure ? 20 : 10
  
  // Time bonus (0-10 points)
  score += timeBonus
  
  // Difficulty adjustment
  const difficultyMultiplier = difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 1.2 : 1.0
  score = Math.round(score * difficultyMultiplier)
  score = Math.min(100, Math.max(0, score))
  
  return generateFeedback(score, userAnswer, subject, difficulty, wordCount, timeSpent)
}

function checkForKeywords(answer, subject) {
  const keywords = {
    physics: ['force', 'energy', 'motion', 'acceleration', 'velocity', 'mass', 'weight', 'pressure', 'temperature', 'wave', 'frequency', 'momentum'],
    chemistry: ['reaction', 'molecule', 'atom', 'bond', 'element', 'compound', 'solution', 'concentration', 'catalyst', 'equilibrium', 'oxidation', 'reduction'],
    biology: ['cell', 'organism', 'evolution', 'genetics', 'enzyme', 'protein', 'dna', 'ecosystem', 'species', 'adaptation', 'metabolism'],
    mathematics: ['equation', 'function', 'variable', 'solution', 'proof', 'theorem', 'calculate', 'formula', 'graph', 'derivative', 'integral'],
    history: ['cause', 'effect', 'context', 'source', 'evidence', 'perspective', 'consequence', 'policy', 'decision', 'impact', 'influence'],
    economics: ['supply', 'demand', 'market', 'price', 'cost', 'benefit', 'investment', 'revenue', 'profit', 'competition', 'efficiency'],
    engineering: ['design', 'system', 'process', 'optimization', 'constraint', 'requirement', 'specification', 'analysis', 'solution', 'implementation'],
    environmental: ['ecosystem', 'sustainability', 'impact', 'conservation', 'pollution', 'resource', 'climate', 'biodiversity', 'renewable', 'carbon']
  }
  
  const subjectKeywords = keywords[subject] || keywords.physics
  const answerLower = answer.toLowerCase()
  
  return subjectKeywords.some(keyword => answerLower.includes(keyword))
}

function checkAnswerStructure(answer) {
  // Check for structured thinking: paragraphs, lists, clear sections
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const hasMultipleParagraphs = answer.split('\n\n').length > 1
  const hasNumbers = /\d/.test(answer)
  const hasSteps = /step|first|second|then|next|finally/i.test(answer)
  
  return sentences.length >= 3 && (hasMultipleParagraphs || hasNumbers || hasSteps)
}

function generateFeedback(score, userAnswer, subject, difficulty, wordCount, timeSpent) {
  const feedback = {
    score: score,
    strengths: [],
    improvements: [],
    expertSolution: '',
    learningPoints: []
  }
  
  // Strengths based on score
  if (score >= 80) {
    feedback.strengths.push("Excellent comprehensive analysis with clear reasoning")
    feedback.strengths.push("Proper application of key concepts")
    feedback.strengths.push("Well-structured solution with logical flow")
  } else if (score >= 60) {
    feedback.strengths.push("Good understanding of basic concepts")
    feedback.strengths.push("Clear attempt at systematic problem-solving")
    if (wordCount >= 100) feedback.strengths.push("Detailed explanation provided")
  } else {
    feedback.strengths.push("Shows basic understanding of the problem")
    if (wordCount >= 50) feedback.strengths.push("Attempted to provide explanation")
  }
  
  // Improvements based on score
  if (score < 80) {
    if (wordCount < 100) {
      feedback.improvements.push("Provide more detailed analysis and explanation")
    }
    feedback.improvements.push("Include more specific application of key concepts")
    feedback.improvements.push("Consider multiple approaches or alternative solutions")
  }
  
  if (score < 60) {
    feedback.improvements.push("Structure your answer with clear steps or sections")
    feedback.improvements.push("Include relevant calculations or quantitative analysis where appropriate")
    feedback.improvements.push("Support your conclusions with stronger reasoning")
  }
  
  // Expert solution based on subject
  feedback.expertSolution = getExpertSolution(subject, difficulty)
  
  // Learning points
  feedback.learningPoints = [
    `${subject.charAt(0).toUpperCase() + subject.slice(1)} problems require systematic analysis and application of fundamental principles`,
    "Real-world problem-solving involves considering multiple factors and constraints",
    "Clear communication of your reasoning is as important as the solution itself",
    "Practice connecting theoretical knowledge to practical applications"
  ]
  
  if (timeSpent < 120) {
    feedback.improvements.push("Consider taking more time to develop a thorough analysis")
  }
  
  return feedback
}

function getExpertSolution(subject, difficulty) {
  const solutions = {
    physics: {
      easy: "A systematic approach to physics problems involves: 1) Identifying all forces and energy forms, 2) Drawing clear diagrams, 3) Applying relevant physics principles (Newton's laws, conservation laws, etc.), 4) Performing calculations with proper units, 5) Checking if the answer makes physical sense.",
      medium: "Advanced physics problem-solving requires: 1) Careful analysis of the physical system and constraints, 2) Selection of appropriate coordinate systems and reference frames, 3) Application of fundamental principles (energy conservation, momentum conservation, electromagnetic laws), 4) Mathematical modeling with differential equations if needed, 5) Consideration of limiting cases and approximations, 6) Evaluation of results for physical reasonableness.",
      hard: "Expert-level physics analysis involves: 1) Comprehensive system modeling including all relevant physical phenomena, 2) Advanced mathematical techniques (vector calculus, differential equations, statistical mechanics), 3) Consideration of multiple scales (microscopic to macroscopic), 4) Analysis of stability and sensitivity, 5) Comparison with experimental data and theoretical predictions, 6) Discussion of assumptions and limitations."
    },
    chemistry: {
      easy: "Chemical problem-solving approach: 1) Identify the chemical system and relevant reactions, 2) Write balanced chemical equations, 3) Apply stoichiometry and conservation laws, 4) Consider reaction conditions (temperature, pressure, catalysts), 5) Calculate quantities using molar relationships, 6) Evaluate safety and environmental considerations.",
      medium: "Advanced chemistry analysis requires: 1) Understanding of reaction mechanisms and kinetics, 2) Thermodynamic analysis (enthalpy, entropy, free energy), 3) Consideration of equilibrium positions and Le Chatelier's principle, 4) Process optimization for yield and selectivity, 5) Analysis of side reactions and impurities, 6) Economic and environmental impact assessment.",
      hard: "Expert chemical analysis involves: 1) Detailed mechanistic understanding at the molecular level, 2) Quantum chemical considerations and orbital interactions, 3) Advanced kinetic modeling including complex reaction networks, 4) Thermodynamic cycle analysis, 5) Process integration and heat/mass transfer, 6) Life cycle assessment and green chemistry principles."
    },
    history: {
      easy: "Historical analysis framework: 1) Establish chronological context and key players, 2) Identify multiple causes and their relative importance, 3) Consider different perspectives and sources, 4) Analyze short-term and long-term consequences, 5) Connect to broader historical patterns and themes.",
      medium: "Advanced historical analysis requires: 1) Critical evaluation of primary and secondary sources, 2) Understanding of historiographical debates and different interpretations, 3) Analysis of continuity and change over time, 4) Consideration of social, economic, political, and cultural factors, 5) Comparison with similar historical situations, 6) Assessment of historical significance and lasting impact.",
      hard: "Expert historical analysis involves: 1) Sophisticated understanding of causation and contingency, 2) Integration of multiple historical approaches (social, cultural, economic, political), 3) Analysis of agency and structure in historical change, 4) Consideration of counterfactual scenarios, 5) Understanding of memory and historical representation, 6) Connection to contemporary issues and ongoing historical debates."
    }
  }
  
  return solutions[subject]?.[difficulty] || solutions.physics.medium
}