// Curated educational content database
export const EDUCATIONAL_VIDEOS = {
  JEE: {
    Physics: {
      Thermodynamics: [
        {
          id: "dQw4w9WgXcQ",
          title: "Complete Thermodynamics for JEE Main & Advanced",
          channel: "Physics Wallah",
          duration: "45:30",
          description: "Complete thermodynamics concepts with solved examples",
          topics: ["First Law", "Second Law", "Entropy", "Heat Engines"],
          difficulty: "intermediate",
          views: "1.2M",
          uploadDate: "2024-01-15"
        },
        {
          id: "abc123defgh",
          title: "Thermodynamics Problem Solving Techniques",
          channel: "Unacademy JEE",
          duration: "32:45",
          description: "Advanced problem solving for thermodynamics",
          topics: ["PV Diagrams", "Cyclic Processes", "Efficiency"],
          difficulty: "advanced",
          views: "800K",
          uploadDate: "2024-02-20"
        }
      ],
      Mechanics: [
        {
          id: "xyz789uvwx",
          title: "Newton's Laws and Applications",
          channel: "Khan Academy",
          duration: "28:15",
          description: "Fundamental concepts of mechanics",
          topics: ["Newton's Laws", "Friction", "Motion"],
          difficulty: "beginner",
          views: "2.1M",
          uploadDate: "2023-12-10"
        }
      ]
    },
    Chemistry: {
      "Organic Chemistry": [
        {
          id: "org123chem",
          title: "Organic Chemistry Basics for JEE",
          channel: "Chemistry Pro",
          duration: "55:20",
          description: "Introduction to organic chemistry concepts",
          topics: ["Nomenclature", "Isomerism", "Reactions"],
          difficulty: "beginner",
          views: "950K",
          uploadDate: "2024-01-05"
        }
      ]
    }
  },
  NEET: {
    Biology: {
      "Cell Structure": [
        {
          id: "bio456cell",
          title: "Cell Structure and Function",
          channel: "Biology by Vikas",
          duration: "40:12",
          description: "Complete cell biology for NEET",
          topics: ["Cell Organelles", "Cell Division", "Membrane"],
          difficulty: "intermediate",
          views: "1.5M",
          uploadDate: "2024-01-20"
        }
      ]
    }
  }
};

// Function to get videos from curated database
export const getCuratedVideos = (exam, subject, topic = null) => {
  try {
    if (topic) {
      return EDUCATIONAL_VIDEOS[exam]?.[subject]?.[topic] || [];
    }
    
    // Return all videos for the subject
    const subjectData = EDUCATIONAL_VIDEOS[exam]?.[subject] || {};
    return Object.values(subjectData).flat();
  } catch (error) {
    console.error('Error getting curated videos:', error);
    return [];
  }
};

// Function to search within curated content
export const searchCuratedVideos = (query, exam = null) => {
  const results = [];
  
  for (const examName in EDUCATIONAL_VIDEOS) {
    if (exam && examName !== exam) continue;
    
    for (const subject in EDUCATIONAL_VIDEOS[examName]) {
      for (const topic in EDUCATIONAL_VIDEOS[examName][subject]) {
        const videos = EDUCATIONAL_VIDEOS[examName][subject][topic];
        
        const matchingVideos = videos.filter(video => 
          video.title.toLowerCase().includes(query.toLowerCase()) ||
          video.description.toLowerCase().includes(query.toLowerCase()) ||
          video.topics.some(t => t.toLowerCase().includes(query.toLowerCase()))
        );
        
        results.push(...matchingVideos.map(video => ({
          ...video,
          exam: examName,
          subject,
          topic
        })));
      }
    }
  }
  
  return results;
};