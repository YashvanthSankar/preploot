import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { concept, type, difficulty } = await request.json()

    if (!concept) {
      return NextResponse.json({ error: 'Concept is required' }, { status: 400 })
    }

    // In a real implementation, this would use AI (OpenAI, Gemini, etc.)
    // For now, we'll use smart template-based generation
    const mnemonic = generateMemoryPalace(concept, type, difficulty)

    return NextResponse.json({
      success: true,
      mnemonic
    })

  } catch (error) {
    console.error('Error generating memory palace:', error)
    return NextResponse.json(
      { error: 'Failed to generate memory palace' },
      { status: 500 }
    )
  }
}

function generateMemoryPalace(concept, type, difficulty) {
  const conceptLower = concept.toLowerCase()
  
  // Template-based generation for common concepts
  if (conceptLower.includes('ostwald') || (conceptLower.includes('nitric') && conceptLower.includes('acid'))) {
    return generateOstwaldProcessMnemonic(concept, difficulty)
  } else if (conceptLower.includes('bayer') || conceptLower.includes('bauxite') || conceptLower.includes('aluminum')) {
    return generateBayerProcessMnemonic(concept, difficulty)
  } else if (conceptLower.includes('haber') || (conceptLower.includes('ammonia') && conceptLower.includes('synthesis'))) {
    return generateHaberProcessMnemonic(concept, difficulty)
  } else if (conceptLower.includes('contact') || (conceptLower.includes('sulfuric') && conceptLower.includes('acid'))) {
    return generateContactProcessMnemonic(concept, difficulty)
  } else if (conceptLower.includes('planet')) {
    return generatePlanetMnemonic(concept, difficulty)
  } else if (conceptLower.includes('photosynthesis')) {
    return generatePhotosynthesisMnemonic(concept, difficulty)
  } else if (conceptLower.includes('krebs') || conceptLower.includes('cycle')) {
    return generateKrebsCycleMnemonic(concept, difficulty)
  } else if (conceptLower.includes('trigonometric') || conceptLower.includes('trig')) {
    return generateTrigMnemonic(concept, difficulty)
  } else if (conceptLower.includes('calculus') || conceptLower.includes('derivative') || conceptLower.includes('integral')) {
    return generateCalculusMnemonic(concept, difficulty)
  } else if (conceptLower.includes('algebra') || conceptLower.includes('quadratic') || conceptLower.includes('equation')) {
    return generateAlgebraMnemonic(concept, difficulty)
  } else if (conceptLower.includes('geometry') || conceptLower.includes('theorem') || conceptLower.includes('proof')) {
    return generateGeometryMnemonic(concept, difficulty)
  } else if (conceptLower.includes('statistics') || conceptLower.includes('probability') || conceptLower.includes('distribution')) {
    return generateStatisticsMnemonic(concept, difficulty)
  } else if (conceptLower.includes('matrix') || conceptLower.includes('vector') || conceptLower.includes('linear')) {
    return generateLinearAlgebraMnemonic(concept, difficulty)
  } else if (type === 'mathematics' || type === 'math') {
    return generateGenericMathMnemonic(concept, difficulty)
  } else if (conceptLower.includes('process') || type === 'chemistry') {
    return generateGenericChemicalProcessMnemonic(concept, difficulty)
  } else if (type === 'formula') {
    return generateFormulaMnemonic(concept, difficulty)
  } else if (type === 'list') {
    return generateListMnemonic(concept, difficulty)
  } else if (type === 'dates') {
    return generateDatesMnemonic(concept, difficulty)
  } else if (type === 'vocabulary') {
    return generateVocabularyMnemonic(concept, difficulty)
  } else if (type === 'process') {
    return generateProcessMnemonic(concept, difficulty)
  } else {
    return generateAdvancedMnemonic(concept, difficulty)
  }
}

function generateOstwaldProcessMnemonic(concept, difficulty) {
  if (difficulty === 'easy') {
    return {
      title: "Ostwald Process Memory Palace",
      technique: "Chemical Factory Journey",
      mnemonic: "Ammonia Meets Air, Platinum Makes Magic, Water Washes Product",
      story: "Imagine walking through a **Nitric Acid Factory** with 3 main production halls: **Hall 1 - Mixing Chamber** (Ammonia gas (NH₃) meets hot air, like two friends shaking hands), **Hall 2 - Catalyst Tower** (Shiny platinum mesh acts like a magic catalyst, making ammonia burn with a bright flame to form nitrogen oxide), **Hall 3 - Absorption Tower** (Water sprays down like rain, washing the gases to create nitric acid (HNO₃) - the final product drips out like liquid gold).",
      visualization: "Walk through this chemical factory, seeing gases mixing, platinum sparkling as it catalyzes reactions, and water towers producing the final acid.",
      tips: [
        "Remember: NH₃ + O₂ → NO → HNO₃",
        "Platinum catalyst is the key player",
        "Temperature matters: ~900°C for the reaction"
      ]
    }
  } else if (difficulty === 'medium') {
    return {
      title: "Ostwald Process Chemical Journey",
      technique: "Three-Stage Industrial Story",
      mnemonic: "Oscar's Awesome Ammonia Adventure",
      story: "Enter **Oscar's Nitric Acid Manufacturing Plant** with 3 specialized departments: **Department 1 - Primary Oxidation** (4NH₃ + 5O₂ → 4NO + 6H₂O at 900°C with platinum-rhodium catalyst, conversion ~95%), **Department 2 - Secondary Oxidation** (2NO + O₂ → 2NO₂, this happens spontaneously as gases cool, brown fumes appear), **Department 3 - Absorption & Disproportionation** (3NO₂ + H₂O → 2HNO₃ + NO, the NO recycles back to step 2, creating a loop like a chemical merry-go-round).",
      visualization: "You're the plant supervisor monitoring each department, watching ammonia transform through platinum magic into valuable nitric acid.",
      tips: [
        "Stage 1: Catalytic oxidation (exothermic, high temp)",
        "Stage 2: Gas phase oxidation (spontaneous cooling)",
        "Stage 3: Absorption with recycling loop",
        "Overall yield: ~96-98% of ammonia to nitric acid"
      ]
    }
  } else {
    return {
      title: "Advanced Ostwald Process Complex",
      technique: "Complete Industrial Memory Palace",
      mnemonic: "Optimized Systematic Three-stage Ammonia-to-Acid Logistics",
      story: "Design a **State-of-the-Art Nitric Acid Production Complex**: **Zone A - Feed Preparation** (Ammonia storage at -33°C, vaporization, mixing with pre-heated air 10:1 ratio, filtration through quartz wool), **Zone B - Primary Reactor** (Multiple platinum-rhodium gauze layers 80 mesh, 900-950°C, 4-12 bar pressure, residence time 0.5ms, heat recovery via steam generation), **Zone C - Oxidation Tower** (NO + O₂ → NO₂ equilibrium reaction, temperature control 30-70°C, pressure optimization for equilibrium shift), **Zone D - Absorption System** (Countercurrent absorption towers, 60-70% HNO₃ concentration, tail gas treatment for NOₓ recovery, environmental compliance with SCR/SNCR).",
      visualization: "You're the chief process engineer overseeing this world-class facility, optimizing reaction conditions, monitoring environmental impact, and ensuring maximum efficiency.",
      tips: [
        "Catalyst life: 3-6 months depending on conditions",
        "Energy integration crucial: exothermic reactions generate steam",
        "Environmental: Tail gas contains NOₓ requiring treatment",
        "Economics: 98%+ ammonia conversion, 1.1-1.2 tonnes NH₃ per tonne HNO₃"
      ]
    }
  }
}

function generateCalculusMnemonic(concept, difficulty) {
  if (difficulty === 'easy') {
    return {
      title: "Calculus Memory Palace",
      technique: "Mathematical Journey",
      mnemonic: "Derivatives Dance, Integrals Integrate",
      story: "Enter the **Mathematics Castle** with two main wings: **Derivative Wing** (Rate of Change Hall - imagine slopes of hills getting steeper or flatter, like skiing down mountains), **Integral Wing** (Area Under Curve Gallery - picture filling containers with water, measuring total accumulated amounts). The **Central Courtyard** connects both wings with the **Fundamental Theorem Bridge**.",
      visualization: "Walk through this mathematical castle, seeing slopes transform in the derivative wing and areas accumulate in the integral wing.",
      tips: [
        "Derivative = instantaneous rate of change (slope)",
        "Integral = accumulated change (area under curve)",
        "They are inverse operations (undo each other)"
      ]
    }
  } else if (difficulty === 'medium') {
    return {
      title: "Advanced Calculus Complex",
      technique: "Mathematical Transformation Center",
      mnemonic: "Limits Lead to Derivatives, Derivatives Lead to Integrals",
      story: "Design a **Mathematical Processing Plant**: **Department 1 - Limits Laboratory** (Functions approach values, like getting infinitely close to a target), **Department 2 - Differentiation Division** (f'(x) = lim(h→0)[f(x+h)-f(x)]/h, workers calculate instantaneous rates), **Department 3 - Integration Station** (∫f(x)dx, workers accumulate infinitely small pieces), **Department 4 - Applications Arena** (Optimization problems, related rates, area calculations).",
      visualization: "You're the chief mathematician overseeing this processing plant where functions are transformed and analyzed.",
      tips: [
        "Chain rule for composite functions",
        "Product and quotient rules for combinations",
        "Integration by substitution and parts",
        "Applications in physics, economics, engineering"
      ]
    }
  } else {
    return {
      title: "Comprehensive Calculus Universe",
      technique: "Complete Mathematical Ecosystem",
      mnemonic: "Continuous Analysis of Limiting Convergent Universal Laws",
      story: "Build the **Calculus Multiverse**: **Realm 1 - Single Variable** (Limits, continuity, differentiability, Riemann integrals, series convergence), **Realm 2 - Multivariable** (Partial derivatives, multiple integrals, vector calculus, Green's/Stokes'/Divergence theorems), **Realm 3 - Advanced Topics** (Differential equations, Taylor series, Fourier analysis), **Realm 4 - Real Analysis** (ε-δ definitions, uniform convergence, measure theory).",
      visualization: "Navigate this mathematical multiverse, seeing the deep connections between analysis, geometry, and applications.",
      tips: [
        "ε-δ definition of limits provides rigorous foundation",
        "Fundamental Theorem connects differentiation and integration",
        "Vector calculus extends to higher dimensions",
        "Applications span all quantitative sciences"
      ]
    }
  }
}

function generateAlgebraMnemonic(concept, difficulty) {
  if (difficulty === 'easy') {
    return {
      title: "Algebra Adventure Palace",
      technique: "Equation Solving Journey",
      mnemonic: "X marks the treasure spot",
      story: "Enter the **Treasure Hunter's Algebra Castle**: **Room 1 - Variable Vault** (X, Y, Z are treasure chests waiting to be opened), **Room 2 - Equation Hall** (Balance scales show equal sides, like 2x + 3 = 7), **Room 3 - Operation Chamber** (Add, subtract, multiply, divide - the tools to unlock treasure chests), **Room 4 - Solution Celebration** (X = 2, treasure found!).",
      visualization: "You're a treasure hunter using mathematical tools to unlock the mystery variables and find their values.",
      tips: [
        "Same operation on both sides keeps equation balanced",
        "Work backwards from the answer to understand steps",
        "Check your solution by substituting back"
      ]
    }
  } else if (difficulty === 'medium') {
    return {
      title: "Advanced Algebra Academy",
      technique: "Mathematical Structure System",
      mnemonic: "Factoring Formulas Find Final Forms",
      story: "Study at the **Algebra University**: **Building A - Linear Systems** (Multiple equations work together like a team), **Building B - Quadratic Quarters** (Ax² + Bx + C = 0, parabolic pathways), **Building C - Polynomial Plaza** (Higher degree equations, factoring festivals), **Building D - Function Faculty** (f(x) relationships, domain and range research).",
      visualization: "Walk through this academic campus, seeing mathematical relationships as living, breathing entities in each building.",
      tips: [
        "Quadratic formula: x = [-b ± √(b²-4ac)] / 2a",
        "Factoring reduces complex expressions to simple terms",
        "Graphing reveals function behavior patterns"
      ]
    }
  } else {
    return {
      title: "Abstract Algebra Architecture",
      technique: "Mathematical Structure Design",
      mnemonic: "Groups, Rings, Fields Generate Remarkable Abstractions",
      story: "Architect the **Abstract Algebra Metropolis**: **District G - Group Theory** (Binary operations, closure, associativity, identity, inverses), **District R - Ring Theory** (Addition and multiplication structures, integral domains), **District F - Field Theory** (Division possible, algebraic closures, Galois theory), **District V - Vector Spaces** (Linear independence, basis, dimension theory).",
      visualization: "Design this mathematical city where abstract structures form the foundation of all algebraic thinking.",
      tips: [
        "Groups: symmetry and structure preservation",
        "Rings: generalize arithmetic operations",
        "Fields: complete algebraic systems",
        "Homomorphisms preserve structure"
      ]
    }
  }
}

function generateGeometryMnemonic(concept, difficulty) {
  if (difficulty === 'easy') {
    return {
      title: "Geometry Garden Palace",
      technique: "Shape and Space Journey",
      mnemonic: "Points, Lines, Planes Make Perfect Geometric Gardens",
      story: "Explore the **Geometric Garden**: **Section 1 - Point Plaza** (Dots mark specific locations), **Section 2 - Line Lane** (Straight paths extending infinitely), **Section 3 - Plane Playground** (Flat surfaces like infinite tabletops), **Section 4 - Angle Arena** (Corners where lines meet, measured in degrees), **Section 5 - Shape Showcase** (Triangles, squares, circles living in harmony).",
      visualization: "Walk through this mathematical garden, seeing geometric elements as natural formations in a structured landscape.",
      tips: [
        "Points have no size, lines have no width, planes have no thickness",
        "Angles are measured from 0° to 360°",
        "Area formulas: rectangle = l×w, triangle = ½×b×h, circle = πr²"
      ]
    }
  } else if (difficulty === 'medium') {
    return {
      title: "Advanced Geometry Complex",
      technique: "Proof and Construction System",
      mnemonic: "Theorems Transform Geometric Truth",
      story: "Study at the **Geometric Research Institute**: **Lab 1 - Euclidean Exploration** (Parallel postulate, triangle congruence, similarity theorems), **Lab 2 - Coordinate Calculation** (Distance formula, midpoint theorem, slope relationships), **Lab 3 - Trigonometric Tower** (Sine, cosine, tangent ratios in right triangles), **Lab 4 - Construction Workshop** (Compass and straightedge constructions, impossible constructions).",
      visualization: "You're a geometric researcher discovering eternal mathematical truths through logical proof and precise construction.",
      tips: [
        "Pythagorean theorem: a² + b² = c²",
        "Congruent triangles: SSS, SAS, ASA, AAS",
        "Similar triangles have proportional sides",
        "Proofs require logical step-by-step reasoning"
      ]
    }
  } else {
    return {
      title: "Comprehensive Geometry Universe",
      technique: "Multi-Dimensional Mathematical Space",
      mnemonic: "Geometric Realms Reveal Remarkable Relationships",
      story: "Master the **Geometry Multiverse**: **Dimension 2 - Plane Geometry** (Euclidean, hyperbolic, elliptic geometries), **Dimension 3 - Solid Geometry** (Polyhedra, surface area, volume calculations), **Dimension n - Higher Spaces** (Vector geometry, linear transformations), **Dimension ∞ - Topological Spaces** (Continuity, homeomorphisms, fundamental groups).",
      visualization: "Navigate through mathematical dimensions, seeing how geometric principles scale from simple shapes to complex topological spaces.",
      tips: [
        "Non-Euclidean geometries challenge parallel postulate",
        "Topology studies properties preserved under deformation",
        "Higher dimensions use algebraic rather than visual methods",
        "Geometric proofs develop logical reasoning skills"
      ]
    }
  }
}

function generateStatisticsMnemonic(concept, difficulty) {
  if (difficulty === 'easy') {
    return {
      title: "Statistics Story Palace",
      technique: "Data Detective Journey",
      mnemonic: "Mean, Median, Mode Make Data Stories",
      story: "Become a **Data Detective** in the **Statistics Investigation Center**: **Office 1 - Data Collection** (Gather clues from surveys, experiments, observations), **Office 2 - Organization Station** (Sort data into tables, charts, graphs), **Office 3 - Analysis Arena** (Calculate mean (average), median (middle), mode (most frequent)), **Office 4 - Conclusion Chamber** (Tell the story that data reveals).",
      visualization: "You're solving mysteries with numbers, finding patterns and stories hidden in data collections.",
      tips: [
        "Mean = sum of all values ÷ number of values",
        "Median = middle value when arranged in order",
        "Mode = most frequently occurring value"
      ]
    }
  } else if (difficulty === 'medium') {
    return {
      title: "Advanced Statistics Laboratory",
      technique: "Probability and Inference System",
      mnemonic: "Probability Predicts Population Parameters",
      story: "Work in the **Statistical Research Lab**: **Wing A - Probability Theory** (Sample spaces, events, conditional probability), **Wing B - Distributions Department** (Normal, binomial, Poisson distributions), **Wing C - Sampling Section** (Central limit theorem, confidence intervals), **Wing D - Hypothesis Testing** (Null and alternative hypotheses, p-values, significance levels).",
      visualization: "You're a statistical scientist using mathematical tools to make inferences about populations from sample data.",
      tips: [
        "P(A|B) = P(A∩B) / P(B) for conditional probability",
        "Normal distribution: 68-95-99.7 rule",
        "p-value < α leads to rejecting null hypothesis"
      ]
    }
  } else {
    return {
      title: "Comprehensive Statistical Universe",
      technique: "Advanced Data Science Ecosystem",
      mnemonic: "Statistical Science Reveals Random Reality",
      story: "Master the **Statistical Multiverse**: **Realm 1 - Mathematical Statistics** (Likelihood theory, sufficient statistics, decision theory), **Realm 2 - Applied Statistics** (Regression, ANOVA, experimental design), **Realm 3 - Computational Statistics** (Bootstrap, MCMC, machine learning), **Realm 4 - Bayesian Statistics** (Prior distributions, posterior inference, hierarchical models).",
      visualization: "Navigate the complete statistical universe, seeing how uncertainty and randomness can be mathematically quantified and analyzed.",
      tips: [
        "Likelihood function central to parameter estimation",
        "Bayesian methods incorporate prior knowledge",
        "Computational methods handle complex models",
        "Statistical thinking applies across all sciences"
      ]
    }
  }
}

function generateLinearAlgebraMnemonic(concept, difficulty) {
  if (difficulty === 'easy') {
    return {
      title: "Linear Algebra Army Base",
      technique: "Vector Military Operations",
      mnemonic: "Vectors March in Matrix Formation",
      story: "Enter the **Vector Army Base**: **Barracks 1 - Vector Village** (Soldiers with direction and magnitude), **Barracks 2 - Matrix Headquarters** (Rectangular arrays of numbers commanding operations), **Training Ground** (Addition, subtraction, scalar multiplication drills), **Command Center** (Matrix multiplication coordinates complex maneuvers).",
      visualization: "Watch vectors as soldiers marching in formation, with matrices as their commanding officers organizing operations.",
      tips: [
        "Vectors have magnitude (length) and direction",
        "Matrix multiplication: rows × columns",
        "Identity matrix is like the number 1 for matrices"
      ]
    }
  } else {
    return {
      title: "Advanced Linear Algebra Complex",
      technique: "Mathematical Transformation System",
      mnemonic: "Linear Transformations Link Vector Spaces",
      story: "Command the **Linear Algebra Research Complex**: **Division 1 - Vector Spaces** (Linear independence, basis, dimension), **Division 2 - Linear Transformations** (Functions preserving vector operations), **Division 3 - Eigenvalue Laboratory** (Special vectors that don't change direction), **Division 4 - Applications Arsenal** (Computer graphics, quantum mechanics, data analysis).",
      visualization: "You're the research director overseeing this mathematical complex where abstract vector concepts power real-world applications.",
      tips: [
        "Eigenvalues: Av = λv where v ≠ 0",
        "Determinant measures how transformation changes volume",
        "Linear transformations preserve lines and vector operations",
        "Applications in computer graphics, machine learning, physics"
      ]
    }
  }
}

function generateGenericMathMnemonic(concept, difficulty) {
  const mathArea = concept.replace(/mathematics?|math/i, '').trim() || concept
  return {
    title: `${mathArea} Mathematical Palace`,
    technique: "Universal Mathematical Framework",
    mnemonic: `${mathArea.split(' ').map(word => word.charAt(0).toUpperCase()).join('')} - Mathematical Mastery Method`,
    story: `Build a **${mathArea} Learning Complex** with systematic study areas: **Foundation Floor** (Basic definitions, axioms, and fundamental concepts), **Operation Level** (Core procedures, algorithms, and computational methods), **Application Arena** (Real-world problems and practical uses), **Abstraction Attic** (Advanced theory, proofs, and abstract generalizations). Each level builds upon the previous, creating a complete understanding framework.`,
    visualization: `Navigate this mathematical learning complex as a student progressing from basic concepts to advanced applications in ${mathArea}.`,
    tips: [
      "Start with concrete examples before abstract concepts",
      "Practice problems to reinforce understanding",
      "Look for patterns and connections between topics",
      "Apply mathematical thinking to real-world situations"
    ]
  }
}

function generateHaberProcessMnemonic(concept, difficulty) {
  if (difficulty === 'easy') {
    return {
      title: "Haber Process Memory Palace",
      technique: "Chemical Marriage Story",
      mnemonic: "Nitrogen and Hydrogen Have Iron Wedding",
      story: "Imagine a **Chemical Wedding Ceremony**: **The Bride** (Nitrogen N₂) and **The Groom** (Hydrogen H₂) meet at the altar. **The Minister** (Iron catalyst) helps them join hands. **The Wedding Hall** is very hot (450°C) and under high pressure (200 atm) - like a pressure cooker wedding! The result is beautiful **Ammonia Babies** (NH₃) that feed the world through fertilizers.",
      visualization: "See the wedding ceremony with molecular guests, iron catalyst as the minister, and ammonia as the happy family outcome.",
      tips: [
        "Remember: N₂ + 3H₂ → 2NH₃",
        "Iron catalyst helps the reaction",
        "High pressure and temperature needed"
      ]
    }
  } else if (difficulty === 'medium') {
    return {
      title: "Haber Process Industrial Complex",
      technique: "Factory Production Line",
      mnemonic: "High Pressure Perfect Production",
      story: "Tour the **Ammonia Manufacturing Plant**: **Section 1 - Gas Preparation** (Nitrogen from air, Hydrogen from steam reforming CH₄), **Section 2 - Compression Station** (Boost pressure to 150-300 atm), **Section 3 - Reaction Chamber** (Iron catalyst bed at 400-500°C, Le Chatelier's principle favors ammonia formation), **Section 4 - Separation Unit** (Cool gases, liquid ammonia separates, unreacted gases recycle back).",
      visualization: "Walk through this industrial complex, seeing massive compressors, catalyst beds, and ammonia condensers working in harmony.",
      tips: [
        "Compromise conditions: moderate temp/high pressure",
        "Recycling increases overall yield to ~98%",
        "Feeds 40% of world's population through fertilizer"
      ]
    }
  } else {
    return {
      title: "Advanced Haber-Bosch Process",
      technique: "Complete Industrial Ecosystem",
      mnemonic: "Highly Advanced Balanced Engineering Reactor",
      story: "Master the **Complete Ammonia Synthesis Complex**: **Pre-treatment Facility** (Desulfurization, steam reforming: CH₄ + H₂O → CO + 3H₂, water-gas shift: CO + H₂O → CO₂ + H₂), **Synthesis Loop** (Promoted iron catalyst Fe/K₂O/Al₂O₃, 400-500°C, 150-350 bar, space velocity optimization), **Product Recovery** (Multi-stage condensation, ammonia separation efficiency >99.5%), **Energy Integration** (Heat exchangers, steam generation, refrigeration cycles for separation).",
      visualization: "You're the process control engineer monitoring this integrated chemical complex, optimizing energy efficiency and maximizing conversion.",
      tips: [
        "Catalyst promoters: K₂O (electronic), Al₂O₃ (structural)",
        "Thermodynamic vs kinetic optimization balance",
        "Energy efficiency crucial: 28-35 GJ/metric ton NH₃"
      ]
    }
  }
}

function generateContactProcessMnemonic(concept, difficulty) {
  if (difficulty === 'easy') {
    return {
      title: "Contact Process Memory Palace",
      technique: "Sulfur's Journey to Acid",
      mnemonic: "Sulfur Burns, Vanadium Helps, Water Makes Acid",
      story: "Follow **Sulfur's Adventure** through the acid factory: **Station 1 - Burning Chamber** (Sulfur burns in air making SO₂, like a sulfur campfire), **Station 2 - Catalyst Tower** (Vanadium pentoxide (V₂O₅) helps SO₂ become SO₃, like a chemical transformer), **Station 3 - Absorption Tower** (SO₃ meets concentrated sulfuric acid first, then water is added carefully to make more acid - H₂SO₄).",
      visualization: "Watch sulfur's transformation journey through three magical stations, ending with powerful sulfuric acid.",
      tips: [
        "Remember: S → SO₂ → SO₃ → H₂SO₄",
        "Vanadium catalyst is the key helper",
        "Never add water directly to SO₃!"
      ]
    }
  } else {
    return {
      title: "Contact Process Industrial Plant",
      technique: "Multi-Stage Chemical Transformation",
      mnemonic: "Careful Controlled Chemical Creation",
      story: "Operate the **Sulfuric Acid Manufacturing Complex**: **Stage 1 - Combustion** (S + O₂ → SO₂ at 1000°C), **Stage 2 - Catalytic Conversion** (2SO₂ + O₂ ⇌ 2SO₃ with V₂O₅ catalyst at 450°C, 1-2 atm), **Stage 3 - Absorption** (SO₃ + H₂SO₄ → H₂S₂O₇ oleum, then H₂S₂O₇ + H₂O → 2H₂SO₄), **Quality Control** (98-99% H₂SO₄ concentration).",
      visualization: "Monitor this sophisticated chemical plant where sulfur transforms through controlled stages into industrial-grade sulfuric acid.",
      tips: [
        "Double contact process increases yield to 99.5%",
        "Temperature control critical for equilibrium",
        "Oleum intermediate prevents acid mist formation"
      ]
    }
  }
}

function generateGenericChemicalProcessMnemonic(concept, difficulty) {
  const processName = concept.replace(/process/i, '').trim()
  return {
    title: `${processName} Process Memory Palace`,
    technique: "Universal Chemical Process Framework",
    mnemonic: `${processName.split(' ').map(word => word.charAt(0).toUpperCase()).join('')} - Methodical Industrial Transformation`,
    story: `Build a **${processName} Manufacturing Complex** with systematic zones: **Zone 1 - Raw Material Preparation** (Input materials are prepared, purified, and conditioned), **Zone 2 - Reaction Chamber** (Main chemical transformation occurs under controlled conditions), **Zone 3 - Separation & Purification** (Products are separated from unreacted materials and byproducts), **Zone 4 - Product Recovery** (Final products are collected, refined, and quality-tested). Each zone has specific temperature, pressure, and catalyst requirements optimized for maximum efficiency.`,
    visualization: `Walk through this industrial complex as the chief process engineer, monitoring each transformation step and ensuring optimal conditions for ${processName}.`,
    tips: [
      "Identify key reactants and products",
      "Note critical temperature and pressure conditions",
      "Understand catalyst role and regeneration",
      "Consider environmental and safety aspects"
    ]
  }
}

function generateBayerProcessMnemonic(concept, difficulty) {
  if (difficulty === 'easy') {
    return {
      title: "Bayer Process Memory Palace",
      technique: "Industrial Journey",
      mnemonic: "Big Diggers Crush Red Rocks, Soda Dissolves Aluminum, Filter Clear Solution, Cool Creates Crystals, Heat Makes Pure Metal",
      story: "Imagine walking through an **Aluminum Factory** with 5 main stations: **Station 1 - Mining Pit** (Bauxite extraction - big red rocks everywhere), **Station 2 - Crushing Mill** (Giant hammers crush red bauxite ore), **Station 3 - Digestion Tank** (Hot caustic soda (NaOH) dissolves aluminum oxide, like a giant soup pot), **Station 4 - Clarification** (Filter removes impurities, clear aluminum hydroxide solution remains), **Station 5 - Precipitation** (Cool the solution, white aluminum hydroxide crystals form like snow), **Station 6 - Calcination** (Roast crystals in hot furnace to get pure aluminum oxide - Al₂O₃).",
      visualization: "Walk through this industrial complex, seeing workers at each station transforming red rocks into white aluminum oxide powder.",
      tips: [
        "Remember: Bauxite (red) → Aluminum Oxide (white)",
        "Key chemical: Caustic soda (NaOH) dissolves aluminum",
        "Temperature matters: Hot to dissolve, Cool to crystallize, Hot again to purify"
      ]
    }
  } else if (difficulty === 'medium') {
    return {
      title: "Bayer Process Chemical Journey",
      technique: "Chemical Transformation Story",
      mnemonic: "Big Bauxite Beauties Become Brilliant Aluminum",
      story: "Enter the **Aluminum Refinery Palace** with 6 grand halls: **Hall 1 - Raw Materials** (Bauxite ore Al₂O₃·2H₂O with iron oxide giving red color), **Hall 2 - Grinding Chamber** (Mechanical preparation), **Hall 3 - Digestion Reactor** (High pressure, 150-200°C, NaOH + Al₂O₃ → Na[Al(OH)₄] sodium aluminate solution), **Hall 4 - Clarification Gallery** (Red mud (iron oxide + impurities) settles and removed), **Hall 5 - Precipitation Theater** (Seed crystals added, cooling causes Al(OH)₃ to crystallize out), **Hall 6 - Calcination Furnace** (1000°C roasting: 2Al(OH)₃ → Al₂O₃ + 3H₂O, producing pure alumina).",
      visualization: "You're a chemical engineer touring this high-tech facility, watching molecular transformations at each station.",
      tips: [
        "Main reaction: Al₂O₃ + 2NaOH + 3H₂O → 2Na[Al(OH)₄]",
        "Red mud is waste (iron oxide + other impurities)",
        "Seeding is crucial for crystal formation",
        "Final product: 99.5%+ pure aluminum oxide"
      ]
    }
  } else {
    return {
      title: "Advanced Bayer Process Memory Palace",
      technique: "Complete Industrial Complex",
      mnemonic: "Bauxite's Beautiful Billion-dollar Transformation",
      story: "Design a **Complete Aluminum Refinery City**: **District 1 - Mining Quarter** (Bauxite mines with Al₂O₃·nH₂O, Fe₂O₃, SiO₂, TiO₂), **District 2 - Preparation Plaza** (Grinding to -100 mesh, pre-desilication if high silica), **District 3 - Digestion Downtown** (High-pressure autoclaves 4-6 atm, 145-260°C depending on bauxite type, residence time 30-60 min, liquor caustic concentration 150-300 g/L Na₂O), **District 4 - Clarification Center** (Thickeners, washers, red mud contains 30-35% Al₂O₃ loss), **District 5 - Precipitation Park** (Cooling to 60°C, agitation tanks, residence time 60-80 hours, classification and washing), **District 6 - Calcination Campus** (Fluid bed calciners at 1050-1100°C, α-Al₂O₃ formation, surface area control 0.5-50 m²/g).",
      visualization: "You're the city planner overseeing this industrial metropolis, monitoring efficiency, yield, and quality at each district.",
      tips: [
        "Bauxite types affect process: Gibbsitic (low temp), Boehmitic (medium), Diasporic (high temp)",
        "Key parameters: A/S ratio (Al₂O₃/SiO₂), caustic concentration, residence time",
        "Yield typically 85-95% Al₂O₃ recovery from bauxite",
        "Energy intensive: ~13-15 GJ/tonne Al₂O₃ produced"
      ]
    }
  }
}

function generatePlanetMnemonic(concept, difficulty) {
  if (difficulty === 'easy') {
    return {
      title: "Planet Order Memory Aid",
      technique: "Simple Acronym",
      mnemonic: "My Very Educated Mother Just Served Us Nachos",
      story: "Remember this sentence: **My Very Educated Mother Just Served Us Nachos**. Each first letter represents a planet in order from the Sun: **M**ercury, **V**enus, **E**arth, **M**ars, **J**upiter, **S**aturn, **U**ranus, **N**eptune.",
      visualization: "Picture your mother in the kitchen, serving nachos while teaching you about space.",
      tips: [
        "Say the sentence out loud 5 times",
        "Associate each planet with the word (Mercury = My, Venus = Very, etc.)",
        "Remember: My mother is very smart, that's why she's educated!"
      ]
    }
  } else if (difficulty === 'medium') {
    return {
      title: "Planet Journey Memory Palace",
      technique: "Story-Based Journey",
      mnemonic: "My Very Educated Mother Just Served Us Nachos",
      story: "Take a journey through your house, starting at the **front door**. Walk to the **Kitchen** (Mercury - hot like a stove), where your **Very** busy mother cooks. Move to the **Living Room** (Venus - beautiful like a sitting area) where she's **Educated** and reading. Enter the **Dining Room** (Earth - where we eat) where **Mother** serves meals. Go to the **Garage** (Mars - red like rust on tools) where tools are **Just** stored. Descend to the **Basement** (Jupiter - large underground space) where things are **Served** in storage. Climb **Upstairs** (Saturn - ringed like circular stairs) where **Us** kids play. Enter the **Attic** (Uranus - tilted like a slanted roof) where old **Nachos** are stored.",
      visualization: "Walk through your house in order, spending time in each room and seeing the planets as room characteristics.",
      tips: [
        "Practice the house tour 3 times",
        "Associate planet features with room characteristics",
        "Draw a simple floor plan to help visualize"
      ]
    }
  } else {
    return {
      title: "Solar System Memory Palace",
      technique: "Advanced Multi-Sensory Palace",
      mnemonic: "My Very Educated Mother Just Served Us Nachos",
      story: "Create a **Solar System Restaurant** in your mind. You're the manager walking through: **Entrance** (Sun - bright lobby lights), **Mercury Station** (hot appetizer station, **My** chef works fast), **Venus Station** (beautiful pastry display, **Very** elegant), **Earth Station** (main dining, where **Educated** waiters serve), **Mars Station** (red meat grill, where **Mother** supervises), **Jupiter Station** (largest buffet area, **Just** massive selection), **Saturn Station** (circular sushi bar with ring-shaped plates, **Served** in style), **Uranus Station** (tilted cocktail bar, **Us** bartenders work sideways), **Neptune Station** (blue seafood area, **Nachos** with fish). Each station has unique smells, sounds, and staff uniforms matching planet colors.",
      visualization: "Walk through as restaurant manager, engaging all senses - see colors, hear sounds, smell foods, feel temperatures.",
      tips: [
        "Assign each planet a color, temperature, and sound",
        "Practice walking through all 9 stations in order",
        "Add personal details to make each station memorable",
        "Review by closing eyes and 'walking' through the restaurant"
      ]
    }
  }
}

function generatePhotosynthesisMnemonic(concept, difficulty) {
  if (difficulty === 'easy') {
    return {
      title: "Plant Food Factory",
      technique: "Simple Analogy",
      mnemonic: "Plants eat Light and Air, make Sugar and fresh Air",
      story: "Think of plants as **tiny factories**. They take in **Light** (from the sun) and **Air** (CO₂) through their **green doors** (leaves). Inside the factory (chloroplasts), workers (chlorophyll) **cook up Sugar** (glucose) and release **fresh Air** (oxygen) as a bonus product.",
      visualization: "See a green factory with smokestacks releasing fresh oxygen.",
      tips: [
        "Remember: Input = Light + CO₂, Output = Sugar + O₂",
        "Green = the factory color (chlorophyll)",
        "Plants are like backwards animals (we breathe what they make)"
      ]
    }
  } else if (difficulty === 'medium') {
    return {
      title: "The Green Café Story",
      technique: "Detailed Story Visualization",
      mnemonic: "Sunny's Green Café serves Sweet treats with Fresh air",
      story: "Imagine **Sunny's Green Café** run by plants: **Sunny** (sunlight) provides all the energy through solar panels. **Green waiters** (chlorophyll) work efficiently in green uniforms. **Customers** (CO₂ molecules) enter through special **Air Vents** (stomata). The **Kitchen** (chloroplasts) combines **Water** (piped in from roots) with **Air** (CO₂) using **Solar Energy** to create **Sweet Sugar meals** (glucose). As a bonus, the café releases **Fresh Oxygen** through the **Ventilation System**, making the neighborhood air cleaner.",
      visualization: "You're a customer watching this eco-friendly café operate smoothly.",
      tips: [
        "Remember the formula: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂",
        "Green uniforms = chlorophyll (essential for the process)",
        "The café both feeds plants and cleans our air"
      ]
    }
  } else {
    return {
      title: "Photosynthesis Production Line",
      technique: "Complex Memory Palace",
      mnemonic: "Six Carbon-Oxygen pairs plus Six Water molecules plus Light Energy creates One Sugar plus Six Oxygen pairs",
      story: "Build a **multi-level factory in your mind**: **Ground Floor** - **Loading Dock** where 6 **CO₂ trucks** deliver carbon dioxide through **Stomata Gates**. **Basement** - **Water Processing** where 6 **H₂O tankers** pump water up through **Root Pipelines**. **Roof** - **Solar Array** where **Light Receptors** (chlorophyll) capture solar energy in **Thylakoids**. **Main Production Floor** - **Calvin Cycle Assembly Line** where raw materials combine in the **Stroma Workshop**. **Shipping Department** - **Sugar Packaging** (C₆H₁₂O₆) sent to **Storage Warehouses** while **Oxygen Loading Bays** release 6 O₂ molecules through **Stomata Exits**.",
      visualization: "You're the factory supervisor overseeing this complex operation, walking between floors and monitoring each stage.",
      tips: [
        "Light reactions happen on the roof (thylakoids)",
        "Dark reactions happen on main floor (stroma)",
        "Count molecules: 6 in, 1 sugar + 6 out",
        "Practice walking the factory tour in sequence"
      ]
    }
  }
}

function generateFormulaMnemonic(concept, difficulty) {
  return {
    title: "Formula Memory Palace",
    technique: "Visual Formula Story",
    mnemonic: createFormulaAcronym(concept),
    story: `Transform your formula into a story: Break down "${concept}" into memorable chunks. Each symbol becomes a character, each operation becomes an action. Create a visual narrative where mathematical relationships become logical story progressions.`,
    visualization: "See each part of the formula as a character in an unfolding drama.",
    tips: [
      "Convert symbols to memorable characters",
      "Turn operations (+, -, ×, ÷) into actions",
      "Practice writing the formula while telling the story"
    ]
  }
}

function generateListMnemonic(concept, difficulty) {
  const items = concept.split(/[,;:]/).map(item => item.trim()).filter(item => item)
  const acronym = items.map(item => item.charAt(0).toUpperCase()).join('')
  
  return {
    title: "List Memory Journey",
    technique: "Acronym + Journey Method",
    mnemonic: createAcronymSentence(acronym),
    story: `Create a journey through familiar locations, placing each item: ${items.map((item, index) => `**Stop ${index + 1}**: ${item}`).join(', ')}. Walk through each location in order, visualizing each item clearly in its assigned space.`,
    visualization: "Take a mental walk, stopping at each location to see the item clearly.",
    tips: [
      "Use locations you know well (your house, school, neighborhood)",
      "Make each item interact with its location",
      "Practice the journey forward and backward"
    ]
  }
}

function generateDatesMnemonic(concept, difficulty) {
  return {
    title: "Historical Timeline Palace",
    technique: "Date Association Story",
    mnemonic: createDateMnemonic(concept),
    story: `Transform dates into memorable stories using the **Number-Rhyme System**: Connect historical events with vivid imagery. For dates, break them into chunks and create rhyming or visual associations.`,
    visualization: "See historical events unfolding like scenes in a movie.",
    tips: [
      "Break dates into smaller, memorable chunks",
      "Use rhymes: 1939 = 'thirty-nine, so fine'",
      "Connect events to personal or familiar references"
    ]
  }
}

function generateVocabularyMnemonic(concept, difficulty) {
  return {
    title: "Word Association Palace",
    technique: "Etymology + Visual Links",
    mnemonic: createWordBreakdown(concept),
    story: `Break down the word into meaningful parts and create visual connections. Look for root words, prefixes, suffixes, and create memorable associations with the meaning.`,
    visualization: "See the word's components as physical objects that combine to create meaning.",
    tips: [
      "Break complex words into familiar parts",
      "Create visual links between word parts and meaning",
      "Use silly or exaggerated mental images for better recall"
    ]
  }
}

function generateProcessMnemonic(concept, difficulty) {
  return {
    title: "Process Journey Palace",
    technique: "Sequential Story Method",
    mnemonic: createProcessAcronym(concept),
    story: `Transform each step of the process into a scene in an unfolding story. Each step becomes a character or action that logically leads to the next, creating a memorable narrative flow.`,
    visualization: "Watch the process unfold like a movie, with clear cause-and-effect relationships.",
    tips: [
      "Make each step a clear, visual scene",
      "Connect steps with logical transitions",
      "Practice telling the story from memory"
    ]
  }
}

function generateGeneralMnemonic(concept, difficulty) {
  return {
    title: "Custom Memory Palace",
    technique: "Personalized Association",
    mnemonic: createGeneralMnemonic(concept),
    story: `Create a personalized memory palace for your concept. Break it down into key components and associate each with familiar locations, people, or experiences from your own life.`,
    visualization: "Use your most familiar environments and personal associations.",
    tips: [
      "Break the concept into 3-7 key components",
      "Use personal references that are meaningful to you",
      "Create strong sensory associations (sight, sound, smell, touch)"
    ]
  }
}

// Helper functions
function createFormulaAcronym(formula) {
  // Extract key variables and create memorable phrase
  return "Remember the key variables and their relationships"
}

function createAcronymSentence(acronym) {
  const words = {
    'A': 'Amazing', 'B': 'Big', 'C': 'Creative', 'D': 'Dancing', 'E': 'Excited',
    'F': 'Friendly', 'G': 'Great', 'H': 'Happy', 'I': 'Incredible', 'J': 'Joyful',
    'K': 'Kind', 'L': 'Lovely', 'M': 'Magnificent', 'N': 'Nice', 'O': 'Outstanding',
    'P': 'Perfect', 'Q': 'Quick', 'R': 'Remarkable', 'S': 'Super', 'T': 'Terrific',
    'U': 'Unique', 'V': 'Vibrant', 'W': 'Wonderful', 'X': 'eXciting', 'Y': 'Young', 'Z': 'Zesty'
  }
  
  return acronym.split('').map(letter => words[letter] || letter).join(' ')
}

function createDateMnemonic(concept) {
  return "Break dates into memorable chunks and create rhyming associations"
}

function createWordBreakdown(concept) {
  return "Break word into root, prefix, suffix for easier memorization"
}

function createProcessAcronym(concept) {
  return "Each step becomes a memorable scene in your story"
}

function generateKrebsCycleMnemonic(concept, difficulty) {
  if (difficulty === 'easy') {
    return {
      title: "Krebs Cycle Memory Aid",
      technique: "Simple Acronym",
      mnemonic: "Can I Keep Selling Seashells For Money Officer?",
      story: "Remember this sentence where each word represents a step: **C**itrate → **I**socitrate → **K**etoglutarate → **S**uccinyl-CoA → **S**uccinate → **F**umarate → **M**alate → **O**xaloacetate",
      visualization: "Picture a person selling seashells in a cycle, going through each step.",
      tips: [
        "Say the sentence 5 times out loud",
        "Remember it's a cycle - it goes back to the beginning",
        "Each step produces energy (ATP) for the cell"
      ]
    }
  } else if (difficulty === 'medium') {
    return {
      title: "Cellular Energy Factory",
      technique: "Story-Based Journey",
      mnemonic: "Can I Keep Selling Seashells For Money Officer?",
      story: "Imagine a **Circular Factory Floor** where workers process materials: **Station 1** (Citrate) - Raw materials arrive, **Station 2** (Isocitrate) - First processing begins, **Station 3** (α-Ketoglutarate) - Key transformation happens, **Station 4** (Succinyl-CoA) - Energy coupling occurs, **Station 5** (Succinate) - Simplification process, **Station 6** (Fumarate) - Water addition, **Station 7** (Malate) - Final processing, **Station 8** (Oxaloacetate) - Ready to start again. Each station produces **ATP coins** (energy currency).",
      visualization: "Walk around the circular factory floor, seeing workers at each station transform materials.",
      tips: [
        "Remember it happens in the mitochondria (cell's powerhouse)",
        "Each turn of the cycle produces ATP, NADH, and FADH2",
        "The cycle must keep turning to produce energy"
      ]
    }
  } else {
    return {
      title: "Mitochondrial Energy Cycle Palace",
      technique: "Complex Memory Palace",
      mnemonic: "Can I Keep Selling Seashells For Money Officer?",
      story: "Build a **Circular Palace** in the mitochondria: **Entrance Hall** (Citrate - 6C, grand entrance), **Library** (Isocitrate - 6C, knowledge transformation), **King's Chamber** (α-Ketoglutarate - 5C, where CO₂ leaves the kingdom), **Treasury** (Succinyl-CoA - 4C, where GTP/ATP is minted), **Armory** (Succinate - 4C, strong and stable), **Garden** (Fumarate - 4C, where H₂O is added like watering), **Wine Cellar** (Malate - 4C, fermentation area), **Queen's Chamber** (Oxaloacetate - 4C, ready to welcome new Acetyl-CoA). Each room has specific **Currency Generators**: NADH (3 ATP), FADH₂ (2 ATP), GTP (1 ATP).",
      visualization: "Tour this royal palace, seeing the molecular transformations as royal activities in each room.",
      tips: [
        "Net yield: 1 ATP + 3 NADH + 1 FADH₂ + 1 GTP per cycle",
        "Acetyl-CoA enters at the beginning to start the cycle",
        "CO₂ is released at steps 3 and 4",
        "The cycle runs twice per glucose molecule"
      ]
    }
  }
}

function generateTrigMnemonic(concept, difficulty) {
  if (difficulty === 'easy') {
    return {
      title: "SOH CAH TOA",
      technique: "Classic Trigonometric Mnemonic",
      mnemonic: "Some Old Hippie Caught Another Hippie Tripping On Acid",
      story: "**SOH** = **S**in = **O**pposite/**H**ypotenuse, **CAH** = **C**os = **A**djacent/**H**ypotenuse, **TOA** = **T**an = **O**pposite/**A**djacent",
      visualization: "Picture hippies in a triangle, with each side representing different ratios.",
      tips: [
        "Draw a right triangle and label the sides",
        "Remember: Opposite is across from the angle",
        "Adjacent is next to the angle (but not hypotenuse)"
      ]
    }
  } else {
    return {
      title: "Trigonometric Ratios Palace",
      technique: "Advanced Trigonometric Memory",
      mnemonic: "SOH CAH TOA + Unit Circle Journey",
      story: "Build a **Circular Palace** (Unit Circle) with **Four Quadrants**: **East Wing** (0°-90°, all positive), **North Wing** (90°-180°, sin positive), **West Wing** (180°-270°, tan positive), **South Wing** (270°-360°, cos positive). Each room contains **Special Angle Furniture**: **30°-60°-90° Triangle Table**, **45°-45°-90° Square Table**. Values are stored in **Fraction Drawers**: sin(30°) = 1/2, cos(30°) = √3/2, etc.",
      visualization: "Walk through the circular palace, seeing angles as doors and values as treasures in each room.",
      tips: [
        "Memorize special angles: 0°, 30°, 45°, 60°, 90°",
        "Use the unit circle for all angle measurements",
        "Remember ASTC: All, Sin, Tan, Cos (quadrant signs)"
      ]
    }
  }
}

function generateAdvancedMnemonic(concept, difficulty) {
  const words = concept.split(' ')
  const acronym = words.map(word => word.charAt(0).toUpperCase()).join('')
  
  if (difficulty === 'easy') {
    return {
      title: `${concept} Memory Aid`,
      technique: "Acronym Method",
      mnemonic: `${acronym} - ${createAcronymSentence(acronym)}`,
      story: `Break down "${concept}" into key components and create memorable associations. Each component becomes a vivid mental image that connects to your personal experiences.`,
      visualization: "Create a mental journey connecting each component to familiar places or people.",
      tips: [
        "Use personal experiences to make connections stronger",
        "Create vivid, unusual mental images",
        "Practice recalling the concept using your memory aids"
      ]
    }
  } else if (difficulty === 'medium') {
    return {
      title: `${concept} Memory Palace`,
      technique: "Location-Based Method",
      mnemonic: `Navigate through familiar spaces to remember ${concept}`,
      story: `Create a mental journey through your house or school, placing each aspect of "${concept}" in different rooms. As you walk through each space, the location triggers memory of the concept component stored there.`,
      visualization: "Walk through your chosen familiar location, seeing each concept element clearly positioned in specific spots.",
      tips: [
        "Choose locations you know extremely well",
        "Place items in logical order along your path",
        "Use all your senses - see, hear, smell, touch each memory"
      ]
    }
  } else {
    return {
      title: `Advanced ${concept} Memory System`,
      technique: "Multi-Sensory Palace",
      mnemonic: `${acronym} - Comprehensive memory system`,
      story: `Build a complete memory world for "${concept}". Create multiple interconnected memory palaces with rich sensory details, emotional connections, and logical story progressions. Each element has visual, auditory, and kinesthetic associations.`,
      visualization: "Construct an entire mental world where every aspect of the concept has its place, story, and sensory signature.",
      tips: [
        "Layer multiple memory techniques together",
        "Include emotional connections to strengthen recall",
        "Create backup memory paths in case one fails",
        "Regular review using different sensory pathways"
      ]
    }
  }
}

function createGeneralMnemonic(concept) {
  const words = concept.split(' ')
  return `Key concept: ${words.map(word => word.charAt(0).toUpperCase()).join('')} - Create your personal connection`
}