import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { action, subject, difficulty, conceptPair, usedPhrases, phrase, selectedConcept } = await request.json()

    if (action === 'get_concept_pair') {
      const pair = generateConceptPair(subject, difficulty)
      return NextResponse.json({ conceptPair: pair })
    } else if (action === 'get_phrase') {
      const phraseData = generatePhrase(conceptPair, subject, difficulty, usedPhrases)
      return NextResponse.json({ phrase: phraseData })
    } else if (action === 'classify_phrase') {
      const result = classifyPhrase(phrase, selectedConcept, conceptPair)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in synapse surge API:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

function generateConceptPair(subject, difficulty) {
  const pairId = Math.random().toString(36).substr(2, 9)
  
  // Biology concept pairs
  if (subject === 'biology') {
    const biologyPairs = {
      easy: [
        {
          id: pairId,
          subject: 'biology',
          difficulty: 'easy',
          concept1: { 
            name: 'PLANT CELL', 
            description: 'Cells found in plants with cell walls and chloroplasts'
          },
          concept2: { 
            name: 'ANIMAL CELL', 
            description: 'Cells found in animals without cell walls'
          }
        },
        {
          id: pairId,
          subject: 'biology',
          difficulty: 'easy',
          concept1: { 
            name: 'ARTERIES', 
            description: 'Blood vessels carrying blood away from heart'
          },
          concept2: { 
            name: 'VEINS', 
            description: 'Blood vessels carrying blood toward heart'
          }
        },
        {
          id: pairId,
          subject: 'biology',
          difficulty: 'easy',
          concept1: { 
            name: 'PROKARYOTES', 
            description: 'Organisms without membrane-bound nucleus (bacteria)'
          },
          concept2: { 
            name: 'EUKARYOTES', 
            description: 'Organisms with membrane-bound nucleus and organelles'
          }
        },
        {
          id: pairId,
          subject: 'biology',
          difficulty: 'easy',
          concept1: { 
            name: 'VERTEBRATES', 
            description: 'Animals with backbone and spinal column'
          },
          concept2: { 
            name: 'INVERTEBRATES', 
            description: 'Animals without backbone or spinal column'
          }
        }
      ],
      medium: [
        {
          id: pairId,
          subject: 'biology',
          difficulty: 'medium',
          concept1: { 
            name: 'MITOSIS', 
            description: 'Cell division producing identical diploid cells'
          },
          concept2: { 
            name: 'MEIOSIS', 
            description: 'Cell division producing genetically unique gametes'
          }
        },
        {
          id: pairId,
          subject: 'biology',
          difficulty: 'medium',
          concept1: { 
            name: 'PHOTOSYNTHESIS', 
            description: 'Process converting light energy to chemical energy'
          },
          concept2: { 
            name: 'CELLULAR RESPIRATION', 
            description: 'Process breaking down glucose to release energy'
          }
        },
        {
          id: pairId,
          subject: 'biology',
          difficulty: 'medium',
          concept1: { 
            name: 'DNA', 
            description: 'Double-stranded genetic material with thymine'
          },
          concept2: { 
            name: 'RNA', 
            description: 'Single-stranded genetic material with uracil'
          }
        },
        {
          id: pairId,
          subject: 'biology',
          difficulty: 'medium',
          concept1: { 
            name: 'GENOTYPE', 
            description: 'Genetic makeup of an organism (genes)'
          },
          concept2: { 
            name: 'PHENOTYPE', 
            description: 'Observable characteristics of an organism'
          }
        },
        {
          id: pairId,
          subject: 'biology',
          difficulty: 'medium',
          concept1: { 
            name: 'DOMINANT ALLELE', 
            description: 'Allele expressed when present (uppercase letter)'
          },
          concept2: { 
            name: 'RECESSIVE ALLELE', 
            description: 'Allele only expressed when homozygous (lowercase)'
          }
        },
        {
          id: pairId,
          subject: 'biology',
          difficulty: 'medium',
          concept1: { 
            name: 'NATURAL SELECTION', 
            description: 'Process where beneficial traits become more common'
          },
          concept2: { 
            name: 'GENETIC DRIFT', 
            description: 'Random changes in allele frequencies over time'
          }
        },
        {
          id: pairId,
          subject: 'biology',
          difficulty: 'medium',
          concept1: { 
            name: 'ECOSYSTEM', 
            description: 'Community of organisms and their environment'
          },
          concept2: { 
            name: 'POPULATION', 
            description: 'Group of same species in the same area'
          }
        }
      ],
      hard: [
        {
          id: pairId,
          subject: 'biology',
          difficulty: 'hard',
          concept1: { 
            name: 'COMPETITIVE INHIBITION', 
            description: 'Inhibitor competes with substrate for active site'
          },
          concept2: { 
            name: 'NON-COMPETITIVE INHIBITION', 
            description: 'Inhibitor binds to allosteric site, changing enzyme shape'
          }
        },
        {
          id: pairId,
          subject: 'biology',
          difficulty: 'hard',
          concept1: { 
            name: 'LIGHT REACTIONS', 
            description: 'Photosynthesis reactions in thylakoids producing ATP/NADPH'
          },
          concept2: { 
            name: 'CALVIN CYCLE', 
            description: 'Photosynthesis reactions in stroma fixing CO2 into glucose'
          }
        }
      ]
    }
    
    const pairs = biologyPairs[difficulty] || biologyPairs.medium
    return pairs[Math.floor(Math.random() * pairs.length)]
  }

  // Chemistry concept pairs
  if (subject === 'chemistry') {
    const chemistryPairs = {
      easy: [
        {
          id: pairId,
          subject: 'chemistry',
          difficulty: 'easy',
          concept1: { 
            name: 'ACIDS', 
            description: 'Substances that donate protons (H+) in solution'
          },
          concept2: { 
            name: 'BASES', 
            description: 'Substances that accept protons or donate OH-'
          }
        },
        {
          id: pairId,
          subject: 'chemistry',
          difficulty: 'easy',
          concept1: { 
            name: 'IONIC BONDS', 
            description: 'Bonds formed by electron transfer between atoms'
          },
          concept2: { 
            name: 'COVALENT BONDS', 
            description: 'Bonds formed by electron sharing between atoms'
          }
        }
      ],
      medium: [
        {
          id: pairId,
          subject: 'chemistry',
          difficulty: 'medium',
          concept1: { 
            name: 'OXIDATION', 
            description: 'Loss of electrons or increase in oxidation state'
          },
          concept2: { 
            name: 'REDUCTION', 
            description: 'Gain of electrons or decrease in oxidation state'
          }
        },
        {
          id: pairId,
          subject: 'chemistry',
          difficulty: 'medium',
          concept1: { 
            name: 'EXOTHERMIC', 
            description: 'Reactions that release heat energy to surroundings'
          },
          concept2: { 
            name: 'ENDOTHERMIC', 
            description: 'Reactions that absorb heat energy from surroundings'
          }
        },
        {
          id: pairId,
          subject: 'chemistry',
          difficulty: 'medium',
          concept1: { 
            name: 'CATALYST', 
            description: 'Substance that speeds up reaction without being consumed'
          },
          concept2: { 
            name: 'INHIBITOR', 
            description: 'Substance that slows down or prevents reactions'
          }
        },
        {
          id: pairId,
          subject: 'chemistry',
          difficulty: 'medium',
          concept1: { 
            name: 'POLAR MOLECULES', 
            description: 'Molecules with unequal sharing of electrons'
          },
          concept2: { 
            name: 'NONPOLAR MOLECULES', 
            description: 'Molecules with equal sharing of electrons'
          }
        },
        {
          id: pairId,
          subject: 'chemistry',
          difficulty: 'medium',
          concept1: { 
            name: 'ATOMIC RADIUS', 
            description: 'Distance from nucleus to outermost electron shell'
          },
          concept2: { 
            name: 'IONIC RADIUS', 
            description: 'Size of an atom after gaining or losing electrons'
          }
        },
        {
          id: pairId,
          subject: 'chemistry',
          difficulty: 'medium',
          concept1: { 
            name: 'PHYSICAL CHANGE', 
            description: 'Change in form but not chemical composition'
          },
          concept2: { 
            name: 'CHEMICAL CHANGE', 
            description: 'Change that forms new substances with different properties'
          }
        }
      ],
      hard: [
        {
          id: pairId,
          subject: 'chemistry',
          difficulty: 'hard',
          concept1: { 
            name: 'KINETIC CONTROL', 
            description: 'Product formation governed by reaction rates'
          },
          concept2: { 
            name: 'THERMODYNAMIC CONTROL', 
            description: 'Product formation governed by stability/equilibrium'
          }
        }
      ]
    }
    
    const pairs = chemistryPairs[difficulty] || chemistryPairs.medium
    return pairs[Math.floor(Math.random() * pairs.length)]
  }

  // Physics concept pairs
  if (subject === 'physics') {
    const physicsPairs = {
      easy: [
        {
          id: pairId,
          subject: 'physics',
          difficulty: 'easy',
          concept1: { 
            name: 'SPEED', 
            description: 'Scalar quantity - how fast something moves'
          },
          concept2: { 
            name: 'VELOCITY', 
            description: 'Vector quantity - speed with direction'
          }
        },
        {
          id: pairId,
          subject: 'physics',
          difficulty: 'easy',
          concept1: { 
            name: 'MASS', 
            description: 'Amount of matter in an object (constant)'
          },
          concept2: { 
            name: 'WEIGHT', 
            description: 'Force of gravity acting on mass (varies)'
          }
        }
      ],
      medium: [
        {
          id: pairId,
          subject: 'physics',
          difficulty: 'medium',
          concept1: { 
            name: 'ALTERNATING CURRENT', 
            description: 'Current that changes direction periodically'
          },
          concept2: { 
            name: 'DIRECT CURRENT', 
            description: 'Current that flows in one direction only'
          }
        },
        {
          id: pairId,
          subject: 'physics',
          difficulty: 'medium',
          concept1: { 
            name: 'CONVEX LENS', 
            description: 'Converging lens that brings light rays together'
          },
          concept2: { 
            name: 'CONCAVE LENS', 
            description: 'Diverging lens that spreads light rays apart'
          }
        },
        {
          id: pairId,
          subject: 'physics',
          difficulty: 'medium',
          concept1: { 
            name: 'KINETIC ENERGY', 
            description: 'Energy of motion, depends on mass and velocity'
          },
          concept2: { 
            name: 'POTENTIAL ENERGY', 
            description: 'Stored energy due to position or condition'
          }
        },
        {
          id: pairId,
          subject: 'physics',
          difficulty: 'medium',
          concept1: { 
            name: 'CONDUCTOR', 
            description: 'Material that allows electric current to flow easily'
          },
          concept2: { 
            name: 'INSULATOR', 
            description: 'Material that resists the flow of electric current'
          }
        },
        {
          id: pairId,
          subject: 'physics',
          difficulty: 'medium',
          concept1: { 
            name: 'REFLECTION', 
            description: 'Light bouncing off a surface'
          },
          concept2: { 
            name: 'REFRACTION', 
            description: 'Light bending when passing through different media'
          }
        },
        {
          id: pairId,
          subject: 'physics',
          difficulty: 'medium',
          concept1: { 
            name: 'SERIES CIRCUIT', 
            description: 'Components connected in a single path'
          },
          concept2: { 
            name: 'PARALLEL CIRCUIT', 
            description: 'Components connected in multiple paths'
          }
        }
      ],
      hard: [
        {
          id: pairId,
          subject: 'physics',
          difficulty: 'hard',
          concept1: { 
            name: 'WAVE NATURE', 
            description: 'Light exhibits interference, diffraction, polarization'
          },
          concept2: { 
            name: 'PARTICLE NATURE', 
            description: 'Light exhibits photoelectric effect, quantized energy'
          }
        }
      ]
    }
    
    const pairs = physicsPairs[difficulty] || physicsPairs.medium
    return pairs[Math.floor(Math.random() * pairs.length)]
  }

  // Mathematics concept pairs
  if (subject === 'mathematics') {
    const mathPairs = {
      easy: [
        {
          id: pairId,
          subject: 'mathematics',
          difficulty: 'easy',
          concept1: { 
            name: 'MEAN', 
            description: 'Average value of a dataset'
          },
          concept2: { 
            name: 'MEDIAN', 
            description: 'Middle value when data is arranged in order'
          }
        }
      ],
      medium: [
        {
          id: pairId,
          subject: 'mathematics',
          difficulty: 'medium',
          concept1: { 
            name: 'PERMUTATION', 
            description: 'Arrangement where order matters'
          },
          concept2: { 
            name: 'COMBINATION', 
            description: 'Selection where order does not matter'
          }
        },
        {
          id: pairId,
          subject: 'mathematics',
          difficulty: 'medium',
          concept1: { 
            name: 'DERIVATIVE', 
            description: 'Rate of change at a specific point'
          },
          concept2: { 
            name: 'INTEGRAL', 
            description: 'Area under curve or antiderivative'
          }
        },
        {
          id: pairId,
          subject: 'mathematics',
          difficulty: 'medium',
          concept1: { 
            name: 'FUNCTION', 
            description: 'Relation where each input has exactly one output'
          },
          concept2: { 
            name: 'RELATION', 
            description: 'Any set of ordered pairs connecting inputs and outputs'
          }
        },
        {
          id: pairId,
          subject: 'mathematics',
          difficulty: 'medium',
          concept1: { 
            name: 'INDEPENDENT VARIABLE', 
            description: 'Input variable that can be freely chosen (x)'
          },
          concept2: { 
            name: 'DEPENDENT VARIABLE', 
            description: 'Output variable that depends on input (y)'
          }
        }
      ],
      hard: [
        {
          id: pairId,
          subject: 'mathematics',
          difficulty: 'hard',
          concept1: { 
            name: 'CONVERGENT SERIES', 
            description: 'Infinite series that approaches a finite limit'
          },
          concept2: { 
            name: 'DIVERGENT SERIES', 
            description: 'Infinite series that does not approach a limit'
          }
        }
      ]
    }
    
    const pairs = mathPairs[difficulty] || mathPairs.medium
    return pairs[Math.floor(Math.random() * pairs.length)]
  }

  // History concept pairs
  if (subject === 'history') {
    const historyPairs = {
      medium: [
        {
          id: pairId,
          subject: 'history',
          difficulty: 'medium',
          concept1: { 
            name: 'FEUDALISM', 
            description: 'Medieval system based on land ownership and loyalty'
          },
          concept2: { 
            name: 'CAPITALISM', 
            description: 'Economic system based on private ownership and profit'
          }
        },
        {
          id: pairId,
          subject: 'history',
          difficulty: 'medium',
          concept1: { 
            name: 'IMPERIALISM', 
            description: 'Policy of extending power through territorial acquisition'
          },
          concept2: { 
            name: 'COLONIALISM', 
            description: 'Practice of establishing settlements in foreign territories'
          }
        }
      ]
    }
    
    const pairs = historyPairs[difficulty] || historyPairs.medium
    return pairs[Math.floor(Math.random() * pairs.length)]
  }

  // Computer Science concept pairs
  if (subject === 'computer_science') {
    const csPairs = {
      easy: [
        {
          id: pairId,
          subject: 'computer_science',
          difficulty: 'easy',
          concept1: { 
            name: 'HARDWARE', 
            description: 'Physical components of a computer system'
          },
          concept2: { 
            name: 'SOFTWARE', 
            description: 'Programs and applications that run on hardware'
          }
        },
        {
          id: pairId,
          subject: 'computer_science',
          difficulty: 'easy',
          concept1: { 
            name: 'INPUT', 
            description: 'Data entered into a computer system'
          },
          concept2: { 
            name: 'OUTPUT', 
            description: 'Results produced by a computer system'
          }
        }
      ],
      medium: [
        {
          id: pairId,
          subject: 'computer_science',
          difficulty: 'medium',
          concept1: { 
            name: 'STACK', 
            description: 'LIFO data structure - Last In, First Out'
          },
          concept2: { 
            name: 'QUEUE', 
            description: 'FIFO data structure - First In, First Out'
          }
        },
        {
          id: pairId,
          subject: 'computer_science',
          difficulty: 'medium',
          concept1: { 
            name: 'COMPILATION', 
            description: 'Converting source code to machine code before execution'
          },
          concept2: { 
            name: 'INTERPRETATION', 
            description: 'Executing source code line by line at runtime'
          }
        }
      ],
      hard: [
        {
          id: pairId,
          subject: 'computer_science',
          difficulty: 'hard',
          concept1: { 
            name: 'BREADTH-FIRST SEARCH', 
            description: 'Graph traversal exploring all neighbors before going deeper'
          },
          concept2: { 
            name: 'DEPTH-FIRST SEARCH', 
            description: 'Graph traversal going as deep as possible before backtracking'
          }
        }
      ]
    }
    
    const pairs = csPairs[difficulty] || csPairs.medium
    return pairs[Math.floor(Math.random() * pairs.length)]
  }

  // Literature concept pairs
  if (subject === 'literature') {
    const literaturePairs = {
      medium: [
        {
          id: pairId,
          subject: 'literature',
          difficulty: 'medium',
          concept1: { 
            name: 'METAPHOR', 
            description: 'Direct comparison without using like or as'
          },
          concept2: { 
            name: 'SIMILE', 
            description: 'Comparison using like or as'
          }
        },
        {
          id: pairId,
          subject: 'literature',
          difficulty: 'medium',
          concept1: { 
            name: 'PROTAGONIST', 
            description: 'Main character or hero of a story'
          },
          concept2: { 
            name: 'ANTAGONIST', 
            description: 'Character or force opposing the protagonist'
          }
        }
      ]
    }
    
    const pairs = literaturePairs[difficulty] || literaturePairs.medium
    return pairs[Math.floor(Math.random() * pairs.length)]
  }

  // Default fallback
  return {
    id: pairId,
    subject: subject,
    difficulty: difficulty,
    concept1: { 
      name: 'CONCEPT A', 
      description: 'First concept for classification'
    },
    concept2: { 
      name: 'CONCEPT B', 
      description: 'Second concept for classification'
    }
  }
}

function generatePhrase(conceptPair, subject, difficulty, usedPhrases = []) {
  const phraseId = Math.random().toString(36).substr(2, 9)
  
  // Get phrase database for the concept pair
  const phrases = getPhraseDatabase(conceptPair, subject, difficulty)
  
  // Create a unique key for this concept pair to track usage
  const pairKey = `${conceptPair.concept1.name}_${conceptPair.concept2.name}`
  
  // Filter out recently used phrases (last 50% of phrase pool)
  const recentlyUsedCount = Math.floor(phrases.length * 0.5)
  const recentPhrases = usedPhrases.slice(-recentlyUsedCount)
  
  // First, try to get phrases not recently used
  let availablePhrases = phrases.filter(phrase => 
    !recentPhrases.includes(phrase.text)
  )
  
  // If we've used most phrases recently, use all phrases but prioritize least recent
  if (availablePhrases.length === 0) {
    availablePhrases = phrases
  }
  
  // Weighted selection - phrases used less recently have higher probability
  const weightedPhrases = availablePhrases.map((phrase, index) => {
    const lastUsedIndex = usedPhrases.lastIndexOf(phrase.text)
    const weight = lastUsedIndex === -1 ? 10 : Math.max(1, usedPhrases.length - lastUsedIndex)
    return { ...phrase, weight }
  })
  
  // Select based on weights
  const totalWeight = weightedPhrases.reduce((sum, phrase) => sum + phrase.weight, 0)
  let randomValue = Math.random() * totalWeight
  
  let selectedPhrase = weightedPhrases[0]
  for (const phrase of weightedPhrases) {
    randomValue -= phrase.weight
    if (randomValue <= 0) {
      selectedPhrase = phrase
      break
    }
  }
  
  return {
    id: phraseId,
    text: selectedPhrase.text,
    belongsTo: selectedPhrase.belongsTo,
    explanation: selectedPhrase.explanation
  }
}

function getPhraseDatabase(conceptPair, subject, difficulty) {
  const concept1Name = conceptPair.concept1.name
  const concept2Name = conceptPair.concept2.name
  
  // Biology phrases
  if (subject === 'biology') {
    if (concept1Name === 'MITOSIS' && concept2Name === 'MEIOSIS') {
      return [
        { text: 'Results in two identical daughter cells', belongsTo: 'MITOSIS', explanation: 'Mitosis produces genetically identical diploid cells' },
        { text: 'Results in four genetically unique daughter cells', belongsTo: 'MEIOSIS', explanation: 'Meiosis produces genetically diverse gametes' },
        { text: 'Maintains chromosome number', belongsTo: 'MITOSIS', explanation: 'Diploid parent produces diploid offspring' },
        { text: 'Reduces chromosome number by half', belongsTo: 'MEIOSIS', explanation: 'Diploid parent produces haploid gametes' },
        { text: 'Occurs in somatic cells', belongsTo: 'MITOSIS', explanation: 'Body cells undergo mitosis for growth and repair' },
        { text: 'Occurs in reproductive cells', belongsTo: 'MEIOSIS', explanation: 'Gametes are produced through meiosis' },
        { text: 'Crossing over does not occur', belongsTo: 'MITOSIS', explanation: 'No genetic recombination in mitosis' },
        { text: 'Crossing over occurs during prophase I', belongsTo: 'MEIOSIS', explanation: 'Genetic recombination increases diversity' },
        { text: 'One division cycle', belongsTo: 'MITOSIS', explanation: 'Single division produces two cells' },
        { text: 'Two division cycles', belongsTo: 'MEIOSIS', explanation: 'Two divisions produce four cells' },
        { text: 'Homologous chromosomes do not pair', belongsTo: 'MITOSIS', explanation: 'Chromosomes line up individually' },
        { text: 'Homologous chromosomes pair during synapsis', belongsTo: 'MEIOSIS', explanation: 'Pairing allows for crossing over' },
        { text: 'Produces diploid cells (2n)', belongsTo: 'MITOSIS', explanation: 'Full chromosome complement maintained' },
        { text: 'Produces haploid cells (n)', belongsTo: 'MEIOSIS', explanation: 'Half the chromosome number' },
        { text: 'Purpose is growth and repair', belongsTo: 'MITOSIS', explanation: 'Replaces damaged or worn-out cells' },
        { text: 'Purpose is sexual reproduction', belongsTo: 'MEIOSIS', explanation: 'Creates gametes for reproduction' },
        { text: 'Prophase, metaphase, anaphase, telophase', belongsTo: 'MITOSIS', explanation: 'Four phases in one division' },
        { text: 'Prophase I/II, metaphase I/II, anaphase I/II, telophase I/II', belongsTo: 'MEIOSIS', explanation: 'Eight phases across two divisions' },
        { text: 'Centromeres divide during anaphase', belongsTo: 'MITOSIS', explanation: 'Sister chromatids separate' },
        { text: 'Centromeres divide only in anaphase II', belongsTo: 'MEIOSIS', explanation: 'First division separates homologs, second separates chromatids' },
        { text: 'No genetic variation among products', belongsTo: 'MITOSIS', explanation: 'All daughter cells genetically identical' },
        { text: 'Maximum genetic variation among products', belongsTo: 'MEIOSIS', explanation: 'Independent assortment and crossing over create diversity' },
        { text: 'Duration is relatively short', belongsTo: 'MITOSIS', explanation: 'Typically takes 1-2 hours' },
        { text: 'Duration is relatively long', belongsTo: 'MEIOSIS', explanation: 'Can take days to weeks, especially in females' },
        { text: 'Occurs continuously throughout life', belongsTo: 'MITOSIS', explanation: 'Constant cell replacement and growth' },
        { text: 'Occurs only during reproductive maturity', belongsTo: 'MEIOSIS', explanation: 'Limited to reproductive years' },
        { text: 'Independent assortment does not occur', belongsTo: 'MITOSIS', explanation: 'Maternal and paternal chromosomes segregate together' },
        { text: 'Independent assortment occurs', belongsTo: 'MEIOSIS', explanation: 'Random distribution of chromosomes to gametes' },
        { text: 'Chiasmata formation is absent', belongsTo: 'MITOSIS', explanation: 'No crossing over points' },
        { text: 'Chiasmata formation occurs', belongsTo: 'MEIOSIS', explanation: 'Physical manifestation of crossing over' },
        { text: 'Bivalent formation does not occur', belongsTo: 'MITOSIS', explanation: 'Homologs remain separate' },
        { text: 'Bivalent formation occurs', belongsTo: 'MEIOSIS', explanation: 'Homologous pairs come together' }
      ]
    }
    
    if (concept1Name === 'PHOTOSYNTHESIS' && concept2Name === 'CELLULAR RESPIRATION') {
      return [
        { text: 'Converts CO₂ and H₂O into glucose', belongsTo: 'PHOTOSYNTHESIS', explanation: 'Builds glucose from simple molecules' },
        { text: 'Breaks down glucose to release energy', belongsTo: 'CELLULAR RESPIRATION', explanation: 'Glucose is metabolized for ATP' },
        { text: 'Requires sunlight energy', belongsTo: 'PHOTOSYNTHESIS', explanation: 'Light-dependent reactions drive the process' },
        { text: 'Occurs in mitochondria', belongsTo: 'CELLULAR RESPIRATION', explanation: 'Mitochondria are the powerhouses of cells' },
        { text: 'Occurs in chloroplasts', belongsTo: 'PHOTOSYNTHESIS', explanation: 'Chloroplasts contain chlorophyll for light capture' },
        { text: 'Produces oxygen as a byproduct', belongsTo: 'PHOTOSYNTHESIS', explanation: 'Water splitting releases O₂' },
        { text: 'Consumes oxygen', belongsTo: 'CELLULAR RESPIRATION', explanation: 'Oxygen is used in the electron transport chain' },
        { text: 'Anabolic process', belongsTo: 'PHOTOSYNTHESIS', explanation: 'Builds complex molecules from simple ones' },
        { text: 'Catabolic process', belongsTo: 'CELLULAR RESPIRATION', explanation: 'Breaks down complex molecules' },
        { text: 'Equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂', belongsTo: 'PHOTOSYNTHESIS', explanation: 'Overall photosynthesis equation' },
        { text: 'Equation: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP', belongsTo: 'CELLULAR RESPIRATION', explanation: 'Overall cellular respiration equation' },
        { text: 'Stores energy in chemical bonds', belongsTo: 'PHOTOSYNTHESIS', explanation: 'Energy captured and stored as glucose' },
        { text: 'Releases energy from chemical bonds', belongsTo: 'CELLULAR RESPIRATION', explanation: 'Energy released and captured as ATP' },
        { text: 'Occurs only in plants and some bacteria', belongsTo: 'PHOTOSYNTHESIS', explanation: 'Limited to photosynthetic organisms' },
        { text: 'Occurs in all living organisms', belongsTo: 'CELLULAR RESPIRATION', explanation: 'Universal energy-releasing process' },
        { text: 'Light-dependent and light-independent reactions', belongsTo: 'PHOTOSYNTHESIS', explanation: 'Two main stages of photosynthesis' },
        { text: 'Glycolysis, Krebs cycle, electron transport', belongsTo: 'CELLULAR RESPIRATION', explanation: 'Three main stages of respiration' },
        { text: 'Produces glucose and oxygen', belongsTo: 'PHOTOSYNTHESIS', explanation: 'Main products of photosynthesis' },
        { text: 'Produces carbon dioxide and water', belongsTo: 'CELLULAR RESPIRATION', explanation: 'Main waste products of respiration' },
        { text: 'Uses carbon dioxide as raw material', belongsTo: 'PHOTOSYNTHESIS', explanation: 'CO₂ is incorporated into glucose' },
        { text: 'Produces carbon dioxide as waste', belongsTo: 'CELLULAR RESPIRATION', explanation: 'CO₂ is released during glucose breakdown' },
        { text: 'Occurs primarily during daytime', belongsTo: 'PHOTOSYNTHESIS', explanation: 'Requires light for optimal operation' },
        { text: 'Occurs continuously day and night', belongsTo: 'CELLULAR RESPIRATION', explanation: 'Constant energy production needed' },
        { text: 'Chlorophyll captures light energy', belongsTo: 'PHOTOSYNTHESIS', explanation: 'Green pigment absorbs photons' },
        { text: 'Enzyme complexes release chemical energy', belongsTo: 'CELLULAR RESPIRATION', explanation: 'Protein machinery breaks down glucose' },
        { text: 'Water is split to provide electrons', belongsTo: 'PHOTOSYNTHESIS', explanation: 'H₂O breakdown provides reducing power' },
        { text: 'Water is produced as final product', belongsTo: 'CELLULAR RESPIRATION', explanation: 'H₂O forms when oxygen accepts electrons' },
        { text: 'NADPH and ATP are produced', belongsTo: 'PHOTOSYNTHESIS', explanation: 'Energy carriers for glucose synthesis' },
        { text: 'NADH and ATP are produced', belongsTo: 'CELLULAR RESPIRATION', explanation: 'Energy carriers from glucose breakdown' },
        { text: 'Thylakoids and stroma are involved', belongsTo: 'PHOTOSYNTHESIS', explanation: 'Internal chloroplast structures' },
        { text: 'Cytoplasm and mitochondrial matrix involved', belongsTo: 'CELLULAR RESPIRATION', explanation: 'Multiple cellular locations' },
        { text: 'Reduces atmospheric CO₂ levels', belongsTo: 'PHOTOSYNTHESIS', explanation: 'Removes CO₂ from atmosphere' },
        { text: 'Increases atmospheric CO₂ levels', belongsTo: 'CELLULAR RESPIRATION', explanation: 'Releases CO₂ to atmosphere' }
      ]
    }

    if (concept1Name === 'PLANT CELL' && concept2Name === 'ANIMAL CELL') {
      return [
        { text: 'Has a rigid cell wall', belongsTo: 'PLANT CELL', explanation: 'Cell wall provides structural support' },
        { text: 'Has centrioles for cell division', belongsTo: 'ANIMAL CELL', explanation: 'Centrioles organize spindle fibers' },
        { text: 'Contains chloroplasts', belongsTo: 'PLANT CELL', explanation: 'Chloroplasts enable photosynthesis' },
        { text: 'Has a large central vacuole', belongsTo: 'PLANT CELL', explanation: 'Central vacuole maintains turgor pressure' },
        { text: 'Has multiple small vacuoles', belongsTo: 'ANIMAL CELL', explanation: 'Animal cells have smaller, specialized vacuoles' },
        { text: 'Rectangular or fixed shape', belongsTo: 'PLANT CELL', explanation: 'Cell wall maintains rigid structure' },
        { text: 'Round or irregular shape', belongsTo: 'ANIMAL CELL', explanation: 'Flexible cell membrane allows shape changes' },
        { text: 'Produces its own food through photosynthesis', belongsTo: 'PLANT CELL', explanation: 'Autotrophic - makes glucose from sunlight' },
        { text: 'Must consume other organisms for energy', belongsTo: 'ANIMAL CELL', explanation: 'Heterotrophic - obtains energy from food' },
        { text: 'Contains cellulose in cell wall', belongsTo: 'PLANT CELL', explanation: 'Cellulose provides rigidity and strength' },
        { text: 'Has lysosomes for waste disposal', belongsTo: 'ANIMAL CELL', explanation: 'Lysosomes digest cellular waste' }
      ]
    }

    if (concept1Name === 'PROKARYOTES' && concept2Name === 'EUKARYOTES') {
      return [
        { text: 'No membrane-bound nucleus', belongsTo: 'PROKARYOTES', explanation: 'DNA freely floats in cytoplasm' },
        { text: 'Has membrane-bound nucleus', belongsTo: 'EUKARYOTES', explanation: 'DNA is enclosed in nuclear envelope' },
        { text: 'No membrane-bound organelles', belongsTo: 'PROKARYOTES', explanation: 'Simple internal structure' },
        { text: 'Contains membrane-bound organelles', belongsTo: 'EUKARYOTES', explanation: 'Complex compartmentalized structure' },
        { text: 'Single circular chromosome', belongsTo: 'PROKARYOTES', explanation: 'DNA organized as single circular molecule' },
        { text: 'Multiple linear chromosomes', belongsTo: 'EUKARYOTES', explanation: 'DNA organized on separate chromosomes' },
        { text: 'Reproduces by binary fission', belongsTo: 'PROKARYOTES', explanation: 'Simple cell division process' },
        { text: 'Reproduces by mitosis or meiosis', belongsTo: 'EUKARYOTES', explanation: 'Complex cell division processes' },
        { text: 'Examples include bacteria', belongsTo: 'PROKARYOTES', explanation: 'Bacteria are prokaryotic organisms' },
        { text: 'Examples include plants and animals', belongsTo: 'EUKARYOTES', explanation: 'Complex multicellular organisms' }
      ]
    }

    if (concept1Name === 'VERTEBRATES' && concept2Name === 'INVERTEBRATES') {
      return [
        { text: 'Has a backbone or spine', belongsTo: 'VERTEBRATES', explanation: 'Vertebral column provides structural support' },
        { text: 'No backbone or spine', belongsTo: 'INVERTEBRATES', explanation: 'Lacks vertebral column' },
        { text: 'Has an internal skeleton', belongsTo: 'VERTEBRATES', explanation: 'Endoskeleton made of bone or cartilage' },
        { text: 'May have external skeleton', belongsTo: 'INVERTEBRATES', explanation: 'Exoskeleton like in arthropods' },
        { text: 'Examples include fish, birds, mammals', belongsTo: 'VERTEBRATES', explanation: 'All have spinal columns' },
        { text: 'Examples include insects, worms, jellyfish', belongsTo: 'INVERTEBRATES', explanation: 'Diverse group without spines' },
        { text: 'Has a skull protecting the brain', belongsTo: 'VERTEBRATES', explanation: 'Cranium encases the brain' },
        { text: 'Brain may be simple or absent', belongsTo: 'INVERTEBRATES', explanation: 'Nervous systems vary greatly' },
        { text: 'Bilateral symmetry is common', belongsTo: 'VERTEBRATES', explanation: 'Left and right sides mirror each other' },
        { text: 'May have radial or other symmetries', belongsTo: 'INVERTEBRATES', explanation: 'Diverse body plan arrangements' }
      ]
    }

    if (concept1Name === 'ARTERIES' && concept2Name === 'VEINS') {
      return [
        { text: 'Carries blood away from heart', belongsTo: 'ARTERIES', explanation: 'Blood flows from heart to body tissues' },
        { text: 'Carries blood toward heart', belongsTo: 'VEINS', explanation: 'Blood returns from tissues to heart' },
        { text: 'High blood pressure', belongsTo: 'ARTERIES', explanation: 'Directly receives pumped blood from heart' },
        { text: 'Lower blood pressure', belongsTo: 'VEINS', explanation: 'Pressure drops as blood travels through circulation' },
        { text: 'Thick muscular walls', belongsTo: 'ARTERIES', explanation: 'Must withstand high pressure from heartbeats' },
        { text: 'Thin walls with valves', belongsTo: 'VEINS', explanation: 'Valves prevent blood from flowing backward' },
        { text: 'Usually carries oxygenated blood', belongsTo: 'ARTERIES', explanation: 'Except pulmonary arteries to lungs' },
        { text: 'Usually carries deoxygenated blood', belongsTo: 'VEINS', explanation: 'Except pulmonary veins from lungs' },
        { text: 'Pulse can be felt', belongsTo: 'ARTERIES', explanation: 'Rhythmic pressure waves from heartbeat' },
        { text: 'No detectable pulse', belongsTo: 'VEINS', explanation: 'Steady, low-pressure flow' }
      ]
    }

    if (concept1Name === 'GENOTYPE' && concept2Name === 'PHENOTYPE') {
      return [
        { text: 'The genetic makeup of an organism', belongsTo: 'GENOTYPE', explanation: 'Actual genes and alleles present' },
        { text: 'Observable physical characteristics', belongsTo: 'PHENOTYPE', explanation: 'What you can see or measure' },
        { text: 'Written as letter combinations (Aa, BB)', belongsTo: 'GENOTYPE', explanation: 'Genetic notation system' },
        { text: 'Described as traits (tall, blue eyes)', belongsTo: 'PHENOTYPE', explanation: 'Physical descriptions' },
        { text: 'Cannot be directly observed', belongsTo: 'GENOTYPE', explanation: 'Requires genetic testing to determine' },
        { text: 'Can be directly observed', belongsTo: 'PHENOTYPE', explanation: 'Visible or measurable traits' },
        { text: 'Inherited from parents', belongsTo: 'GENOTYPE', explanation: 'Combination of parental alleles' },
        { text: 'Result of gene expression', belongsTo: 'PHENOTYPE', explanation: 'How genes are expressed as traits' },
        { text: 'May include recessive alleles', belongsTo: 'GENOTYPE', explanation: 'Hidden alleles not expressed' },
        { text: 'Only shows dominant traits', belongsTo: 'PHENOTYPE', explanation: 'Only expressed alleles are visible' },
        { text: 'Example: Bb (brown eye alleles)', belongsTo: 'GENOTYPE', explanation: 'Genetic composition' },
        { text: 'Example: Brown eyes (visible trait)', belongsTo: 'PHENOTYPE', explanation: 'Observable characteristic' }
      ]
    }

    if (concept1Name === 'DOMINANT ALLELE' && concept2Name === 'RECESSIVE ALLELE') {
      return [
        { text: 'Expressed when present', belongsTo: 'DOMINANT ALLELE', explanation: 'Shows up in phenotype when present' },
        { text: 'Only expressed when homozygous', belongsTo: 'RECESSIVE ALLELE', explanation: 'Needs two copies to be expressed' },
        { text: 'Represented by uppercase letter', belongsTo: 'DOMINANT ALLELE', explanation: 'Convention: A, B, C, etc.' },
        { text: 'Represented by lowercase letter', belongsTo: 'RECESSIVE ALLELE', explanation: 'Convention: a, b, c, etc.' },
        { text: 'Masks expression of other allele', belongsTo: 'DOMINANT ALLELE', explanation: 'Hides recessive allele in heterozygotes' },
        { text: 'Expression is masked by other allele', belongsTo: 'RECESSIVE ALLELE', explanation: 'Hidden in heterozygotes' },
        { text: 'Shown in Aa and AA genotypes', belongsTo: 'DOMINANT ALLELE', explanation: 'Expressed in both cases' },
        { text: 'Only shown in aa genotype', belongsTo: 'RECESSIVE ALLELE', explanation: 'Needs homozygous condition' },
        { text: 'Example: B (brown eyes)', belongsTo: 'DOMINANT ALLELE', explanation: 'Brown eye allele dominates' },
        { text: 'Example: b (blue eyes)', belongsTo: 'RECESSIVE ALLELE', explanation: 'Blue eyes only with bb' }
      ]
    }

    if (concept1Name === 'NATURAL SELECTION' && concept2Name === 'GENETIC DRIFT') {
      return [
        { text: 'Non-random process', belongsTo: 'NATURAL SELECTION', explanation: 'Favors beneficial traits systematically' },
        { text: 'Random process', belongsTo: 'GENETIC DRIFT', explanation: 'Changes occur by chance alone' },
        { text: 'Increases fitness over time', belongsTo: 'NATURAL SELECTION', explanation: 'Populations become better adapted' },
        { text: 'No relationship to fitness', belongsTo: 'GENETIC DRIFT', explanation: 'Random changes regardless of benefit' },
        { text: 'More effective in large populations', belongsTo: 'NATURAL SELECTION', explanation: 'Selection pressure consistent' },
        { text: 'More effective in small populations', belongsTo: 'GENETIC DRIFT', explanation: 'Random events have bigger impact' },
        { text: 'Leads to adaptation', belongsTo: 'NATURAL SELECTION', explanation: 'Organisms become better suited to environment' },
        { text: 'Can lead to loss of beneficial alleles', belongsTo: 'GENETIC DRIFT', explanation: 'Random loss regardless of advantage' },
        { text: 'Darwin\'s mechanism of evolution', belongsTo: 'NATURAL SELECTION', explanation: 'Survival of the fittest concept' },
        { text: 'Sewall Wright\'s mechanism of evolution', belongsTo: 'GENETIC DRIFT', explanation: 'Random sampling effects' }
      ]
    }
  }

  // Chemistry phrases
  if (subject === 'chemistry') {
    if (concept1Name === 'OXIDATION' && concept2Name === 'REDUCTION') {
      return [
        { text: 'Loss of electrons', belongsTo: 'OXIDATION', explanation: 'OIL: Oxidation Is Loss of electrons' },
        { text: 'Gain of electrons', belongsTo: 'REDUCTION', explanation: 'RIG: Reduction Is Gain of electrons' },
        { text: 'Increase in oxidation state', belongsTo: 'OXIDATION', explanation: 'Oxidation number becomes more positive' },
        { text: 'Decrease in oxidation state', belongsTo: 'REDUCTION', explanation: 'Oxidation number becomes more negative' },
        { text: 'Occurs at the anode', belongsTo: 'OXIDATION', explanation: 'Anode is where oxidation takes place' },
        { text: 'Occurs at the cathode', belongsTo: 'REDUCTION', explanation: 'Cathode is where reduction takes place' },
        { text: 'Substance is an electron donor', belongsTo: 'OXIDATION', explanation: 'Oxidized species gives up electrons' },
        { text: 'Substance is an electron acceptor', belongsTo: 'REDUCTION', explanation: 'Reduced species receives electrons' }
      ]
    }

    if (concept1Name === 'ACIDS' && concept2Name === 'BASES') {
      return [
        { text: 'pH less than 7', belongsTo: 'ACIDS', explanation: 'Acidic solutions have pH below 7' },
        { text: 'pH greater than 7', belongsTo: 'BASES', explanation: 'Basic solutions have pH above 7' },
        { text: 'Donates protons (H+)', belongsTo: 'ACIDS', explanation: 'Brønsted-Lowry definition of acids' },
        { text: 'Accepts protons (H+)', belongsTo: 'BASES', explanation: 'Brønsted-Lowry definition of bases' },
        { text: 'Turns litmus paper red', belongsTo: 'ACIDS', explanation: 'Acid indicator test' },
        { text: 'Turns litmus paper blue', belongsTo: 'BASES', explanation: 'Base indicator test' },
        { text: 'Tastes sour', belongsTo: 'ACIDS', explanation: 'Characteristic taste of acids' },
        { text: 'Feels slippery', belongsTo: 'BASES', explanation: 'Characteristic feel of bases' },
        { text: 'Examples: HCl, H₂SO₄, vinegar', belongsTo: 'ACIDS', explanation: 'Common acids in chemistry and daily life' },
        { text: 'Examples: NaOH, NH₃, soap', belongsTo: 'BASES', explanation: 'Common bases in chemistry and daily life' },
        { text: 'Neutralized by bases', belongsTo: 'ACIDS', explanation: 'Acid-base neutralization reactions' },
        { text: 'Neutralized by acids', belongsTo: 'BASES', explanation: 'Base-acid neutralization reactions' },
        { text: 'Conducts electricity when dissolved', belongsTo: 'ACIDS', explanation: 'Ionizes to produce charged particles' },
        { text: 'Conducts electricity when dissolved', belongsTo: 'BASES', explanation: 'Ionizes to produce charged particles' }
      ]
    }

    if (concept1Name === 'IONIC BONDS' && concept2Name === 'COVALENT BONDS') {
      return [
        { text: 'Formed by electron transfer', belongsTo: 'IONIC BONDS', explanation: 'Electrons move from metal to nonmetal' },
        { text: 'Formed by electron sharing', belongsTo: 'COVALENT BONDS', explanation: 'Electrons shared between atoms' },
        { text: 'Between metal and nonmetal', belongsTo: 'IONIC BONDS', explanation: 'Large electronegativity difference' },
        { text: 'Between nonmetal atoms', belongsTo: 'COVALENT BONDS', explanation: 'Similar electronegativity values' },
        { text: 'Forms crystalline structures', belongsTo: 'IONIC BONDS', explanation: 'Regular lattice arrangement of ions' },
        { text: 'Forms discrete molecules', belongsTo: 'COVALENT BONDS', explanation: 'Atoms bonded in specific arrangements' },
        { text: 'High melting and boiling points', belongsTo: 'IONIC BONDS', explanation: 'Strong electrostatic attractions' },
        { text: 'Variable melting and boiling points', belongsTo: 'COVALENT BONDS', explanation: 'Depends on molecular size and polarity' },
        { text: 'Conducts electricity when dissolved', belongsTo: 'IONIC BONDS', explanation: 'Free ions carry electric current' },
        { text: 'Usually does not conduct electricity', belongsTo: 'COVALENT BONDS', explanation: 'No free charges available' }
      ]
    }

    if (concept1Name === 'POLAR MOLECULES' && concept2Name === 'NONPOLAR MOLECULES') {
      return [
        { text: 'Unequal sharing of electrons', belongsTo: 'POLAR MOLECULES', explanation: 'Electronegativity differences create partial charges' },
        { text: 'Equal sharing of electrons', belongsTo: 'NONPOLAR MOLECULES', explanation: 'Similar electronegativity, no charge separation' },
        { text: 'Has partial positive and negative ends', belongsTo: 'POLAR MOLECULES', explanation: 'Dipole moment exists' },
        { text: 'No charge separation', belongsTo: 'NONPOLAR MOLECULES', explanation: 'Uniform electron distribution' },
        { text: 'Dissolves in water (hydrophilic)', belongsTo: 'POLAR MOLECULES', explanation: 'Like dissolves like - polar in polar' },
        { text: 'Does not dissolve in water (hydrophobic)', belongsTo: 'NONPOLAR MOLECULES', explanation: 'Immiscible with polar solvents' },
        { text: 'Examples: H₂O, NH₃, HCl', belongsTo: 'POLAR MOLECULES', explanation: 'Common polar molecules' },
        { text: 'Examples: CO₂, CH₄, O₂', belongsTo: 'NONPOLAR MOLECULES', explanation: 'Common nonpolar molecules' },
        { text: 'Forms hydrogen bonds', belongsTo: 'POLAR MOLECULES', explanation: 'Strong intermolecular forces' },
        { text: 'Only weak van der Waals forces', belongsTo: 'NONPOLAR MOLECULES', explanation: 'Weaker intermolecular attractions' },
        { text: 'Higher boiling points generally', belongsTo: 'POLAR MOLECULES', explanation: 'Stronger intermolecular forces' },
        { text: 'Lower boiling points generally', belongsTo: 'NONPOLAR MOLECULES', explanation: 'Weaker intermolecular forces' },
        { text: 'Has a net dipole moment', belongsTo: 'POLAR MOLECULES', explanation: 'Charge centers do not coincide' },
        { text: 'Net dipole moment is zero', belongsTo: 'NONPOLAR MOLECULES', explanation: 'Symmetrical charge distribution' },
        { text: 'Water molecule (bent shape)', belongsTo: 'POLAR MOLECULES', explanation: 'O-H bonds create asymmetric charge distribution' },
        { text: 'Carbon dioxide (linear shape)', belongsTo: 'NONPOLAR MOLECULES', explanation: 'C=O bonds cancel each other out' },
        { text: 'Ammonia molecule (pyramidal)', belongsTo: 'POLAR MOLECULES', explanation: 'N-H bonds create net dipole' },
        { text: 'Methane molecule (tetrahedral)', belongsTo: 'NONPOLAR MOLECULES', explanation: 'C-H bonds are symmetrically arranged' },
        { text: 'Mixes well with alcohols', belongsTo: 'POLAR MOLECULES', explanation: 'Both polar, similar intermolecular forces' },
        { text: 'Mixes well with oils and fats', belongsTo: 'NONPOLAR MOLECULES', explanation: 'Like dissolves like principle' },
        { text: 'Higher surface tension', belongsTo: 'POLAR MOLECULES', explanation: 'Stronger cohesive forces between molecules' },
        { text: 'Lower surface tension', belongsTo: 'NONPOLAR MOLECULES', explanation: 'Weaker cohesive forces' },
        { text: 'Good electrical conductivity when dissolved', belongsTo: 'POLAR MOLECULES', explanation: 'Can ionize or associate with ions' },
        { text: 'Poor electrical conductivity', belongsTo: 'NONPOLAR MOLECULES', explanation: 'No charge separation to carry current' },
        { text: 'Hydrogen fluoride (HF)', belongsTo: 'POLAR MOLECULES', explanation: 'Large electronegativity difference' },
        { text: 'Hydrogen gas (H₂)', belongsTo: 'NONPOLAR MOLECULES', explanation: 'Identical atoms, no electronegativity difference' },
        { text: 'Higher solubility in polar solvents', belongsTo: 'POLAR MOLECULES', explanation: 'Favorable interactions with polar environment' },
        { text: 'Higher solubility in nonpolar solvents', belongsTo: 'NONPOLAR MOLECULES', explanation: 'Favorable interactions with nonpolar environment' },
        { text: 'Can form micelles in water', belongsTo: 'POLAR MOLECULES', explanation: 'Polar heads interact with water' },
        { text: 'Forms the core of micelles', belongsTo: 'NONPOLAR MOLECULES', explanation: 'Hydrophobic tails cluster together' }
      ]
    }

    if (concept1Name === 'PHYSICAL CHANGE' && concept2Name === 'CHEMICAL CHANGE') {
      return [
        { text: 'No new substances formed', belongsTo: 'PHYSICAL CHANGE', explanation: 'Same chemical composition maintained' },
        { text: 'New substances with different properties formed', belongsTo: 'CHEMICAL CHANGE', explanation: 'Chemical bonds broken and reformed' },
        { text: 'Usually reversible', belongsTo: 'PHYSICAL CHANGE', explanation: 'Can return to original state' },
        { text: 'Usually irreversible', belongsTo: 'CHEMICAL CHANGE', explanation: 'Difficult to reverse without other reactions' },
        { text: 'Examples: melting, freezing, dissolving', belongsTo: 'PHYSICAL CHANGE', explanation: 'State changes and mixing' },
        { text: 'Examples: burning, rusting, digestion', belongsTo: 'CHEMICAL CHANGE', explanation: 'Bond breaking and forming' },
        { text: 'No change in chemical properties', belongsTo: 'PHYSICAL CHANGE', explanation: 'Same molecular identity' },
        { text: 'Chemical properties change', belongsTo: 'CHEMICAL CHANGE', explanation: 'New molecular identities' },
        { text: 'Energy changes are usually small', belongsTo: 'PHYSICAL CHANGE', explanation: 'Mainly affects intermolecular forces' },
        { text: 'Energy changes can be large', belongsTo: 'CHEMICAL CHANGE', explanation: 'Breaking and forming chemical bonds' },
        { text: 'Molecular structure remains the same', belongsTo: 'PHYSICAL CHANGE', explanation: 'Only arrangement or state changes' },
        { text: 'Molecular structure changes', belongsTo: 'CHEMICAL CHANGE', explanation: 'Atoms rearrange to form new molecules' },
        { text: 'Ice melting to water', belongsTo: 'PHYSICAL CHANGE', explanation: 'H₂O molecules unchanged, just state change' },
        { text: 'Wood burning to ash and smoke', belongsTo: 'CHEMICAL CHANGE', explanation: 'Cellulose converts to CO₂, H₂O, and other compounds' },
        { text: 'Sugar dissolving in water', belongsTo: 'PHYSICAL CHANGE', explanation: 'Sugar molecules separate but remain unchanged' },
        { text: 'Sugar caramelizing when heated', belongsTo: 'CHEMICAL CHANGE', explanation: 'Sugar molecules break down and form new compounds' },
        { text: 'Cutting paper into pieces', belongsTo: 'PHYSICAL CHANGE', explanation: 'Same cellulose, just smaller pieces' },
        { text: 'Paper burning to produce ash', belongsTo: 'CHEMICAL CHANGE', explanation: 'Cellulose reacts with oxygen to form new substances' },
        { text: 'Iron changing shape when hammered', belongsTo: 'PHYSICAL CHANGE', explanation: 'Iron atoms rearrange but remain iron' },
        { text: 'Iron rusting in moist air', belongsTo: 'CHEMICAL CHANGE', explanation: 'Iron reacts with oxygen to form iron oxide' },
        { text: 'Wax melting from heat', belongsTo: 'PHYSICAL CHANGE', explanation: 'Wax molecules gain energy but stay the same' },
        { text: 'Candle burning and producing soot', belongsTo: 'CHEMICAL CHANGE', explanation: 'Wax reacts with oxygen, forming CO₂ and H₂O' },
        { text: 'Alcohol evaporating from solution', belongsTo: 'PHYSICAL CHANGE', explanation: 'Ethanol molecules escape but remain ethanol' },
        { text: 'Alcohol fermenting from grape juice', belongsTo: 'CHEMICAL CHANGE', explanation: 'Glucose converts to ethanol and CO₂' },
        { text: 'Salt crystals forming from solution', belongsTo: 'PHYSICAL CHANGE', explanation: 'Salt molecules arrange in crystal pattern' },
        { text: 'Electrolysis breaking salt into elements', belongsTo: 'CHEMICAL CHANGE', explanation: 'NaCl breaks into sodium and chlorine' },
        { text: 'Dry ice sublimating to gas', belongsTo: 'PHYSICAL CHANGE', explanation: 'CO₂ changes state from solid to gas' },
        { text: 'Baking soda reacting with vinegar', belongsTo: 'CHEMICAL CHANGE', explanation: 'Acid-base reaction produces CO₂ gas' },
        { text: 'Magnetizing an iron nail', belongsTo: 'PHYSICAL CHANGE', explanation: 'Electron alignment changes, but still iron' },
        { text: 'Milk souring due to bacteria', belongsTo: 'CHEMICAL CHANGE', explanation: 'Lactose converts to lactic acid' }
      ]
    }
  }

  // Physics phrases  
  if (subject === 'physics') {
    if (concept1Name === 'SPEED' && concept2Name === 'VELOCITY') {
      return [
        { text: 'Has magnitude only', belongsTo: 'SPEED', explanation: 'Speed is a scalar quantity' },
        { text: 'Has both magnitude and direction', belongsTo: 'VELOCITY', explanation: 'Velocity is a vector quantity' },
        { text: 'Always positive value', belongsTo: 'SPEED', explanation: 'Speed cannot be negative' },
        { text: 'Can be positive or negative', belongsTo: 'VELOCITY', explanation: 'Velocity direction determines sign' },
        { text: 'Distance divided by time', belongsTo: 'SPEED', explanation: 'Speed = distance/time' },
        { text: 'Displacement divided by time', belongsTo: 'VELOCITY', explanation: 'Velocity = displacement/time' }
      ]
    }

    if (concept1Name === 'ALTERNATING CURRENT' && concept2Name === 'DIRECT CURRENT') {
      return [
        { text: 'Changes direction periodically', belongsTo: 'ALTERNATING CURRENT', explanation: 'AC reverses direction at regular intervals' },
        { text: 'Flows in one direction only', belongsTo: 'DIRECT CURRENT', explanation: 'DC maintains constant direction' },
        { text: 'Used in household electricity', belongsTo: 'ALTERNATING CURRENT', explanation: 'Home outlets provide AC power' },
        { text: 'Used in batteries', belongsTo: 'DIRECT CURRENT', explanation: 'Batteries provide DC power' },
        { text: 'Can be easily transformed', belongsTo: 'ALTERNATING CURRENT', explanation: 'Transformers work with AC' },
        { text: 'Cannot be easily transformed', belongsTo: 'DIRECT CURRENT', explanation: 'DC transformation requires converters' },
        { text: 'Frequency measured in Hertz', belongsTo: 'ALTERNATING CURRENT', explanation: 'AC has characteristic frequency (50/60 Hz)' },
        { text: 'Constant voltage and current', belongsTo: 'DIRECT CURRENT', explanation: 'DC values remain steady over time' },
        { text: 'More efficient for long-distance transmission', belongsTo: 'ALTERNATING CURRENT', explanation: 'High voltage AC reduces power losses' },
        { text: 'Better for electronic devices', belongsTo: 'DIRECT CURRENT', explanation: 'Most electronics operate on DC internally' }
      ]
    }

    if (concept1Name === 'MASS' && concept2Name === 'WEIGHT') {
      return [
        { text: 'Measured in kilograms', belongsTo: 'MASS', explanation: 'SI unit for mass is kilogram' },
        { text: 'Measured in Newtons', belongsTo: 'WEIGHT', explanation: 'Weight is a force measured in Newtons' },
        { text: 'Remains constant everywhere', belongsTo: 'MASS', explanation: 'Mass does not change with location' },
        { text: 'Varies with gravitational field', belongsTo: 'WEIGHT', explanation: 'Weight depends on local gravity' },
        { text: 'Amount of matter in object', belongsTo: 'MASS', explanation: 'Intrinsic property of matter' },
        { text: 'Force of gravity on object', belongsTo: 'WEIGHT', explanation: 'Gravitational force acting downward' },
        { text: 'Scalar quantity', belongsTo: 'MASS', explanation: 'Has magnitude but no direction' },
        { text: 'Vector quantity', belongsTo: 'WEIGHT', explanation: 'Has both magnitude and direction (downward)' },
        { text: 'Same on Earth and Moon', belongsTo: 'MASS', explanation: 'Unchanging property of matter' },
        { text: 'Less on Moon than Earth', belongsTo: 'WEIGHT', explanation: 'Moon has weaker gravitational field' }
      ]
    }

    if (concept1Name === 'KINETIC ENERGY' && concept2Name === 'POTENTIAL ENERGY') {
      return [
        { text: 'Energy of motion', belongsTo: 'KINETIC ENERGY', explanation: 'Energy due to movement of objects' },
        { text: 'Stored energy due to position', belongsTo: 'POTENTIAL ENERGY', explanation: 'Energy due to configuration or location' },
        { text: 'Depends on mass and velocity', belongsTo: 'KINETIC ENERGY', explanation: 'KE = ½mv²' },
        { text: 'Depends on height and mass', belongsTo: 'POTENTIAL ENERGY', explanation: 'PE = mgh (gravitational)' },
        { text: 'Zero when object is at rest', belongsTo: 'KINETIC ENERGY', explanation: 'No motion means no kinetic energy' },
        { text: 'Can exist when object is at rest', belongsTo: 'POTENTIAL ENERGY', explanation: 'Position-based energy remains' },
        { text: 'Maximum at bottom of swing', belongsTo: 'KINETIC ENERGY', explanation: 'Highest speed at lowest point' },
        { text: 'Maximum at top of swing', belongsTo: 'POTENTIAL ENERGY', explanation: 'Highest position, zero speed' },
        { text: 'Increases with speed', belongsTo: 'KINETIC ENERGY', explanation: 'Quadratic relationship with velocity' },
        { text: 'Increases with height', belongsTo: 'POTENTIAL ENERGY', explanation: 'Linear relationship with elevation' },
        { text: 'Example: moving car', belongsTo: 'KINETIC ENERGY', explanation: 'Motion creates kinetic energy' },
        { text: 'Example: water behind dam', belongsTo: 'POTENTIAL ENERGY', explanation: 'Elevated water has potential energy' },
        { text: 'Formula: KE = ½mv²', belongsTo: 'KINETIC ENERGY', explanation: 'Half mass times velocity squared' },
        { text: 'Formula: PE = mgh', belongsTo: 'POTENTIAL ENERGY', explanation: 'Mass times gravity times height' },
        { text: 'Always positive value', belongsTo: 'KINETIC ENERGY', explanation: 'Speed squared is always positive' },
        { text: 'Can be positive or negative', belongsTo: 'POTENTIAL ENERGY', explanation: 'Depends on reference point chosen' },
        { text: 'Increases quadratically with speed', belongsTo: 'KINETIC ENERGY', explanation: 'Doubling speed quadruples kinetic energy' },
        { text: 'Increases linearly with height', belongsTo: 'POTENTIAL ENERGY', explanation: 'Doubling height doubles potential energy' },
        { text: 'Bullet flying through air', belongsTo: 'KINETIC ENERGY', explanation: 'High-speed projectile motion' },
        { text: 'Stretched rubber band', belongsTo: 'POTENTIAL ENERGY', explanation: 'Elastic potential energy stored' },
        { text: 'Rolling ball on flat surface', belongsTo: 'KINETIC ENERGY', explanation: 'Both translational and rotational motion' },
        { text: 'Book on high shelf', belongsTo: 'POTENTIAL ENERGY', explanation: 'Gravitational potential energy' },
        { text: 'Flowing river water', belongsTo: 'KINETIC ENERGY', explanation: 'Moving water has kinetic energy' },
        { text: 'Compressed spring', belongsTo: 'POTENTIAL ENERGY', explanation: 'Elastic potential energy in spring' },
        { text: 'Wind turbine blades spinning', belongsTo: 'KINETIC ENERGY', explanation: 'Rotational kinetic energy' },
        { text: 'Gasoline in car tank', belongsTo: 'POTENTIAL ENERGY', explanation: 'Chemical potential energy' },
        { text: 'Converts to potential energy going uphill', belongsTo: 'KINETIC ENERGY', explanation: 'Energy transformation during motion' },
        { text: 'Converts to kinetic energy when falling', belongsTo: 'POTENTIAL ENERGY', explanation: 'Energy transformation under gravity' },
        { text: 'Depends on reference frame', belongsTo: 'KINETIC ENERGY', explanation: 'Speed is relative to observer' },
        { text: 'Depends on reference level', belongsTo: 'POTENTIAL ENERGY', explanation: 'Height measured from chosen zero point' },
        { text: 'Vibrating molecules in hot object', belongsTo: 'KINETIC ENERGY', explanation: 'Thermal energy is molecular motion' },
        { text: 'Separated electric charges', belongsTo: 'POTENTIAL ENERGY', explanation: 'Electric potential energy between charges' }
      ]
    }

    if (concept1Name === 'CONDUCTOR' && concept2Name === 'INSULATOR') {
      return [
        { text: 'Allows electric current to flow easily', belongsTo: 'CONDUCTOR', explanation: 'Free electrons move readily' },
        { text: 'Resists electric current flow', belongsTo: 'INSULATOR', explanation: 'Electrons tightly bound to atoms' },
        { text: 'Examples: copper, aluminum, silver', belongsTo: 'CONDUCTOR', explanation: 'Metals are good conductors' },
        { text: 'Examples: rubber, glass, plastic', belongsTo: 'INSULATOR', explanation: 'Non-metals typically insulate' },
        { text: 'Low electrical resistance', belongsTo: 'CONDUCTOR', explanation: 'Easy path for current' },
        { text: 'High electrical resistance', belongsTo: 'INSULATOR', explanation: 'Difficult path for current' },
        { text: 'Used in electrical wires', belongsTo: 'CONDUCTOR', explanation: 'Carries electricity efficiently' },
        { text: 'Used to cover electrical wires', belongsTo: 'INSULATOR', explanation: 'Prevents unwanted current flow' },
        { text: 'Free electrons available', belongsTo: 'CONDUCTOR', explanation: 'Mobile charge carriers' },
        { text: 'Electrons tightly bound', belongsTo: 'INSULATOR', explanation: 'No mobile charge carriers' }
      ]
    }

    if (concept1Name === 'SERIES CIRCUIT' && concept2Name === 'PARALLEL CIRCUIT') {
      return [
        { text: 'Components connected in single path', belongsTo: 'SERIES CIRCUIT', explanation: 'One continuous loop' },
        { text: 'Components connected in multiple paths', belongsTo: 'PARALLEL CIRCUIT', explanation: 'Multiple branches' },
        { text: 'Same current through all components', belongsTo: 'SERIES CIRCUIT', explanation: 'Current has only one path' },
        { text: 'Same voltage across all components', belongsTo: 'PARALLEL CIRCUIT', explanation: 'Each branch gets full voltage' },
        { text: 'If one component fails, circuit breaks', belongsTo: 'SERIES CIRCUIT', explanation: 'Break anywhere stops all current' },
        { text: 'If one component fails, others still work', belongsTo: 'PARALLEL CIRCUIT', explanation: 'Other branches remain complete' },
        { text: 'Total resistance increases with components', belongsTo: 'SERIES CIRCUIT', explanation: 'Resistances add up' },
        { text: 'Total resistance decreases with components', belongsTo: 'PARALLEL CIRCUIT', explanation: 'More paths reduce total resistance' },
        { text: 'Example: old Christmas lights', belongsTo: 'SERIES CIRCUIT', explanation: 'One bulb out, all go out' },
        { text: 'Example: house electrical system', belongsTo: 'PARALLEL CIRCUIT', explanation: 'Each outlet independent' },
        { text: 'Voltage divides among components', belongsTo: 'SERIES CIRCUIT', explanation: 'Each component gets portion of total voltage' },
        { text: 'Current divides among components', belongsTo: 'PARALLEL CIRCUIT', explanation: 'Each branch carries portion of total current' },
        { text: 'R_total = R₁ + R₂ + R₃ + ...', belongsTo: 'SERIES CIRCUIT', explanation: 'Resistances add directly' },
        { text: '1/R_total = 1/R₁ + 1/R₂ + 1/R₃ + ...', belongsTo: 'PARALLEL CIRCUIT', explanation: 'Reciprocal resistance formula' },
        { text: 'All components controlled by one switch', belongsTo: 'SERIES CIRCUIT', explanation: 'Single switch controls entire circuit' },
        { text: 'Each component can have own switch', belongsTo: 'PARALLEL CIRCUIT', explanation: 'Independent control possible' },
        { text: 'Dimmer bulbs as more are added', belongsTo: 'SERIES CIRCUIT', explanation: 'Voltage shared among more components' },
        { text: 'Same brightness regardless of number', belongsTo: 'PARALLEL CIRCUIT', explanation: 'Each gets full voltage' },
        { text: 'Lower power consumption per component', belongsTo: 'SERIES CIRCUIT', explanation: 'Reduced voltage means less power' },
        { text: 'Higher total power consumption', belongsTo: 'PARALLEL CIRCUIT', explanation: 'Each component draws full power' },
        { text: 'Troubleshooting requires checking entire chain', belongsTo: 'SERIES CIRCUIT', explanation: 'One failure affects everything' },
        { text: 'Easy to isolate problems', belongsTo: 'PARALLEL CIRCUIT', explanation: 'Failed component only affects its branch' },
        { text: 'Flashlight with multiple batteries', belongsTo: 'SERIES CIRCUIT', explanation: 'Batteries add voltage in series' },
        { text: 'Car headlights and taillights', belongsTo: 'PARALLEL CIRCUIT', explanation: 'Independent operation required' },
        { text: 'Simple construction and wiring', belongsTo: 'SERIES CIRCUIT', explanation: 'Fewer connections needed' },
        { text: 'More complex wiring required', belongsTo: 'PARALLEL CIRCUIT', explanation: 'Multiple paths need separate connections' },
        { text: 'Economy of materials and components', belongsTo: 'SERIES CIRCUIT', explanation: 'Minimal wiring and switches' },
        { text: 'Higher material cost but better reliability', belongsTo: 'PARALLEL CIRCUIT', explanation: 'More wiring but redundant paths' },
        { text: 'Used in voltage multiplier circuits', belongsTo: 'SERIES CIRCUIT', explanation: 'Components add their voltage drops' },
        { text: 'Used in current multiplier applications', belongsTo: 'PARALLEL CIRCUIT', explanation: 'Multiple paths carry more total current' },
        { text: 'Higher risk of total system failure', belongsTo: 'SERIES CIRCUIT', explanation: 'Single failure point affects all' },
        { text: 'Better fault tolerance and reliability', belongsTo: 'PARALLEL CIRCUIT', explanation: 'System continues with partial failures' }
      ]
    }
  }

  // Mathematics phrases
  if (subject === 'mathematics') {
    if (concept1Name === 'MEAN' && concept2Name === 'MEDIAN') {
      return [
        { text: 'Sum of all values divided by count', belongsTo: 'MEAN', explanation: 'Average calculation method' },
        { text: 'Middle value when arranged in order', belongsTo: 'MEDIAN', explanation: 'Positional average' },
        { text: 'Affected by extreme values (outliers)', belongsTo: 'MEAN', explanation: 'Outliers pull the mean toward them' },
        { text: 'Not affected by extreme values', belongsTo: 'MEDIAN', explanation: 'Position-based, resistant to outliers' },
        { text: 'Uses all data values in calculation', belongsTo: 'MEAN', explanation: 'Every number contributes to result' },
        { text: 'Only uses middle position(s)', belongsTo: 'MEDIAN', explanation: 'Position matters, not exact values' },
        { text: 'Example: (2+4+6)/3 = 4', belongsTo: 'MEAN', explanation: 'Arithmetic average' },
        { text: 'Example: middle of 2,4,6 is 4', belongsTo: 'MEDIAN', explanation: 'Positional middle' },
        { text: 'Can be a non-data value', belongsTo: 'MEAN', explanation: 'May not be an actual data point' },
        { text: 'Always equals an actual data value', belongsTo: 'MEDIAN', explanation: 'Must be from the dataset' }
      ]
    }

    if (concept1Name === 'PERMUTATION' && concept2Name === 'COMBINATION') {
      return [
        { text: 'Order matters', belongsTo: 'PERMUTATION', explanation: 'Different arrangements counted separately' },
        { text: 'Order does not matter', belongsTo: 'COMBINATION', explanation: 'Only selection matters, not arrangement' },
        { text: 'Formula: nPr = n!/(n-r)!', belongsTo: 'PERMUTATION', explanation: 'Permutation formula' },
        { text: 'Formula: nCr = n!/(r!(n-r)!)', belongsTo: 'COMBINATION', explanation: 'Combination formula' },
        { text: 'ABC and BAC are different', belongsTo: 'PERMUTATION', explanation: 'Different arrangements count as different' },
        { text: 'ABC and BAC are the same', belongsTo: 'COMBINATION', explanation: 'Same selection regardless of order' },
        { text: 'Example: arranging books on shelf', belongsTo: 'PERMUTATION', explanation: 'Position matters for arrangement' },
        { text: 'Example: choosing team members', belongsTo: 'COMBINATION', explanation: 'Selection matters, not positions' },
        { text: 'Always larger than combinations', belongsTo: 'PERMUTATION', explanation: 'More ways to arrange than select' },
        { text: 'Always smaller than permutations', belongsTo: 'COMBINATION', explanation: 'Fewer ways when order ignored' },
        { text: 'Seating arrangement at dinner table', belongsTo: 'PERMUTATION', explanation: 'Who sits where matters' },
        { text: 'Selecting committee members', belongsTo: 'COMBINATION', explanation: 'Just choosing people, no specific roles' },
        { text: 'Password with distinct characters', belongsTo: 'PERMUTATION', explanation: 'Character position determines meaning' },
        { text: 'Choosing pizza toppings', belongsTo: 'COMBINATION', explanation: 'Order of selection irrelevant' },
        { text: 'Race finishing positions', belongsTo: 'PERMUTATION', explanation: '1st, 2nd, 3rd place matter' },
        { text: 'Lottery number selection', belongsTo: 'COMBINATION', explanation: 'Winning numbers regardless of order drawn' },
        { text: 'Arranging letters to form words', belongsTo: 'PERMUTATION', explanation: 'Letter position creates meaning' },
        { text: 'Choosing colors for painting', belongsTo: 'COMBINATION', explanation: 'Just selecting which colors to use' },
        { text: 'Creating license plate numbers', belongsTo: 'PERMUTATION', explanation: 'Position of each character matters' },
        { text: 'Selecting students for field trip', belongsTo: 'COMBINATION', explanation: 'Just choosing who goes' },
        { text: 'Scheduling appointments by time', belongsTo: 'PERMUTATION', explanation: 'Time slots are ordered positions' },
        { text: 'Picking cards from deck', belongsTo: 'COMBINATION', explanation: 'Usually just which cards, not order drawn' },
        { text: 'Musical notes in melody', belongsTo: 'PERMUTATION', explanation: 'Sequence creates the tune' },
        { text: 'Ingredients in recipe', belongsTo: 'COMBINATION', explanation: 'Usually just what ingredients, not order mixed' },
        { text: 'Telephone number digits', belongsTo: 'PERMUTATION', explanation: 'Each position has specific meaning' },
        { text: 'Choosing subjects to study', belongsTo: 'COMBINATION', explanation: 'Selection of subjects, not order' },
        { text: 'nPr = n × (n-1) × (n-2) × ... × (n-r+1)', belongsTo: 'PERMUTATION', explanation: 'Alternative permutation calculation' },
        { text: 'nCr = nPr ÷ r!', belongsTo: 'COMBINATION', explanation: 'Combination as permutation divided by arrangements' },
        { text: 'Used when position or rank important', belongsTo: 'PERMUTATION', explanation: 'Sequence determines outcome' },
        { text: 'Used when just selection matters', belongsTo: 'COMBINATION', explanation: 'Choosing without regard to order' }
      ]
    }

    if (concept1Name === 'FUNCTION' && concept2Name === 'RELATION') {
      return [
        { text: 'Each input has exactly one output', belongsTo: 'FUNCTION', explanation: 'Passes vertical line test' },
        { text: 'One input can have multiple outputs', belongsTo: 'RELATION', explanation: 'Can fail vertical line test' },
        { text: 'Passes vertical line test', belongsTo: 'FUNCTION', explanation: 'No vertical line intersects graph twice' },
        { text: 'May fail vertical line test', belongsTo: 'RELATION', explanation: 'Vertical line can intersects multiple times' },
        { text: 'Example: y = x² (parabola)', belongsTo: 'FUNCTION', explanation: 'Each x gives one y value' },
        { text: 'Example: x² + y² = 1 (circle)', belongsTo: 'RELATION', explanation: 'Some x values give two y values' },
        { text: 'Domain maps to unique range values', belongsTo: 'FUNCTION', explanation: 'One-to-one or many-to-one mapping' },
        { text: 'Domain can map to multiple range values', belongsTo: 'RELATION', explanation: 'One-to-many mapping possible' },
        { text: 'Can be written as f(x) = ...', belongsTo: 'FUNCTION', explanation: 'Function notation applies' },
        { text: 'Cannot always use function notation', belongsTo: 'RELATION', explanation: 'May not have single-valued output' },
        { text: 'Every function is a relation', belongsTo: 'FUNCTION', explanation: 'Functions are special subset of relations' },
        { text: 'Not every relation is a function', belongsTo: 'RELATION', explanation: 'Relations can be more general' },
        { text: 'Well-defined for every domain element', belongsTo: 'FUNCTION', explanation: 'Complete mapping specified' },
        { text: 'Can be undefined for some elements', belongsTo: 'RELATION', explanation: 'Partial relationships allowed' },
        { text: 'Example: f(x) = 2x + 1', belongsTo: 'FUNCTION', explanation: 'Linear function with unique outputs' },
        { text: 'Example: "is sibling of" relationship', belongsTo: 'RELATION', explanation: 'One person can have multiple siblings' },
        { text: 'Can be injective (one-to-one)', belongsTo: 'FUNCTION', explanation: 'Different inputs give different outputs' },
        { text: 'Can represent equivalence classes', belongsTo: 'RELATION', explanation: 'Reflexive, symmetric, transitive properties' },
        { text: 'Can be surjective (onto)', belongsTo: 'FUNCTION', explanation: 'Every output has at least one input' },
        { text: 'Can model partial orders', belongsTo: 'RELATION', explanation: 'Reflexive, antisymmetric, transitive' },
        { text: 'Composition: (f∘g)(x) = f(g(x))', belongsTo: 'FUNCTION', explanation: 'Functions can be composed systematically' },
        { text: 'Matrix representation as 0s and 1s', belongsTo: 'RELATION', explanation: 'Adjacency matrices for finite sets' },
        { text: 'Inverse exists if bijective', belongsTo: 'FUNCTION', explanation: 'One-to-one and onto functions invertible' },
        { text: 'Inverse relation always exists', belongsTo: 'RELATION', explanation: 'Simply reverse all ordered pairs' },
        { text: 'Example: y = √x (x ≥ 0)', belongsTo: 'FUNCTION', explanation: 'Square root function on restricted domain' },
        { text: 'Example: y² = x (parabola sideways)', belongsTo: 'RELATION', explanation: 'Each positive x relates to ±√x' },
        { text: 'Continuous functions in calculus', belongsTo: 'FUNCTION', explanation: 'Limit, derivative, integral concepts' },
        { text: 'Graph theory as edge sets', belongsTo: 'RELATION', explanation: 'Vertices connected by relation edges' },
        { text: 'Piecewise definitions possible', belongsTo: 'FUNCTION', explanation: 'Different rules for different intervals' },
        { text: 'Can represent family trees', belongsTo: 'RELATION', explanation: 'Multi-generational ancestral connections' }
      ]
    }

    if (concept1Name === 'INDEPENDENT VARIABLE' && concept2Name === 'DEPENDENT VARIABLE') {
      return [
        { text: 'Input variable (usually x)', belongsTo: 'INDEPENDENT VARIABLE', explanation: 'Value you choose or control' },
        { text: 'Output variable (usually y)', belongsTo: 'DEPENDENT VARIABLE', explanation: 'Value that depends on input' },
        { text: 'Can be freely chosen', belongsTo: 'INDEPENDENT VARIABLE', explanation: 'You control this variable' },
        { text: 'Value depends on other variable', belongsTo: 'DEPENDENT VARIABLE', explanation: 'Changes based on independent variable' },
        { text: 'Plotted on horizontal axis', belongsTo: 'INDEPENDENT VARIABLE', explanation: 'x-axis represents independent variable' },
        { text: 'Plotted on vertical axis', belongsTo: 'DEPENDENT VARIABLE', explanation: 'y-axis represents dependent variable' },
        { text: 'Cause in cause-and-effect', belongsTo: 'INDEPENDENT VARIABLE', explanation: 'What you manipulate' },
        { text: 'Effect in cause-and-effect', belongsTo: 'DEPENDENT VARIABLE', explanation: 'What you measure or observe' },
        { text: 'Example: time in distance vs time', belongsTo: 'INDEPENDENT VARIABLE', explanation: 'Time passes independently' },
        { text: 'Example: distance in distance vs time', belongsTo: 'DEPENDENT VARIABLE', explanation: 'Distance depends on time elapsed' },
        { text: 'Manipulated in experiments', belongsTo: 'INDEPENDENT VARIABLE', explanation: 'Researcher controls this factor' },
        { text: 'Measured in experiments', belongsTo: 'DEPENDENT VARIABLE', explanation: 'Researcher observes changes in this' },
        { text: 'Domain of function', belongsTo: 'INDEPENDENT VARIABLE', explanation: 'Set of possible input values' },
        { text: 'Range of function', belongsTo: 'DEPENDENT VARIABLE', explanation: 'Set of possible output values' },
        { text: 'Example: price in supply vs price', belongsTo: 'INDEPENDENT VARIABLE', explanation: 'Price is set independently' },
        { text: 'Example: supply in supply vs price', belongsTo: 'DEPENDENT VARIABLE', explanation: 'Supply responds to price changes' },
        { text: 'Often represents time', belongsTo: 'INDEPENDENT VARIABLE', explanation: 'Time flows regardless of other factors' },
        { text: 'Changes over time', belongsTo: 'DEPENDENT VARIABLE', explanation: 'Varies as time progresses' },
        { text: 'Predictor variable in statistics', belongsTo: 'INDEPENDENT VARIABLE', explanation: 'Used to predict other variables' },
        { text: 'Response variable in statistics', belongsTo: 'DEPENDENT VARIABLE', explanation: 'Responds to predictor variables' },
        { text: 'Example: hours studied', belongsTo: 'INDEPENDENT VARIABLE', explanation: 'Student chooses study time' },
        { text: 'Example: test score', belongsTo: 'DEPENDENT VARIABLE', explanation: 'Score depends on study time' },
        { text: 'Control variable in research', belongsTo: 'INDEPENDENT VARIABLE', explanation: 'Researcher sets specific values' },
        { text: 'Outcome variable in research', belongsTo: 'DEPENDENT VARIABLE', explanation: 'Result of experimental conditions' },
        { text: 'Example: temperature setting', belongsTo: 'INDEPENDENT VARIABLE', explanation: 'Thermostat controlled independently' },
        { text: 'Example: plant growth rate', belongsTo: 'DEPENDENT VARIABLE', explanation: 'Growth depends on temperature' },
        { text: 'Can have multiple in one equation', belongsTo: 'INDEPENDENT VARIABLE', explanation: 'Functions can have several inputs' },
        { text: 'Usually only one per equation', belongsTo: 'DEPENDENT VARIABLE', explanation: 'Typically one output per function' },
        { text: 'Example: medication dosage', belongsTo: 'INDEPENDENT VARIABLE', explanation: 'Doctor prescribes specific amount' },
        { text: 'Example: patient recovery time', belongsTo: 'DEPENDENT VARIABLE', explanation: 'Recovery depends on dosage' }
      ]
    }
  }

  // Computer Science phrases
  if (subject === 'computer_science') {
    if (concept1Name === 'HARDWARE' && concept2Name === 'SOFTWARE') {
      return [
        { text: 'Physical components you can touch', belongsTo: 'HARDWARE', explanation: 'Tangible parts of computer system' },
        { text: 'Programs and instructions', belongsTo: 'SOFTWARE', explanation: 'Intangible code and applications' },
        { text: 'CPU, RAM, hard drive', belongsTo: 'HARDWARE', explanation: 'Physical processing and storage components' },
        { text: 'Operating system, applications', belongsTo: 'SOFTWARE', explanation: 'Programs that run on hardware' },
        { text: 'Can break or wear out physically', belongsTo: 'HARDWARE', explanation: 'Subject to physical deterioration' },
        { text: 'Can have bugs or glitches', belongsTo: 'SOFTWARE', explanation: 'Subject to logical errors' },
        { text: 'Manufactured in factories', belongsTo: 'HARDWARE', explanation: 'Physical production process' },
        { text: 'Written by programmers', belongsTo: 'SOFTWARE', explanation: 'Created through coding' }
      ]
    }

    if (concept1Name === 'STACK' && concept2Name === 'QUEUE') {
      return [
        { text: 'Last In, First Out (LIFO)', belongsTo: 'STACK', explanation: 'Most recent item is removed first' },
        { text: 'First In, First Out (FIFO)', belongsTo: 'QUEUE', explanation: 'Oldest item is removed first' },
        { text: 'Push and pop operations', belongsTo: 'STACK', explanation: 'Add to top, remove from top' },
        { text: 'Enqueue and dequeue operations', belongsTo: 'QUEUE', explanation: 'Add to rear, remove from front' },
        { text: 'Like a stack of plates', belongsTo: 'STACK', explanation: 'Take from the top of the pile' },
        { text: 'Like a line at a store', belongsTo: 'QUEUE', explanation: 'First person in line is served first' },
        { text: 'Used in function calls', belongsTo: 'STACK', explanation: 'Call stack tracks function execution' },
        { text: 'Used in task scheduling', belongsTo: 'QUEUE', explanation: 'Process tasks in order received' },
        { text: 'Undo operations in editors', belongsTo: 'STACK', explanation: 'Most recent action undone first' },
        { text: 'Print job management', belongsTo: 'QUEUE', explanation: 'Documents printed in submission order' },
        { text: 'Depth-first search (DFS)', belongsTo: 'STACK', explanation: 'Explores deepest path first' },
        { text: 'Breadth-first search (BFS)', belongsTo: 'QUEUE', explanation: 'Explores level by level' },
        { text: 'Expression evaluation', belongsTo: 'STACK', explanation: 'Postfix notation uses stack' },
        { text: 'CPU scheduling algorithms', belongsTo: 'QUEUE', explanation: 'Ready queue for processes' },
        { text: 'Memory management (last allocated)', belongsTo: 'STACK', explanation: 'Stack memory allocation pattern' },
        { text: 'Buffer for data streams', belongsTo: 'QUEUE', explanation: 'First data in, first data out' },
        { text: 'Parentheses matching', belongsTo: 'STACK', explanation: 'Track opening brackets' },
        { text: 'Keyboard input buffer', belongsTo: 'QUEUE', explanation: 'Keystrokes processed in order' },
        { text: 'Browser back button', belongsTo: 'STACK', explanation: 'Last visited page shown first' },
        { text: 'Handling network requests', belongsTo: 'QUEUE', explanation: 'Requests served in arrival order' },
        { text: 'Recursion implementation', belongsTo: 'STACK', explanation: 'Function calls create stack frames' },
        { text: 'Round-robin scheduling', belongsTo: 'QUEUE', explanation: 'Processes get equal time slices' },
        { text: 'Infix to postfix conversion', belongsTo: 'STACK', explanation: 'Operators stored temporarily' },
        { text: 'Producer-consumer problems', belongsTo: 'QUEUE', explanation: 'Items consumed in production order' },
        { text: 'JVM method invocation', belongsTo: 'STACK', explanation: 'Method calls create stack frames' },
        { text: 'Event handling systems', belongsTo: 'QUEUE', explanation: 'Events processed chronologically' },
        { text: 'Tower of Hanoi algorithm', belongsTo: 'STACK', explanation: 'Disks moved in LIFO manner' },
        { text: 'Simulation modeling', belongsTo: 'QUEUE', explanation: 'Entities served in arrival sequence' },
        { text: 'Compiler syntax analysis', belongsTo: 'STACK', explanation: 'Parse trees built bottom-up' },
        { text: 'Operating system interrupt handling', belongsTo: 'QUEUE', explanation: 'Interrupts queued for processing' }
      ]
    }

    if (concept1Name === 'COMPILATION' && concept2Name === 'INTERPRETATION') {
      return [
        { text: 'Converts entire program before execution', belongsTo: 'COMPILATION', explanation: 'All code translated at once' },
        { text: 'Translates and executes line by line', belongsTo: 'INTERPRETATION', explanation: 'Code processed during runtime' },
        { text: 'Produces executable machine code', belongsTo: 'COMPILATION', explanation: 'Creates standalone executable file' },
        { text: 'Requires interpreter to run', belongsTo: 'INTERPRETATION', explanation: 'Needs interpreter present at runtime' },
        { text: 'Faster execution after compilation', belongsTo: 'COMPILATION', explanation: 'Machine code runs directly on CPU' },
        { text: 'More flexible and interactive', belongsTo: 'INTERPRETATION', explanation: 'Can modify code during execution' },
        { text: 'Examples: C, C++, Rust', belongsTo: 'COMPILATION', explanation: 'Compiled programming languages' },
        { text: 'Examples: Python, JavaScript, Ruby', belongsTo: 'INTERPRETATION', explanation: 'Interpreted programming languages' },
        { text: 'Errors caught at compile time', belongsTo: 'COMPILATION', explanation: 'Syntax errors found before execution' },
        { text: 'Errors found at runtime', belongsTo: 'INTERPRETATION', explanation: 'Errors discovered during execution' },
        { text: 'Cross-platform through recompilation', belongsTo: 'COMPILATION', explanation: 'Recompile for different architectures' },
        { text: 'Cross-platform with same interpreter', belongsTo: 'INTERPRETATION', explanation: 'Same code runs anywhere interpreter exists' },
        { text: 'Longer initial setup time', belongsTo: 'COMPILATION', explanation: 'Compilation process takes time' },
        { text: 'Immediate execution start', belongsTo: 'INTERPRETATION', explanation: 'Can start running code immediately' },
        { text: 'Code protection through compilation', belongsTo: 'COMPILATION', explanation: 'Source code not visible in executable' },
        { text: 'Source code remains visible', belongsTo: 'INTERPRETATION', explanation: 'Original code needed for execution' },
        { text: 'Optimizations during compilation', belongsTo: 'COMPILATION', explanation: 'Compiler optimizes code for performance' },
        { text: 'Runtime optimizations possible', belongsTo: 'INTERPRETATION', explanation: 'JIT compilation and dynamic optimization' },
        { text: 'Static linking of libraries', belongsTo: 'COMPILATION', explanation: 'Dependencies included in executable' },
        { text: 'Dynamic loading of modules', belongsTo: 'INTERPRETATION', explanation: 'Import libraries during execution' },
        { text: 'Better for system programming', belongsTo: 'COMPILATION', explanation: 'Direct hardware access and performance' },
        { text: 'Better for scripting and automation', belongsTo: 'INTERPRETATION', explanation: 'Quick prototyping and testing' },
        { text: 'Examples: Go, Assembly, Fortran', belongsTo: 'COMPILATION', explanation: 'Additional compiled languages' },
        { text: 'Examples: PHP, Perl, MATLAB', belongsTo: 'INTERPRETATION', explanation: 'Additional interpreted languages' },
        { text: 'Memory usage optimized at compile time', belongsTo: 'COMPILATION', explanation: 'Compiler optimizes memory allocation' },
        { text: 'Memory managed dynamically', belongsTo: 'INTERPRETATION', explanation: 'Runtime memory management' },
        { text: 'Debugging with compiled symbols', belongsTo: 'COMPILATION', explanation: 'Debug info embedded in executable' },
        { text: 'Interactive debugging possible', belongsTo: 'INTERPRETATION', explanation: 'Can inspect and modify during execution' },
        { text: 'Build process required', belongsTo: 'COMPILATION', explanation: 'Make files, build systems needed' },
        { text: 'No build step necessary', belongsTo: 'INTERPRETATION', explanation: 'Direct execution of source code' }
      ]
    }
  }

  // Literature phrases
  if (subject === 'literature') {
    if (concept1Name === 'METAPHOR' && concept2Name === 'SIMILE') {
      return [
        { text: 'Direct comparison without like/as', belongsTo: 'METAPHOR', explanation: 'States one thing IS another' },
        { text: 'Comparison using like or as', belongsTo: 'SIMILE', explanation: 'States one thing is LIKE another' },
        { text: '"Life is a journey"', belongsTo: 'METAPHOR', explanation: 'Direct comparison - life IS a journey' },
        { text: '"Life is like a journey"', belongsTo: 'SIMILE', explanation: 'Comparison using "like"' },
        { text: '"Her voice is music"', belongsTo: 'METAPHOR', explanation: 'Voice IS music (direct)' },
        { text: '"Her voice is like music"', belongsTo: 'SIMILE', explanation: 'Voice is LIKE music (comparison)' },
        { text: 'More implicit and subtle', belongsTo: 'METAPHOR', explanation: 'Implied comparison' },
        { text: 'More explicit and obvious', belongsTo: 'SIMILE', explanation: 'Clear comparison signal' },
        { text: '"Time is money"', belongsTo: 'METAPHOR', explanation: 'Direct equation of concepts' },
        { text: '"Brave as a lion"', belongsTo: 'SIMILE', explanation: 'Comparison using "as"' },
        { text: '"The world is a stage"', belongsTo: 'METAPHOR', explanation: 'Shakespeare\'s famous metaphor' },
        { text: '"Float like a butterfly"', belongsTo: 'SIMILE', explanation: 'Ali\'s famous boxing simile' },
        { text: 'Creates identity between things', belongsTo: 'METAPHOR', explanation: 'Fuses two concepts into one' },
        { text: 'Shows similarity between things', belongsTo: 'SIMILE', explanation: 'Highlights shared characteristics' },
        { text: '"Love is a battlefield"', belongsTo: 'METAPHOR', explanation: 'Direct comparison in song lyrics' },
        { text: '"Love is like a red rose"', belongsTo: 'SIMILE', explanation: 'Burns\' famous comparison' },
        { text: 'Often more poetic and artistic', belongsTo: 'METAPHOR', explanation: 'Creates striking imagery' },
        { text: 'Often clearer for understanding', belongsTo: 'SIMILE', explanation: 'Easier to identify and interpret' },
        { text: '"Hope is the thing with feathers"', belongsTo: 'METAPHOR', explanation: 'Dickinson\'s extended metaphor' },
        { text: '"My love is like a red, red rose"', belongsTo: 'SIMILE', explanation: 'Burns\' complete simile' },
        { text: 'Can create extended metaphors', belongsTo: 'METAPHOR', explanation: 'Sustained comparison throughout text' },
        { text: 'Usually shorter comparisons', belongsTo: 'SIMILE', explanation: 'Brief comparative statements' },
        { text: '"The classroom was a zoo"', belongsTo: 'METAPHOR', explanation: 'Chaotic classroom described directly' },
        { text: '"The classroom was like a zoo"', belongsTo: 'SIMILE', explanation: 'Chaotic classroom compared' },
        { text: 'Can be dead metaphors', belongsTo: 'METAPHOR', explanation: 'Overused metaphors like "head of lettuce"' },
        { text: 'Generally maintain freshness', belongsTo: 'SIMILE', explanation: 'Comparison words keep meaning clear' },
        { text: '"Heart of gold"', belongsTo: 'METAPHOR', explanation: 'Kind person described as precious metal' },
        { text: '"Sweet as honey"', belongsTo: 'SIMILE', explanation: 'Sweetness compared to honey' },
        { text: 'Creates conceptual blending', belongsTo: 'METAPHOR', explanation: 'Mental fusion of different domains' },
        { text: 'Maintains conceptual distinction', belongsTo: 'SIMILE', explanation: 'Keeps compared things separate' }
      ]
    }

    if (concept1Name === 'PROTAGONIST' && concept2Name === 'ANTAGONIST') {
      return [
        { text: 'Main character of the story', belongsTo: 'PROTAGONIST', explanation: 'Central figure around whom story revolves' },
        { text: 'Opposes the main character', belongsTo: 'ANTAGONIST', explanation: 'Creates conflict for protagonist' },
        { text: 'Usually the hero or heroine', belongsTo: 'PROTAGONIST', explanation: 'Character readers typically support' },
        { text: 'Often the villain or opposing force', belongsTo: 'ANTAGONIST', explanation: 'Source of conflict and obstacles' },
        { text: 'Drives the plot forward', belongsTo: 'PROTAGONIST', explanation: 'Actions move the story along' },
        { text: 'Creates obstacles and challenges', belongsTo: 'ANTAGONIST', explanation: 'Provides conflict and tension' },
        { text: 'Usually undergoes character development', belongsTo: 'PROTAGONIST', explanation: 'Changes and grows throughout story' },
        { text: 'May be a person, nature, or society', belongsTo: 'ANTAGONIST', explanation: 'Opposing force can take many forms' }
      ]
    }
  }

  // Default phrases if no specific database found
  return [
    { text: `Characteristic feature of ${concept1Name.toLowerCase()}`, belongsTo: concept1Name, explanation: `This describes ${concept1Name}` },
    { text: `Typical property of ${concept2Name.toLowerCase()}`, belongsTo: concept2Name, explanation: `This describes ${concept2Name}` },
    { text: `Commonly associated with ${concept1Name.toLowerCase()}`, belongsTo: concept1Name, explanation: `This relates to ${concept1Name}` },
    { text: `Usually found in ${concept2Name.toLowerCase()}`, belongsTo: concept2Name, explanation: `This relates to ${concept2Name}` }
  ]
}

function classifyPhrase(phrase, selectedConcept, conceptPair) {
  const correctConcept = phrase.belongsTo
  const isCorrect = selectedConcept === correctConcept
  
  return {
    correct: isCorrect,
    correctConcept: correctConcept,
    explanation: phrase.explanation || `This phrase describes ${correctConcept}`
  }
}