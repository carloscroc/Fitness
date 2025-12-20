// Phase 3 Exercise SQL INSERT Statement Generator
import crypto from 'crypto';

// Phase 3 exercises with their data
const phase3Exercises = [
  // Advanced Compound Exercises (8)
  {
    id: 'e_adv_001',
    hash: '776d32cbae4400d54e11423b2e873596',
    name: 'Muscle-up',
    muscle: 'Back',
    equipment: ['Gymnastic Rings'],
    category: 'strength',
    difficulty: 'Advanced',
    bpm: 140,
    calories: 80,
    video: 'https://www.youtube.com/watch?v=pF_j51dq9Bs',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
    overview: 'The Muscle-up is an advanced calisthenics exercise that combines a pull-up with a dip, requiring incredible upper body strength and coordination.',
    benefits: ['Builds extreme upper body strength', 'Improves coordination', 'Develops explosive power', 'Advanced calisthenics skill'],
    steps: [
      'Start hanging from rings with a false grip (thumbs on the outside of the rings).',
      'Perform a powerful pull-up, pulling your chest toward the rings.',
      'As you reach the top of the pull-up, transition your body forward and over the rings.',
      'Keep your elbows tight to your body during the transition.',
      'Once your hips are above the rings, press your body up into a dip position.',
      'Fully extend your arms at the top of the movement.',
      'Lower yourself with control back to the starting position.'
    ]
  },
  {
    id: 'e_adv_002',
    hash: '5947660b744d9203979c2e9580fcb668',
    name: 'Handstand Push-up',
    muscle: 'Shoulders',
    equipment: ['None'],
    category: 'strength',
    difficulty: 'Advanced',
    bpm: 120,
    calories: 60,
    video: 'https://www.youtube.com/watch?v=A6-1w_yuG2g',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
    overview: 'Handstand Push-ups are the bodyweight equivalent of overhead press, building massive shoulder strength and stability.',
    benefits: ['Builds extreme shoulder strength', 'Improves balance', 'Enhances core stability', 'Bodyweight mastery'],
    steps: [
      'Perform a handstand against a wall or in free space.',
      'Keep your core tight and body straight from head to heels.',
      'Lower your body toward the ground by bending your elbows.',
      'Keep your elbows pointed slightly outward, not flaring wide.',
      'Lower until your head lightly touches the ground.',
      'Press through your palms to return to the starting handstand position.',
      'Maintain control throughout the entire movement.'
    ]
  },
  {
    id: 'e_adv_003',
    hash: '9e2aef644eda5900894a09c2b97569d5',
    name: 'Pistol Squat',
    muscle: 'Legs',
    equipment: ['None'],
    category: 'strength',
    difficulty: 'Advanced',
    bpm: 110,
    calories: 70,
    video: 'https://www.youtube.com/watch?v=M1JZyE8_iVQ',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Pistol Squats are a challenging single-leg exercise that builds immense lower body strength, balance, and mobility.',
    benefits: ['Builds single-leg strength', 'Improves balance', 'Enhances flexibility', 'Core stabilization'],
    steps: [
      'Stand on one leg with the other leg extended straight in front.',
      'Extend your arms forward for balance and counterbalance.',
      'Lower yourself down by bending the standing leg.',
      'Keep your heel on the ground and chest lifted.',
      'Lower until your hip is below your knee or as deep as possible.',
      'Press through your heel to return to the standing position.',
      'Maintain control and avoid touching the ground with the extended leg.'
    ]
  },
  {
    id: 'e_adv_004',
    hash: '53213c07c93a1d8f34d3a5784135a340',
    name: 'One-arm Push-up',
    muscle: 'Chest',
    equipment: ['None'],
    category: 'strength',
    difficulty: 'Advanced',
    bpm: 100,
    calories: 50,
    video: 'https://www.youtube.com/watch?v=O_i21_FX2HY',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'One-arm Push-ups develop incredible upper body strength and core stability, serving as a benchmark of advanced calisthenics ability.',
    benefits: ['Builds pressing strength', 'Enhances core stability', 'Improves balance', 'Asymmetrical strength development'],
    steps: [
      'Place one hand on the ground slightly wider than shoulder-width.',
      'Extend your legs wide for stability and balance.',
      'Keep your non-working hand behind your back or along your side.',
      'Lower your body toward the ground while maintaining a straight line.',
      'Keep your core tight and avoid rotating your hips.',
      'Press through the working hand to return to the starting position.',
      'Keep your elbow close to your body during the movement.'
    ]
  },
  {
    id: 'e_adv_005',
    hash: 'db9b9c5dc2ed7f88d84eaa219d6cd4ad',
    name: 'Planche',
    muscle: 'Core',
    equipment: ['None'],
    category: 'strength',
    difficulty: 'Advanced',
    bpm: 80,
    calories: 40,
    video: 'https://www.youtube.com/watch?v=QGn-eRVaCWQ',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
    overview: 'The Planche is an advanced gymnastics hold where the body is held parallel to the ground, requiring incredible upper body and core strength.',
    benefits: ['Extreme core strength', 'Shoulder development', 'Body control', 'Advanced gymnastics skill'],
    steps: [
      'Start in a forward leaning position with hands on the ground.',
      'Lean forward and lift your feet off the ground.',
      'Keep your arms straight and shoulders forward of your hands.',
      'Hold your body parallel to the ground.',
      'Maintain a straight body line from head to heels.',
      'Keep your core engaged and lower back tight.',
      'Hold for as long as possible while maintaining perfect form.'
    ]
  },
  {
    id: 'e_adv_006',
    hash: '6125f8a79be5d5e3566989ed6bed937a',
    name: 'Front Lever',
    muscle: 'Back',
    equipment: ['Pull-up Bar'],
    category: 'strength',
    difficulty: 'Advanced',
    bpm: 90,
    calories: 60,
    video: 'https://www.youtube.com/watch?v=pYrAf76SNUU',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
    overview: 'The Front Lever is an advanced bodyweight exercise that builds incredible back, core, and bicep strength while holding the body horizontal.',
    benefits: ['Builds back strength', 'Core development', 'Body control', 'Advanced calisthenics'],
    steps: [
      'Hang from a pull-up bar with an overhand grip.',
      'Engage your core and pull your shoulders down toward your hips.',
      'Lift your legs and hips until your body is parallel to the ground.',
      'Keep your arms straight and body rigid.',
      'Maintain a straight line from head to heels.',
      'Keep your core engaged and avoid arching your back.',
      'Hold the position with proper form as long as possible.'
    ]
  },
  {
    id: 'e_adv_007',
    hash: 'df40ab7d8d2e2a06376428f80abce37e',
    name: 'Back Lever',
    muscle: 'Back',
    equipment: ['Pull-up Bar'],
    category: 'strength',
    difficulty: 'Advanced',
    bpm: 85,
    calories: 55,
    video: 'https://www.youtube.com/watch?v=kHd93g2bJ40',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
    overview: 'The Back Lever is an advanced calisthenics hold that builds tremendous back, shoulder, and core strength while hanging horizontally.',
    benefits: ['Back strength', 'Shoulder stability', 'Core development', 'Body control'],
    steps: [
      'Hang from a pull-up bar with an underhand or mixed grip.',
      'Swing through and invert your body to face upward.',
      'Lower your body until it\'s parallel to the ground.',
      'Keep your arms straight and body rigid.',
      'Maintain a straight line from head to heels.',
      'Keep your core engaged and glutes squeezed.',
      'Hold the position with perfect form.'
    ]
  },
  {
    id: 'e_adv_008',
    hash: '8c9ec16cd1bb0f4b920477e0369e0ba7',
    name: 'Human Flag',
    muscle: 'Core',
    equipment: ['Pole'],
    category: 'strength',
    difficulty: 'Advanced',
    bpm: 95,
    calories: 65,
    video: 'https://www.youtube.com/watch?v=25t3_oCdA4g',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
    overview: 'The Human Flag is an impressive display of core strength and body control, holding the body horizontal from a vertical pole.',
    benefits: ['Extreme core strength', 'Oblique development', 'Body control', 'Advanced calisthenics skill'],
    steps: [
      'Grip a vertical pole with your hands about shoulder-width apart.',
      'Place your bottom hand with palm facing up, top hand palm facing down.',
      'Jump up and pull your legs toward the pole.',
      'Extend your legs straight out to the side.',
      'Keep your body straight and parallel to the ground.',
      'Engage your core and squeeze your glutes.',
      'Hold the position with perfect form.'
    ]
  },

  // Sport-specific Exercises (7)
  {
    id: 'e_sport_001',
    hash: 'e6e7ecd66318849a5586161e76fdb935',
    name: 'Medicine Ball Slams',
    muscle: 'Full Body',
    equipment: ['Medicine Ball'],
    category: 'strength',
    difficulty: 'Intermediate',
    bpm: 150,
    calories: 90,
    video: 'https://www.youtube.com/watch?v=2PUEkOadn3E',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Medicine Ball Slams are explosive power exercises that develop full-body strength, coordination, and stress release.',
    benefits: ['Power development', 'Full-body conditioning', 'Stress relief', 'Core strength'],
    steps: [
      'Stand with feet shoulder-width apart holding a medicine ball.',
      'Raise the ball overhead while extending onto your toes.',
      'Explosively slam the ball onto the ground in front of you.',
      'Follow through with your arms and body.',
      'Squat down to pick up the ball.',
      'Return to standing position and repeat.',
      'Maintain explosive power throughout the movement.'
    ]
  },
  {
    id: 'e_sport_002',
    hash: '47187774b27a02695800929b933b27cf',
    name: 'Boxing Combinations',
    muscle: 'Cardio',
    equipment: ['Heavy Bag', 'Boxing Gloves'],
    category: 'cardio',
    difficulty: 'Intermediate',
    bpm: 140,
    calories: 100,
    video: 'https://www.youtube.com/watch?v=s99Oki-w2Gk',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Boxing combinations develop cardiovascular endurance, coordination, and upper body strength while teaching striking techniques.',
    benefits: ['Cardio conditioning', 'Coordination', 'Upper body strength', 'Stress relief'],
    steps: [
      'Stand in boxing stance with feet shoulder-width apart.',
      'Guard your face with your hands.',
      'Practice basic combinations: jab, cross, hook, uppercut.',
      'Maintain proper form with each punch.',
      'Keep your core engaged and feet moving.',
      'Breathe out with each exertion.',
      'Mix combinations and maintain rhythm.'
    ]
  },
  {
    id: 'e_sport_003',
    hash: '217befab6b7c60e45ff32d58ad8aa4e0',
    name: 'Kettlebell Ballistic',
    muscle: 'Full Body',
    equipment: ['Kettlebells'],
    category: 'strength',
    difficulty: 'Advanced',
    bpm: 145,
    calories: 110,
    video: 'https://www.youtube.com/watch?v=ys1yB2aD3rA',
    image: 'https://images.unsplash.com/photo-1598673599333-c94a73278a0c?q=80&w=800&auto=format&fit=crop',
    overview: 'Kettlebell Ballistic exercises combine kettlebell swings, cleans, and snatches for explosive full-body power development.',
    benefits: ['Explosive power', 'Full-body conditioning', 'Cardiovascular benefits', 'Functional strength'],
    steps: [
      'Start with kettlebell swings, driving with hips.',
      'Progress to kettlebell cleans, bringing bell to rack position.',
      'Include kettlebell snatches overhead.',
      'Maintain proper hip hinge pattern.',
      'Keep your core engaged throughout.',
      'Focus on explosive hip drive.',
      'Chain movements together for continuous flow.'
    ]
  },
  {
    id: 'e_sport_004',
    hash: 'f0331ce13f465b05515538ab36a86623',
    name: 'Plyometric Push-ups',
    muscle: 'Chest',
    equipment: ['None'],
    category: 'strength',
    difficulty: 'Advanced',
    bpm: 130,
    calories: 70,
    video: 'https://www.youtube.com/watch?v=0JZgA_551-A',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Plyometric Push-ups develop explosive upper body power by incorporating clapping or hand release variations.',
    benefits: ['Explosive power', 'Upper body strength', 'Reaction time', 'Athletic performance'],
    steps: [
      'Start in standard push-up position.',
      'Lower yourself with control.',
      'Explode upward with maximum force.',
      'Clap your hands or release briefly from the ground.',
      'Land with soft elbows to absorb impact.',
      'Immediately begin the next repetition.',
      'Maintain proper form throughout.'
    ]
  },
  {
    id: 'e_sport_005',
    hash: '1dc67a7b24c4d6e1a5a40931e50084fa',
    name: 'Depth Jumps',
    muscle: 'Legs',
    equipment: ['Plyometric Box'],
    category: 'cardio',
    difficulty: 'Advanced',
    bpm: 140,
    calories: 80,
    video: 'https://www.youtube.com/watch?v=t3k1v9gwvH8',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Depth Jumps develop reactive strength and explosive power by training the stretch-shortening cycle of muscles.',
    benefits: ['Explosive power', 'Reactive strength', 'Athletic performance', 'Jump height'],
    steps: [
      'Stand on a box or platform 12-36 inches high.',
      'Step off (don\'t jump) and land on the ground.',
      'Land with bent knees to absorb the impact.',
      'Immediately explode upward upon landing.',
      'Minimize ground contact time.',
      'Jump as high as possible.',
      'Step back onto the box and repeat.'
    ]
  },
  {
    id: 'e_sport_006',
    hash: '81f527a94ae5a482a807c0759e8fe18c',
    name: 'Broad Jumps',
    muscle: 'Legs',
    equipment: ['None'],
    category: 'cardio',
    difficulty: 'Intermediate',
    bpm: 135,
    calories: 75,
    video: 'https://www.youtube.com/watch?v=5v0S5G2hLew',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Broad Jumps develop horizontal explosive power and athletic ability, essential for sports performance.',
    benefits: ['Explosive power', 'Athletic performance', 'Full-body coordination', 'Leg strength'],
    steps: [
      'Start with feet shoulder-width apart.',
      'Lower into a quarter-squat position.',
      'Swing arms back and explode forward.',
      'Jump horizontally as far as possible.',
      'Land softly with bent knees.',
      'Stick the landing and maintain balance.',
      'Reset and repeat for distance or repetitions.'
    ]
  },
  {
    id: 'e_sport_007',
    hash: '58f0b9661efe9c79cc63674f2b44c347',
    name: 'Agility Ladder Drills',
    muscle: 'Cardio',
    equipment: ['Agility Ladder'],
    category: 'cardio',
    difficulty: 'Beginner',
    bpm: 150,
    calories: 85,
    video: 'https://www.youtube.com/watch?v=GpqAqkMFT28',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Agility Ladder Drills improve footwork, coordination, speed, and cognitive processing through various stepping patterns.',
    benefits: ['Footwork', 'Coordination', 'Speed', 'Cognitive function'],
    steps: [
      'Place an agility ladder on a flat surface.',
      'Practice various foot patterns: icky shuffle, in-out, side steps.',
      'Stay on the balls of your feet.',
      'Keep your knees bent and arms pumping.',
      'Start slow and gradually increase speed.',
      'Maintain proper form throughout each pattern.',
      'Focus on quick, precise foot movements.'
    ]
  },

  // Rehabilitation Exercises (7)
  {
    id: 'e_rehab_001',
    hash: '651491de0b3dc6dcb24545672ffaa71c',
    name: 'Clamshells',
    muscle: 'Glutes',
    equipment: ['None'],
    category: 'strength',
    difficulty: 'Beginner',
    bpm: 70,
    calories: 30,
    video: 'https://www.youtube.com/watch?v=9lj_f27r5i8',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Clamshells are a rehabilitation exercise that strengthens the gluteus medius and hip abductors, improving hip stability.',
    benefits: ['Hip stability', 'Glute activation', 'Injury prevention', 'Rehabilitation'],
    steps: [
      'Lie on your side with knees bent and stacked.',
      'Keep your feet together and hips aligned.',
      'Lift your top knee toward the ceiling.',
      'Keep your feet touching and lower body stable.',
      'Pause at the top of the movement.',
      'Lower your knee back to the starting position.',
      'Complete all reps before switching sides.'
    ]
  },
  {
    id: 'e_rehab_002',
    hash: 'f0013142f0416b510a8412369e27b824',
    name: 'Wall Angels',
    muscle: 'Shoulders',
    equipment: ['Wall'],
    category: 'flexibility',
    difficulty: 'Beginner',
    bpm: 75,
    calories: 25,
    video: 'https://www.youtube.com/watch?v=YW-dI7p_LkE',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Wall Angels improve shoulder mobility, thoracic extension, and posture while strengthening the upper back.',
    benefits: ['Shoulder mobility', 'Posture improvement', 'Thoracic extension', 'Upper back strength'],
    steps: [
      'Stand with your back against a wall.',
      'Place your feet 6 inches from the wall.',
      'Keep your head, upper back, and glutes against the wall.',
      'Place your arms in a \'W\' position against the wall.',
      'Slide your arms up the wall while maintaining contact.',
      'Return to the starting position with control.',
      'Keep your core engaged and lower back neutral.'
    ]
  },
  {
    id: 'e_rehab_003',
    hash: '085e81b273bd37662cea46e3a4543ad7',
    name: 'Scapular Retraction',
    muscle: 'Upper Back',
    equipment: ['Resistance Bands'],
    category: 'strength',
    difficulty: 'Beginner',
    bpm: 80,
    calories: 35,
    video: 'https://www.youtube.com/watch?v=wEYi_Jq3XpQ',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Scapular Retraction strengthens the rhomboids and middle trapezius, improving posture and shoulder health.',
    benefits: ['Posture improvement', 'Shoulder health', 'Upper back strength', 'Injury prevention'],
    steps: [
      'Attach a resistance band at chest height.',
      'Hold the band with both hands extended forward.',
      'Pull your shoulder blades together.',
      'Bend your elbows to 90 degrees during the pull.',
      'Squeeze your upper back muscles.',
      'Return to starting position with control.',
      'Focus on the mind-muscle connection.'
    ]
  },
  {
    id: 'e_rehab_004',
    hash: '4ffb7a8804c600b7da7aa429452344ff',
    name: 'Hip Flexor Stretch',
    muscle: 'Hip Flexors',
    equipment: ['Mat'],
    category: 'flexibility',
    difficulty: 'Beginner',
    bpm: 65,
    calories: 20,
    video: 'https://www.youtube.com/watch?v=y0Po2Y2Q0qU',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Hip Flexor Stretch counteracts the effects of prolonged sitting by improving hip mobility and reducing lower back strain.',
    benefits: ['Hip mobility', 'Lower back relief', 'Improved posture', 'Flexibility'],
    steps: [
      'Kneel on one knee with the other foot forward.',
      'Keep your torso upright and core engaged.',
      'Shift your weight forward slightly.',
      'You should feel a stretch in the front of the hip.',
      'Raise your arms overhead for a deeper stretch.',
      'Hold the stretch for 30-60 seconds.',
      'Switch sides and repeat.'
    ]
  },
  {
    id: 'e_rehab_005',
    hash: 'c9ef7171af35f4fee2d85816b2eafbd6',
    name: 'Glute Activation Exercises',
    muscle: 'Glutes',
    equipment: ['Resistance Bands'],
    category: 'strength',
    difficulty: 'Beginner',
    bpm: 80,
    calories: 40,
    video: 'https://www.youtube.com/watch?v=4n-OCwz0IwE',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Glute activation exercises wake up the gluteal muscles, improving hip function and reducing lower back stress.',
    benefits: ['Glute activation', 'Hip function', 'Injury prevention', 'Lower back health'],
    steps: [
      'Place a resistance band around your thighs.',
      'Perform side-lying clamshells.',
      'Do glute bridges with band abduction.',
      'Include lateral band walks.',
      'Perform standing hip abductions.',
      'Focus on mind-muscle connection.',
      'Complete all exercises with proper form.'
    ]
  },
  {
    id: 'e_rehab_006',
    hash: 'e044429f03698f9f6d5bc4062487c9ba',
    name: 'Rotator Cuff Exercises',
    muscle: 'Shoulders',
    equipment: ['Resistance Bands'],
    category: 'strength',
    difficulty: 'Beginner',
    bpm: 75,
    calories: 35,
    video: 'https://www.youtube.com/watch?v=s6mEv1kB_1I',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Rotator Cuff Exercises strengthen the small muscles that stabilize the shoulder joint, preventing injuries and improving function.',
    benefits: ['Shoulder stability', 'Injury prevention', 'Joint health', 'Improved function'],
    steps: [
      'Use light resistance bands for these exercises.',
      'Perform external rotation: arm at 90 degrees, rotate outward.',
      'Do internal rotation: opposite direction movement.',
      'Include empty can exercises: arm at 45-degree angle.',
      'Perform straight arm raises in thumbs-up position.',
      'Use light weight and high repetitions.',
      'Focus on controlled movements.'
    ]
  },
  {
    id: 'e_rehab_007',
    hash: '6d416d6298acd679912eb5c8a363fb8b',
    name: 'Ankle Mobility',
    muscle: 'Ankles',
    equipment: ['None'],
    category: 'flexibility',
    difficulty: 'Beginner',
    bpm: 70,
    calories: 25,
    video: 'https://www.youtube.com/watch?v=7eYbA07G_e8',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Ankle Mobility exercises improve range of motion in the ankle joint, enhancing squat depth and reducing injury risk.',
    benefits: ['Ankle mobility', 'Squat depth', 'Injury prevention', 'Movement quality'],
    steps: [
      'Stand facing a wall with one foot forward.',
      'Place your hands on the wall for support.',
      'Lift your heel and drive your knee forward.',
      'Keep your heel on the ground as much as possible.',
      'Rock back and return to starting position.',
      'Perform ankle circles in both directions.',
      'Repeat on both ankles for multiple reps.'
    ]
  },

  // Chest & Arms Variations (6)
  {
    id: 'e_ca_001',
    hash: 'c4c16d82de9015aff7378fac21e9b0fb',
    name: 'Incline Push-ups',
    muscle: 'Chest',
    equipment: ['Bench'],
    category: 'strength',
    difficulty: 'Beginner',
    bpm: 90,
    calories: 45,
    video: 'https://www.youtube.com/watch?v=L3pAa1GfXkQ',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Incline Push-ups target the upper chest while being easier than standard push-ups, making them great for building strength.',
    benefits: ['Upper chest development', 'Progressive difficulty', 'Shoulder stability', 'Functional strength'],
    steps: [
      'Place hands on a bench or elevated surface.',
      'Assume push-up position with body straight.',
      'Lower your chest toward the bench.',
      'Keep your elbows at a 45-degree angle.',
      'Press up to starting position.',
      'Maintain a straight line from head to heels.',
      'Control the movement throughout.'
    ]
  },
  {
    id: 'e_ca_002',
    hash: '7d64f9c7f79747a0d275db541517bbe9',
    name: 'Decline Push-ups',
    muscle: 'Chest',
    equipment: ['Bench'],
    category: 'strength',
    difficulty: 'Intermediate',
    bpm: 100,
    calories: 55,
    video: 'https://www.youtube.com/watch?v=1P82g__P3rM',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Decline Push-ups emphasize the lower chest and increase the difficulty of standard push-ups through elevation.',
    benefits: ['Lower chest development', 'Increased difficulty', 'Shoulder stability', 'Upper body strength'],
    steps: [
      'Place your feet on a bench or elevated surface.',
      'Assume push-up position with hands on floor.',
      'Lower your chest toward the ground.',
      'Keep your core tight and hips from sagging.',
      'Press up to starting position.',
      'Maintain control throughout the movement.',
      'Avoid excessive arching in the lower back.'
    ]
  },
  {
    id: 'e_ca_003',
    hash: '1e928503447b4661b742f75c5e12b8b7',
    name: 'Diamond Push-ups',
    muscle: 'Triceps',
    equipment: ['None'],
    category: 'strength',
    difficulty: 'Intermediate',
    bpm: 95,
    calories: 50,
    video: 'https://www.youtube.com/watch?v=jAP38Fz0d8E',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Diamond Push-ups emphasize the triceps and inner chest, creating the distinctive diamond shape with hand positioning.',
    benefits: ['Triceps development', 'Inner chest', 'Arm strength', 'Bodyweight exercise'],
    steps: [
      'Form a diamond shape with thumbs and index fingers.',
      'Assume push-up position over the diamond.',
      'Lower your chest to your hands.',
      'Keep your elbows close to your body.',
      'Press up to starting position.',
      'Maintain control throughout the movement.',
      'Focus on triceps contraction.'
    ]
  },
  {
    id: 'e_ca_004',
    hash: '430f512d4f8607702cd1b52bcd90db0f',
    name: 'Skull Crushers',
    muscle: 'Triceps',
    equipment: ['EZ Bar', 'Bench'],
    category: 'strength',
    difficulty: 'Intermediate',
    bpm: 85,
    calories: 40,
    video: 'https://www.youtube.com/watch?v=zMQX5h8xsfk',
    image: 'https://images.unsplash.com/photo-1598673599333-c94a73278a0c?q=80&w=800&auto=format&fit=crop',
    overview: 'Skull Crushers isolate the triceps through elbow extension while lying down, allowing for focused arm development.',
    benefits: ['Triceps isolation', 'Arm development', 'Strength building', 'Mass building'],
    steps: [
      'Lie on a bench holding an EZ bar above your chest.',
      'Keep your upper arms perpendicular to the floor.',
      'Lower the bar toward your forehead by bending elbows.',
      'Keep your upper arms stationary throughout.',
      'Pause just above your forehead.',
      'Extend your arms to return to starting position.',
      'Focus on triceps contraction.'
    ]
  },
  {
    id: 'e_ca_005',
    hash: 'b59ef61348680237728f81e17d1a7a43',
    name: 'Concentration Curls',
    muscle: 'Biceps',
    equipment: ['Dumbbell', 'Bench'],
    category: 'strength',
    difficulty: 'Beginner',
    bpm: 80,
    calories: 35,
    video: 'https://www.youtube.com/watch?v=vBkO4q2r_sA',
    image: 'https://images.unsplash.com/photo-1598673599333-c94a73278a0c?q=80&w=800&auto=format&fit=crop',
    overview: 'Concentration Curls isolate the biceps by eliminating momentum and body swing, maximizing muscle activation.',
    benefits: ['Biceps isolation', 'Peak contraction', 'Mind-muscle connection', 'Arm development'],
    steps: [
      'Sit on a bench with legs spread.',
      'Hold a dumbbell with palm facing up.',
      'Rest your elbow against your inner thigh.',
      'Curl the weight toward your shoulder.',
      'Squeeze at the top of the movement.',
      'Lower with control to starting position.',
      'Focus on biceps contraction throughout.'
    ]
  },
  {
    id: 'e_ca_006',
    hash: 'c2edeeee288570afcc3c0f1a35abd1b1',
    name: 'Hammer Curls',
    muscle: 'Biceps',
    equipment: ['Dumbbells'],
    category: 'strength',
    difficulty: 'Beginner',
    bpm: 85,
    calories: 40,
    video: 'https://www.youtube.com/watch?v=zWJFAhro5m4',
    image: 'https://images.unsplash.com/photo-1598673599333-c94a73278a0c?q=80&w=800&auto=format&fit=crop',
    overview: 'Hammer Curls target the biceps and brachialis using a neutral grip, building overall arm thickness and strength.',
    benefits: ['Biceps development', 'Brachialis training', 'Grip strength', 'Arm thickness'],
    steps: [
      'Hold dumbbells with palms facing each other.',
      'Stand with feet shoulder-width apart.',
      'Curl both dumbbells toward your shoulders.',
      'Keep your palms facing each other throughout.',
      'Maintain good posture and avoid swinging.',
      'Squeeze at the top of the movement.',
      'Lower with control to starting position.'
    ]
  },

  // Additional Advanced & Specialized Exercises (7)
  {
    id: 'e_spec_001',
    hash: '5ebfbe58bf782ffae8153164b581a602',
    name: 'Box Jumps',
    muscle: 'Legs',
    equipment: ['Plyometric Box'],
    category: 'cardio',
    difficulty: 'Intermediate',
    bpm: 140,
    calories: 75,
    video: 'https://www.youtube.com/watch?v=V0oDunF_T3w',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    overview: 'Box Jumps develop explosive leg power and athletic ability by jumping onto elevated platforms.',
    benefits: ['Explosive power', 'Athletic performance', 'Leg strength', 'Coordination'],
    steps: [
      'Stand in front of a sturdy box or platform.',
      'Lower into a quarter-squat position.',
      'Swing arms back and explode upward.',
      'Jump onto the box, landing softly.',
      'Stand up fully on the box.',
      'Step down (don\'t jump) and reset.',
      'Repeat for desired repetitions.'
    ]
  },
  {
    id: 'e_spec_002',
    hash: '2cbfc5bc716b45a47e093c7fc8dde8a4',
    name: 'Turkish Get-up',
    muscle: 'Full Body',
    equipment: ['Kettlebells'],
    category: 'strength',
    difficulty: 'Advanced',
    bpm: 110,
    calories: 85,
    video: 'https://www.youtube.com/watch?v=GJhTmQ-uPhk',
    image: 'https://images.unsplash.com/photo-1598673599333-c94a73278a0c?q=80&w=800&auto=format&fit=crop',
    overview: 'The Turkish Get-up is a full-body exercise that develops strength, stability, and mobility through a complex movement pattern.',
    benefits: ['Full-body strength', 'Core stability', 'Mobility', 'Coordination'],
    steps: [
      'Lie on your back holding a kettlebell overhead.',
      'Bend one knee and place opposite foot on ground.',
      'Press up to your elbow, then to your hand.',
      'Bridge your hips and sweep your leg through.',
      'Lift your hips to create space.',
      'Stand up while keeping the weight overhead.',
      'Reverse the movement to return to starting position.'
    ]
  },
  {
    id: 'e_spec_003',
    hash: '00e036b2cbb28ea01a77dd1c93262b14',
    name: 'Single-leg Romanian Deadlift',
    muscle: 'Hamstrings',
    equipment: ['Dumbbell'],
    category: 'strength',
    difficulty: 'Intermediate',
    bpm: 100,
    calories: 60,
    video: 'https://www.youtube.com/watch?v=QYc1B1v93lY',
    image: 'https://images.unsplash.com/photo-1598673599333-c94a73278a0c?q=80&w=800&auto=format&fit=crop',
    overview: 'Single-leg Romanian Deadlifts build hamstring and glute strength while improving balance and stability.',
    benefits: ['Hamstring strength', 'Balance', 'Glute development', 'Stability'],
    steps: [
      'Stand holding a dumbbell in one hand.',
      'Shift your weight to the opposite leg.',
      'Hinge at your hips while extending the free leg back.',
      'Lower the dumbbell toward the ground.',
      'Keep your back straight and core tight.',
      'Lower until your torso is nearly parallel to ground.',
      'Return to standing by squeezing your glutes.'
    ]
  },
  {
    id: 'e_spec_004',
    hash: 'e185f8b7609ad5d42e08dc380e183fe8',
    name: 'L-sit',
    muscle: 'Core',
    equipment: ['Parallel Bars or Floor'],
    category: 'strength',
    difficulty: 'Advanced',
    bpm: 80,
    calories: 45,
    video: 'https://www.youtube.com/watch?v=QaH-kRm_xOU',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
    overview: 'The L-sit is an advanced core exercise that builds tremendous abdominal and hip flexor strength while holding the body in an L shape.',
    benefits: ['Core strength', 'Hip flexor strength', 'Shoulder stability', 'Body control'],
    steps: [
      'Sit on the floor with legs extended forward.',
      'Place hands by your hips with fingers pointing forward.',
      'Press through your palms to lift your hips off ground.',
      'Keep your legs straight and parallel to ground.',
      'Hold your body in an L shape.',
      'Keep your core engaged and shoulders down.',
      'Hold for as long as possible with good form.'
    ]
  },
  {
    id: 'e_spec_005',
    hash: 'a6bb2979a6128862ad93ba6421d75e50',
    name: 'Bulgarian Split Squat',
    muscle: 'Legs',
    equipment: ['Dumbbells', 'Bench'],
    category: 'strength',
    difficulty: 'Intermediate',
    bpm: 110,
    calories: 70,
    video: 'https://www.youtube.com/watch?v=1sh14-P5nkE',
    image: 'https://images.unsplash.com/photo-1598673599333-c94a73278a0c?q=80&w=800&auto=format&fit=crop',
    overview: 'Bulgarian Split Squats are a challenging single-leg exercise that builds strength, balance, and muscle definition.',
    benefits: ['Leg strength', 'Balance', 'Glute development', 'Single-leg stability'],
    steps: [
      'Place one foot on a bench behind you.',
      'Hold dumbbells at your sides.',
      'Lower into a lunge by bending front knee.',
      'Keep your torso upright and core tight.',
      'Lower until your back knee nearly touches ground.',
      'Press through front heel to return to start.',
      'Complete all reps before switching sides.'
    ]
  },
  {
    id: 'e_spec_006',
    hash: 'c0c8e94edfd6723b0a368df9fa31b7d2',
    name: 'Face Pulls',
    muscle: 'Shoulders',
    equipment: ['Cable Machine'],
    category: 'strength',
    difficulty: 'Intermediate',
    bpm: 90,
    calories: 40,
    video: 'https://www.youtube.com/watch?v=8sDeMRIf9bE',
    image: 'https://images.unsplash.com/photo-1598673599333-c94a73278a0c?q=80&w=800&auto=format&fit=crop',
    overview: 'Face Pulls strengthen the rear delts and upper back, improving posture and shoulder health.',
    benefits: ['Rear delt development', 'Posture improvement', 'Shoulder health', 'Upper back strength'],
    steps: [
      'Set cable pulley at chest height with rope attachment.',
      'Grasp rope with palms facing each other.',
      'Step back and assume athletic stance.',
      'Pull the rope toward your face.',
      'Separate hands at the end of movement.',
      'Squeeze your shoulder blades together.',
      'Control the return to starting position.'
    ]
  },
  {
    id: 'e_spec_007',
    hash: 'f6484a0b12d719f5ff490924ffdfecb2',
    name: 'Cable Crunch',
    muscle: 'Abs',
    equipment: ['Cable Machine', 'Mat'],
    category: 'strength',
    difficulty: 'Intermediate',
    bpm: 95,
    calories: 45,
    video: 'https://www.youtube.com/watch?v=5V8F4Y2K7WA',
    image: 'https://images.unsplash.com/photo-1598673599333-c94a73278a0c?q=80&w=800&auto=format&fit=crop',
    overview: 'Cable Crunches provide progressive resistance for abdominal training, allowing for overload beyond bodyweight exercises.',
    benefits: ['Abdominal strength', 'Progressive overload', 'Core development', 'Muscle definition'],
    steps: [
      'Attach rope handle to high pulley.',
      'Kneel facing away from cable machine.',
      'Hold rope by your head or shoulders.',
      'Crunch forward by contracting abs.',
      'Round your back and bring elbows to knees.',
      'Squeeze abs at the bottom of movement.',
      'Control the return to starting position.'
    ]
  }
];

// Function to generate SQL INSERT statement for a single exercise
function generateInsertSQL(exercise) {
  const metadata = {
    secondary_muscles: [],
    phase: 3,
    exercise_category: exercise.muscle === 'Full Body' ? 'full-body' : 'strength'
  };

  // Escape single quotes and format for PostgreSQL
  const escapeString = (str) => str.replace(/'/g, "''");

  // Format equipment array
  const equipmentArray = `ARRAY[${exercise.equipment.map(eq => `'${escapeString(eq.toLowerCase())}'`).join(', ')}]::text[]`;

  // Format benefits array
  const benefitsArray = `ARRAY[${exercise.benefits.map(b => `'${escapeString(b)}'`).join(', ')}]::text[]`;

  // Format steps as JSON array
  const stepsJSON = `'[${exercise.steps.map(step => escapeString(step)).join("', '")}]'`;

  return `INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  '${exercise.hash}',
  '${escapeString(exercise.name)}',
  '${exercise.category}',
  '${exercise.muscle}',
  ARRAY[]::text[],
  ${equipmentArray},
  '${escapeString(exercise.overview)}',
  ${stepsJSON}::jsonb,
  ${benefitsArray},
  '${exercise.video}',
  '${exercise.image}',
  '${exercise.difficulty}',
  ${exercise.bpm},
  ${exercise.calories},
  '${JSON.stringify(metadata)}'::jsonb,
  now(),
  now()
) ON CONFLICT (library_id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  equipment = EXCLUDED.equipment,
  overview = EXCLUDED.overview,
  instructions = EXCLUDED.instructions,
  benefits = EXCLUDED.benefits,
  video_url = EXCLUDED.video_url,
  image_url = EXCLUDED.image_url,
  difficulty = EXCLUDED.difficulty,
  bpm = EXCLUDED.bpm,
  calories = EXCLUDED.calories,
  metadata = EXCLUDED.metadata,
  updated_at = now();`;
}

console.log('-- Phase 3 Exercises SQL INSERT Statements');
console.log('===============================================\n');

// Generate all SQL INSERT statements
phase3Exercises.forEach((exercise, index) => {
  console.log(`-- ${exercise.name}`);
  console.log(generateInsertSQL(exercise));
  console.log('');
});

console.log('-- Total Phase 3 exercises:', phase3Exercises.length);
console.log('');
console.log('-- Summary:');
console.log('- Advanced Compound Exercises: 8');
console.log('- Sport-specific Exercises: 7');
console.log('- Rehabilitation Exercises: 7');
console.log('- Chest & Arms Variations: 6');
console.log('- Additional Advanced Exercises: 7');
console.log('- Total: 35 exercises');