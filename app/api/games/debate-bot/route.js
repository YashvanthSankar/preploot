import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { action, subject, difficulty, debateId, userArgument, round, debateHistory } = await request.json()

    if (action === 'start_debate') {
      const debate = generateDebate(subject, difficulty)
      return NextResponse.json({ debate })
    } else if (action === 'submit_argument') {
      const result = evaluateArgument(subject, difficulty, userArgument, round, debateHistory)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in debate bot API:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

function generateDebate(subject, difficulty) {
  const debateId = Math.random().toString(36).substr(2, 9)
  
  // History debates
  if (subject === 'history') {
    const historyDebates = {
      easy: [
        {
          id: debateId,
          subject: 'history',
          difficulty: 'easy',
          topic: 'Was the American Revolution justified?',
          context: 'The American colonies declared independence from Britain in 1776, leading to a war that lasted until 1783.',
          botPosition: 'The American Revolution was NOT justified - it was primarily driven by economic interests of wealthy colonists rather than genuine oppression.',
          botOpeningStatement: 'The American Revolution was fundamentally unjustified. The British provided military protection, established trade networks, and maintained order. The colonists enjoyed relative prosperity and religious freedom. The "taxation without representation" argument ignores that virtual representation existed in Parliament, and the taxes were reasonable given Britain\'s war debts from protecting the colonies. The Boston Tea Party and other acts were criminal destruction of property, not noble resistance.',
          keyPoints: ['Virtual representation', 'British protection costs', 'Economic prosperity under Britain', 'Criminal acts disguised as protest']
        },
        {
          id: debateId,
          subject: 'history',
          difficulty: 'easy',
          topic: 'Should we judge historical figures by modern moral standards?',
          context: 'Many historical figures like Thomas Jefferson, Winston Churchill, and Mahatma Gandhi are being reevaluated through contemporary ethical lenses.',
          botPosition: 'We should NOT judge historical figures by modern moral standards - it\'s anachronistic and unfair.',
          botOpeningStatement: 'Judging historical figures by today\'s moral standards is fundamentally flawed and academically dishonest. People are products of their time, shaped by the dominant cultural, social, and intellectual frameworks of their era. Thomas Jefferson lived in a society where slavery was legally and socially normalized. Expecting him to have 21st-century views on racial equality is like expecting medieval doctors to know about germ theory. This presentist approach erases historical context and prevents us from understanding how moral progress actually occurs.',
          keyPoints: ['Historical context matters', 'Product of their time', 'Presentist fallacy', 'Moral progress is gradual']
        }
      ],
      medium: [
        {
          id: debateId,
          subject: 'history',
          difficulty: 'medium',
          topic: 'Was the Non-Cooperation Movement a success or failure?',
          context: 'Gandhi\'s Non-Cooperation Movement (1920-1922) aimed to achieve swaraj through non-violent resistance to British rule.',
          botPosition: 'The Non-Cooperation Movement was ultimately a FAILURE that set back India\'s independence struggle.',
          botOpeningStatement: 'The Non-Cooperation Movement failed on multiple fronts. First, it was abruptly called off after Chauri Chaura, showing poor strategic planning. Second, it deepened Hindu-Muslim divisions, with many Muslims joining the Khilafat movement for religious rather than nationalist reasons. Third, the economic boycott of foreign goods hurt Indian traders and consumers more than the British. Fourth, it failed to achieve its stated goal of swaraj within one year. The movement\'s suspension demoralized the masses and gave the British time to regroup and implement divide-and-rule policies more effectively.',
          keyPoints: ['Chauri Chaura suspension', 'Hindu-Muslim divisions', 'Economic ineffectiveness', 'Failed timeline promises', 'British counter-strategies']
        },
        {
          id: debateId,
          subject: 'history',
          difficulty: 'medium',
          topic: 'Did the Industrial Revolution improve or worsen life for ordinary people?',
          context: 'The Industrial Revolution (1760-1840) transformed Britain from an agricultural to a manufacturing economy.',
          botPosition: 'The Industrial Revolution WORSENED life for ordinary people, creating unprecedented suffering and exploitation.',
          botOpeningStatement: 'The Industrial Revolution was a catastrophe for ordinary people. Factory workers, including children as young as 6, endured 12-16 hour workdays in dangerous, poorly ventilated conditions. Urban areas became overcrowded slums with inadequate sanitation, leading to cholera and typhoid outbreaks. Traditional communities were destroyed as people were forced to migrate to industrial cities. The putting-out system was replaced by factory discipline that treated humans like machines. While a few industrialists became wealthy, the majority experienced declining living standards, longer working hours, and loss of economic independence compared to pre-industrial agricultural life.',
          keyPoints: ['Child labor exploitation', 'Urban slum conditions', 'Health deterioration', 'Loss of traditional communities', 'Widening inequality']
        }
      ],
      hard: [
        {
          id: debateId,
          subject: 'history',
          difficulty: 'hard',
          topic: 'Was the Partition of India in 1947 inevitable?',
          context: 'The British partitioned India into two nations - India and Pakistan - during independence, leading to massive displacement and violence.',
          botPosition: 'Partition was INEVITABLE given the irreconcilable differences between Hindu and Muslim political visions for post-colonial India.',
          botOpeningStatement: 'Partition was tragically inevitable by 1947. The Two-Nation Theory had deep roots in Muslim separatist thought dating back to Sir Syed Ahmad Khan. The failed Cabinet Mission Plan showed that federal solutions couldn\'t bridge the Hindu-Muslim divide. Jinnah\'s Direct Action Day demonstrated that the Muslim League could mobilize communal violence. The Congress party\'s secular nationalism was seen by many Muslims as Hindu majoritarian rule in disguise. Regional factors like Punjab\'s demographics and Bengal\'s economy made unified governance nearly impossible. The British, exhausted by WWII, lacked the will and resources for a gradual transition that might have prevented partition.',
          keyPoints: ['Two-Nation Theory evolution', 'Cabinet Mission failure', 'Direct Action Day', 'Congress secular nationalism limitations', 'British post-war weakness', 'Regional demographic complexities']
        }
      ]
    }
    
    const debates = historyDebates[difficulty] || historyDebates.medium
    return debates[Math.floor(Math.random() * debates.length)]
  }

  // Science debates
  if (subject === 'science') {
    const scienceDebates = {
      easy: [
        {
          id: debateId,
          subject: 'science',
          difficulty: 'easy',
          topic: 'Should we prioritize space exploration over solving Earth\'s problems?',
          context: 'Billions are spent on space programs while issues like climate change, poverty, and disease persist on Earth.',
          botPosition: 'We should NOT prioritize space exploration - Earth\'s problems demand immediate attention and resources.',
          botOpeningStatement: 'Space exploration is a luxury we cannot afford while people are dying from preventable diseases, climate change threatens civilization, and billions lack clean water. The $25 billion NASA budget could fund malaria nets for all of Africa, provide clean water infrastructure for developing nations, or accelerate renewable energy research. Mars missions won\'t help the billion people living in extreme poverty today. We should solve terrestrial problems before venturing into space - it\'s both morally imperative and practically sensible.',
          keyPoints: ['Resource allocation priorities', 'Immediate human suffering', 'Climate crisis urgency', 'Practical problem-solving']
        }
      ],
      medium: [
        {
          id: debateId,
          subject: 'science',
          difficulty: 'medium',
          topic: 'Should genetic engineering of humans be permitted?',
          context: 'CRISPR technology enables precise editing of human genes, potentially eliminating genetic diseases but raising ethical concerns.',
          botPosition: 'Human genetic engineering should be BANNED - the risks and ethical concerns outweigh potential benefits.',
          botOpeningStatement: 'Human genetic engineering opens a Pandora\'s box of ethical nightmares. First, it creates a genetic class divide where enhanced humans become a superior caste. Second, we lack long-term safety data - genetic modifications could have unforeseen consequences for future generations. Third, it violates human dignity by treating people as products to be optimized rather than inherently valuable beings. Fourth, the definition of "genetic disease" is subjective and could lead to eliminating natural human diversity. Finally, it slopes toward eugenics, where society pressures parents to genetically "improve" their children according to current biases.',
          keyPoints: ['Genetic class divide', 'Unknown long-term effects', 'Human dignity concerns', 'Eugenics precedent', 'Loss of genetic diversity']
        }
      ],
      hard: [
        {
          id: debateId,
          subject: 'science',
          difficulty: 'hard',
          topic: 'Is artificial general intelligence an existential threat to humanity?',
          context: 'Advances in AI are approaching human-level intelligence, with some experts warning of existential risks.',
          botPosition: 'AGI poses an EXISTENTIAL THREAT that could lead to human extinction if not carefully controlled.',
          botOpeningStatement: 'Artificial General Intelligence represents the greatest existential risk humanity has ever faced. Unlike nuclear weapons or climate change, AGI could lead to complete human extinction. The intelligence explosion hypothesis suggests that once AI surpasses human intelligence, it will rapidly improve itself beyond our ability to control. The alignment problem - ensuring AI systems pursue human values - remains unsolved and may be unsolvable. Current AI systems already exhibit emergent behaviors their creators didn\'t anticipate. A superintelligent system optimizing for seemingly benign goals could instrumentally converge on eliminating humans as obstacles. We have one chance to get this right, and the stakes couldn\'t be higher.',
          keyPoints: ['Intelligence explosion risks', 'Unsolved alignment problem', 'Emergent behavior unpredictability', 'Instrumental convergence dangers', 'One-shot opportunity']
        }
      ]
    }
    
    const debates = scienceDebates[difficulty] || scienceDebates.medium
    return debates[Math.floor(Math.random() * debates.length)]
  }

  // Economics debates  
  if (subject === 'economics') {
    const economicsDebates = {
      medium: [
        {
          id: debateId,
          subject: 'economics',
          difficulty: 'medium',
          topic: 'Should governments implement Universal Basic Income?',
          context: 'UBI provides unconditional cash payments to all citizens, potentially replacing traditional welfare systems.',
          botPosition: 'Universal Basic Income is economically DISASTROUS and should not be implemented.',
          botOpeningStatement: 'UBI is economic suicide disguised as progressive policy. First, it would cost trillions - Finland\'s limited pilot cost €35,000 per participant annually. Scaling this globally would require massive tax increases or unsustainable debt. Second, it destroys work incentives, leading to labor shortages and economic stagnation. Third, it causes inflation by increasing money supply without increasing productivity. Fourth, it creates dependency culture where people lose skills and motivation. Fifth, targeted welfare is more efficient than universal payments to billionaires. The Alaska Permanent Fund shows UBI leads to reduced work hours and increased leisure consumption rather than productive investment.',
          keyPoints: ['Prohibitive costs', 'Work disincentives', 'Inflationary pressure', 'Dependency culture', 'Inefficient universality']
        }
      ]
    }
    
    const debates = economicsDebates[difficulty] || economicsDebates.medium
    return debates[Math.floor(Math.random() * debates.length)]
  }

  // Default fallback debate
  return {
    id: debateId,
    subject: subject,
    difficulty: difficulty,
    topic: `The Role of ${subject.charAt(0).toUpperCase() + subject.slice(1)} in Modern Society`,
    context: `This debate examines the significance and impact of ${subject} in contemporary society.`,
    botPosition: `${subject.charAt(0).toUpperCase() + subject.slice(1)} has been overemphasized in modern society and doesn't deserve its current level of attention and resources.`,
    botOpeningStatement: `I argue that society has developed an unhealthy obsession with ${subject}. While it certainly has its place, we've elevated it beyond its actual importance and practical value. Resources, attention, and social capital that could be directed toward more pressing concerns are instead being channeled into ${subject}. This misallocation of priorities is holding back genuine progress and creating unrealistic expectations about what ${subject} can actually deliver for humanity.`,
    keyPoints: ['Resource misallocation', 'Overinflated importance', 'Practical limitations', 'Opportunity costs']
  }
}

function evaluateArgument(subject, difficulty, userArgument, round, debateHistory) {
  // This is a simplified evaluation system
  // In a real application, you would use more sophisticated AI analysis
  
  const wordCount = userArgument.trim().split(/\s+/).filter(Boolean).length
  const hasEvidence = checkForEvidence(userArgument)
  const hasLogicalStructure = checkLogicalStructure(userArgument)
  const addressesCounterPoints = checkCounterPointAddressing(userArgument, debateHistory)
  
  // Score user argument (1-10)
  let userScore = 0
  
  // Length and detail (0-3 points)
  if (wordCount < 50) userScore += 1
  else if (wordCount < 150) userScore += 2
  else if (wordCount >= 150) userScore += 3
  
  // Evidence and examples (0-3 points)
  userScore += hasEvidence ? 3 : 1
  
  // Logical structure (0-2 points)
  userScore += hasLogicalStructure ? 2 : 1
  
  // Addressing counter-points (0-2 points)
  userScore += addressesCounterPoints ? 2 : 1
  
  // Difficulty adjustment
  const difficultyMultiplier = difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 1.2 : 1.0
  userScore = Math.round(userScore * difficultyMultiplier)
  userScore = Math.min(10, Math.max(1, userScore))
  
  // Generate bot counter-argument and score
  const botResponse = generateBotCounterArgument(subject, difficulty, userArgument, round)
  const botScore = generateBotScore(difficulty, round)
  
  return {
    userArgumentScore: userScore,
    userFeedback: generateUserFeedback(userScore, userArgument),
    botCounterArgument: botResponse,
    botArgumentScore: botScore
  }
}

function checkForEvidence(argument) {
  const evidenceKeywords = [
    'study', 'research', 'data', 'statistics', 'evidence', 'example', 'case',
    'history shows', 'according to', 'studies show', 'research indicates',
    'for instance', 'for example', 'specifically', 'in fact', 'documented'
  ]
  
  const argLower = argument.toLowerCase()
  return evidenceKeywords.some(keyword => argLower.includes(keyword))
}

function checkLogicalStructure(argument) {
  const structureIndicators = [
    'first', 'second', 'third', 'finally', 'however', 'furthermore', 'moreover',
    'in addition', 'on the other hand', 'therefore', 'thus', 'consequently',
    'because', 'since', 'as a result', 'this leads to', 'this shows'
  ]
  
  const argLower = argument.toLowerCase()
  const indicatorCount = structureIndicators.filter(indicator => argLower.includes(indicator)).length
  return indicatorCount >= 2
}

function checkCounterPointAddressing(argument, debateHistory) {
  if (!debateHistory || debateHistory.length === 0) return false
  
  const addressingPhrases = [
    'you argue', 'your point', 'while you claim', 'although you say',
    'your argument', 'you mentioned', 'you stated', 'however', 'but',
    'contrary to', 'despite your claim', 'while it\'s true'
  ]
  
  const argLower = argument.toLowerCase()
  return addressingPhrases.some(phrase => argLower.includes(phrase))
}

function generateBotCounterArgument(subject, difficulty, userArgument, round) {
  // Generate contextual counter-arguments based on common argument patterns
  const responses = [
    `Your argument raises interesting points, but overlooks several critical factors. The evidence you cite, while relevant, doesn't account for the broader context and long-term implications. Consider how alternative interpretations of the same data could lead to different conclusions.`,
    
    `I appreciate your perspective, however, your reasoning contains some logical gaps. The examples you provide are selective and don't represent the full spectrum of cases. A more comprehensive analysis reveals patterns that contradict your main thesis.`,
    
    `While your points have merit in isolation, they fail to address the fundamental economic/social/practical realities at play. The real-world implementation of your proposed approach has historically led to unintended consequences that outweigh the theoretical benefits.`,
    
    `Your argument demonstrates good research, but the causal relationships you establish are questionable. Correlation doesn't imply causation, and the factors you identify may be symptoms rather than root causes of the issue we're debating.`,
    
    `You make valid observations, but your analysis lacks consideration of stakeholder perspectives and competing priorities. What appears beneficial from one angle often creates problems from another, and policy decisions must balance these trade-offs.`
  ]
  
  // Add subject-specific counter-arguments
  if (subject === 'history') {
    responses.push(`Your historical analysis oversimplifies complex causation. Historical events result from multiple interacting factors, and cherry-picking evidence to support a particular narrative ignores the messy reality of how change actually occurs. Primary sources from the period reveal perspectives that challenge your interpretation.`)
  }
  
  if (subject === 'science') {
    responses.push(`Your scientific reasoning ignores key methodological limitations and peer review concerns. The studies you reference have been challenged by subsequent research, and the scientific consensus has evolved beyond the position you're defending.`)
  }
  
  return responses[Math.floor(Math.random() * responses.length)]
}

function generateBotScore(difficulty, round) {
  // Bot performance varies by difficulty and gets slightly better over rounds
  let baseScore = 0
  
  if (difficulty === 'easy') {
    baseScore = 5 + Math.floor(Math.random() * 3) // 5-7
  } else if (difficulty === 'medium') {
    baseScore = 6 + Math.floor(Math.random() * 3) // 6-8  
  } else {
    baseScore = 7 + Math.floor(Math.random() * 3) // 7-9
  }
  
  // Bot gets slightly better in later rounds
  const roundBonus = Math.floor(round / 3)
  return Math.min(10, baseScore + roundBonus)
}

function generateUserFeedback(score, argument) {
  if (score >= 8) {
    return "Excellent argument! Strong evidence, clear logic, and effective counter-point addressing."
  } else if (score >= 6) {
    return "Good argument with solid reasoning. Consider adding more specific evidence or examples."
  } else if (score >= 4) {
    return "Adequate argument but needs stronger evidence and clearer logical structure."
  } else {
    return "Argument needs significant improvement. Focus on evidence, logic, and addressing counter-points."  
  }
}