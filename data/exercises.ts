

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  image: string;
  video?: string; // Added video property
  description?: string; // Legacy/Fallback
  // Detailed fields
  overview: string;
  steps: string[];
  benefits: string[];
  bpm: number; // Avg Heart Rate
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  videoContext: string;
  equipmentList: string[];
  calories: number;
}

export const EXERCISE_CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

// Sample high-quality fitness stock videos
const VIDEOS = {
  SQUAT: "https://videos.pexels.com/video-files/4761426/4761426-hd_1080_1920_25fps.mp4", // Woman squatting
  BENCH: "https://videos.pexels.com/video-files/5319759/5319759-hd_1080_1920_25fps.mp4", // Bench Press / Chest
  DEADLIFT: "https://videos.pexels.com/video-files/8477764/8477764-hd_1080_1920_25fps.mp4", // Deadlift variant
  PULLUP: "https://videos.pexels.com/video-files/4761732/4761732-hd_1080_1920_25fps.mp4", // Pull workout
  RUN: "https://videos.pexels.com/video-files/3763321/3763321-hd_1080_1920_25fps.mp4" // Cardio
};

export const EXERCISE_DB: Exercise[] = [
  { 
    id: 'e1', 
    name: 'Barbell Squat', 
    muscle: 'Legs', 
    equipment: 'Barbell', 
    image: 'https://images.unsplash.com/photo-1567598508481-65985588e295?q=80&w=800&auto=format&fit=crop',
    video: VIDEOS.SQUAT,
    overview: "The Barbell Squat is the definitive lower-body compound exercise for building strength and mass. It engages the entire posterior chain and core.",
    benefits: ["Builds total body strength", "Increases core stability", "Improves bone density", "Enhances athletic performance"],
    steps: [
      "Set up the bar at upper-chest height in a power rack.",
      "Step under the bar and place it on your upper back (traps).",
      "Unrack the bar and take two steps back. Set feet shoulder-width apart.",
      "Take a deep breath into your belly and brace your core.",
      "Break at the hips and knees simultaneously, lowering yourself as if sitting.",
      "Keep your chest up and back straight. Go down until thighs are parallel.",
      "Drive through your mid-foot to stand back up, exhaling at the top."
    ],
    bpm: 145,
    difficulty: 'Advanced',
    videoContext: "Pay attention to the neutral spine position. Notice how the hips descend back and down simultaneously.",
    equipmentList: ["Barbell", "Squat Rack", "Weight Plates"],
    calories: 60
  },
  { 
    id: 'e2', 
    name: 'Bench Press', 
    muscle: 'Chest', 
    equipment: 'Barbell', 
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
    video: VIDEOS.BENCH,
    overview: "The Bench Press is the primary compound movement for upper body pushing strength, targeting pectorals, shoulders, and triceps.",
    benefits: ["Increases upper body pushing power", "Builds pectoral mass", "Strengthens triceps"],
    steps: [
      "Lie flat on the bench with your eyes directly under the bar.",
      "Plant your feet firmly on the ground and squeeze shoulder blades together.",
      "Grip the bar slightly wider than shoulder-width.",
      "Unrack and hold directly over shoulders with arms locked.",
      "Lower the bar slowly to your mid-chest (sternum).",
      "Press the bar back up explosively to the starting position."
    ],
    bpm: 120,
    difficulty: 'Intermediate',
    videoContext: "Observe the 45-degree elbow tuck on the descent to protect the shoulders.",
    equipmentList: ["Bench", "Barbell", "Plates"],
    calories: 45
  },
  { 
    id: 'e3', 
    name: 'Deadlift', 
    muscle: 'Back', 
    equipment: 'Barbell', 
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
    video: VIDEOS.DEADLIFT,
    overview: "The Deadlift targets the entire posterior chain, including the back, glutes, and hamstrings. It is the ultimate test of raw strength.",
    benefits: ["Full body engagement", "Corrects posture", "Builds massive grip strength"],
    steps: [
      "Stand with mid-foot under the barbell. Feet hip-width apart.",
      "Bend over and grab the bar with a shoulder-width grip.",
      "Bend knees until shins touch the bar.",
      "Lift chest up and straighten lower back.",
      "Take a deep breath, brace core, and pull by driving hips forward.",
      "Lock out at the top by squeezing glutes, then lower with control."
    ],
    bpm: 155,
    difficulty: 'Advanced',
    videoContext: "Note the straight back throughout the lift. The hips and shoulders rise at the same rate.",
    equipmentList: ["Barbell", "Plates", "Platform"],
    calories: 75
  },
  { 
    id: 'e4', 
    name: 'Pull Up', 
    muscle: 'Back', 
    equipment: 'Bodyweight', 
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800&auto=format&fit=crop',
    video: VIDEOS.PULLUP,
    overview: "The Pull Up is a fundamental bodyweight exercise for back width and arm strength, requiring significant relative strength.",
    benefits: ["Builds a V-taper back", "Decompresses the spine", "Increases functional strength"],
    steps: [
      "Grab the bar with palms facing away, hands slightly wider than shoulders.",
      "Hang freely with arms fully extended.",
      "Initiate the pull by driving elbows down towards hips.",
      "Pull until your chin clears the bar.",
      "Squeeze back muscles at the top.",
      "Lower slowly to full extension."
    ],
    bpm: 135,
    difficulty: 'Intermediate',
    videoContext: "Watch for the full range of motion. No swinging or kipping is used.",
    equipmentList: ["Pull Up Bar"],
    calories: 12
  },
  { 
    id: 'e5', 
    name: 'Overhead Press', 
    muscle: 'Shoulders', 
    equipment: 'Barbell', 
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop',
    video: VIDEOS.BENCH, // Fallback to bench/press movement
    overview: "The Overhead Press builds vertical pushing power and core stability. It is the gold standard for shoulder strength.",
    benefits: ["Builds deltoid mass", "Improves core stability", "Enhances shoulder mobility"],
    steps: [
      "Set bar at mid-chest height. Grip just outside shoulder width.",
      "Unrack and stand with feet shoulder-width apart.",
      "Brace core and glutes tight.",
      "Press bar vertically, moving head back to clear path.",
      "Push head forward 'through the window' at the top.",
      "Lock out arms, then lower with control."
    ],
    bpm: 130,
    difficulty: 'Intermediate',
    videoContext: "Focus on the bar path being a straight vertical line.",
    equipmentList: ["Barbell", "Rack", "Plates"],
    calories: 40
  },
  { 
    id: 'e6', 
    name: 'Dumbbell Row', 
    muscle: 'Back', 
    equipment: 'Dumbbell', 
    image: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?q=80&w=800&auto=format&fit=crop',
    video: VIDEOS.PULLUP, // Fallback
    overview: "The Dumbbell Row isolates the lats and corrects muscle imbalances by allowing unilateral work.",
    benefits: ["Corrects asymmetry", "Thickens the lats", "Low back friendly"],
    steps: [
      "Place one knee and hand on a flat bench for support.",
      "Keep back flat and parallel to floor.",
      "Hold dumbbell in free hand, arm extended.",
      "Pull dumbbell to hip pocket, keeping elbow close.",
      "Squeeze back muscle at the top.",
      "Lower slowly to full stretch."
    ],
    bpm: 115,
    difficulty: 'Beginner',
    videoContext: "Notice the stretch at the bottom and the elbow drive towards the hip.",
    equipmentList: ["Dumbbell", "Bench"],
    calories: 30
  },
  {
    id: 'yt-test',
    name: 'YouTube Test',
    muscle: 'Test',
    equipment: 'None',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop',
    video: 'https://www.youtube.com/watch?v=wm47Swzn_98',
    overview: 'YouTube test exercise used for automated playback tests. Contains an embedded YouTube link.',
    benefits: ["Test media embedding", "Diagnostics for iframe messaging"],
    steps: ["Open the exercise modal and verify iframe mounts.", "Toggle debug overlay and verify iframeReady or iframeState is reported."],
    bpm: 0,
    difficulty: 'Beginner',
    videoContext: "This entry exists solely for automated playback tests.",
    equipmentList: [],
    calories: 0
  }
];
