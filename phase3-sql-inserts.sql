-- Phase 3 Exercises SQL INSERT Statements
-- Advanced & Specialized Exercises (35 exercises)
-- Generated on: 2025-12-20

-- Muscle-up
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  '776d32cbae4400d54e11423b2e873596',
  'Muscle-up',
  'strength',
  'Back',
  ARRAY[]::text[],
  ARRAY['gymnastic rings']::text[],
  'The Muscle-up is an advanced calisthenics exercise that combines a pull-up with a dip, requiring incredible upper body strength and coordination.',
  '[Start hanging from rings with a false grip (thumbs on the outside of the rings).', 'Perform a powerful pull-up, pulling your chest toward the rings.', 'As you reach the top of the pull-up, transition your body forward and over the rings.', 'Keep your elbows tight to your body during the transition.', 'Once your hips are above the rings, press your body up into a dip position.', 'Fully extend your arms at the top of the movement.', 'Lower yourself with control back to the starting position.]'::jsonb,
  ARRAY['Builds extreme upper body strength', 'Improves coordination', 'Develops explosive power', 'Advanced calisthenics skill']::text[],
  'https://www.youtube.com/watch?v=pF_j51dq9Bs',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
  'Advanced',
  140,
  80,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Handstand Push-up
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  '5947660b744d9203979c2e9580fcb668',
  'Handstand Push-up',
  'strength',
  'Shoulders',
  ARRAY[]::text[],
  ARRAY['none']::text[],
  'Handstand Push-ups are the bodyweight equivalent of overhead press, building massive shoulder strength and stability.',
  '[Perform a handstand against a wall or in free space.', 'Keep your core tight and body straight from head to heels.', 'Lower your body toward the ground by bending your elbows.', 'Keep your elbows pointed slightly outward, not flaring wide.', 'Lower until your head lightly touches the ground.', 'Press through your palms to return to the starting handstand position.', 'Maintain control throughout the entire movement.]'::jsonb,
  ARRAY['Builds extreme shoulder strength', 'Improves balance', 'Enhances core stability', 'Bodyweight mastery']::text[],
  'https://www.youtube.com/watch?v=A6-1w_yuG2g',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
  'Advanced',
  120,
  60,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Pistol Squat
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  '9e2aef644eda5900894a09c2b97569d5',
  'Pistol Squat',
  'strength',
  'Legs',
  ARRAY[]::text[],
  ARRAY['none']::text[],
  'Pistol Squats are a challenging single-leg exercise that builds immense lower body strength, balance, and mobility.',
  '[Stand on one leg with the other leg extended straight in front.', 'Extend your arms forward for balance and counterbalance.', 'Lower yourself down by bending the standing leg.', 'Keep your heel on the ground and chest lifted.', 'Lower until your hip is below your knee or as deep as possible.', 'Press through your heel to return to the standing position.', 'Maintain control and avoid touching the ground with the extended leg.]'::jsonb,
  ARRAY['Builds single-leg strength', 'Improves balance', 'Enhances flexibility', 'Core stabilization']::text[],
  'https://www.youtube.com/watch?v=M1JZyE8_iVQ',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Advanced',
  110,
  70,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- One-arm Push-up
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  '53213c07c93a1d8f34d3a5784135a340',
  'One-arm Push-up',
  'strength',
  'Chest',
  ARRAY[]::text[],
  ARRAY['none']::text[],
  'One-arm Push-ups develop incredible upper body strength and core stability, serving as a benchmark of advanced calisthenics ability.',
  '[Place one hand on the ground slightly wider than shoulder-width.', 'Extend your legs wide for stability and balance.', 'Keep your non-working hand behind your back or along your side.', 'Lower your body toward the ground while maintaining a straight line.', 'Keep your core tight and avoid rotating your hips.', 'Press through the working hand to return to the starting position.', 'Keep your elbow close to your body during the movement.]'::jsonb,
  ARRAY['Builds pressing strength', 'Enhances core stability', 'Improves balance', 'Asymmetrical strength development']::text[],
  'https://www.youtube.com/watch?v=O_i21_FX2HY',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Advanced',
  100,
  50,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Planche
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'db9b9c5dc2ed7f88d84eaa219d6cd4ad',
  'Planche',
  'strength',
  'Core',
  ARRAY[]::text[],
  ARRAY['none']::text[],
  'The Planche is an advanced gymnastics hold where the body is held parallel to the ground, requiring incredible upper body and core strength.',
  '[Start in a forward leaning position with hands on the ground.', 'Lean forward and lift your feet off the ground.', 'Keep your arms straight and shoulders forward of your hands.', 'Hold your body parallel to the ground.', 'Maintain a straight body line from head to heels.', 'Keep your core engaged and lower back tight.', 'Hold for as long as possible while maintaining perfect form.]'::jsonb,
  ARRAY['Extreme core strength', 'Shoulder development', 'Body control', 'Advanced gymnastics skill']::text[],
  'https://www.youtube.com/watch?v=QGn-eRVaCWQ',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
  'Advanced',
  80,
  40,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Front Lever
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  '6125f8a79be5d5e3566989ed6bed937a',
  'Front Lever',
  'strength',
  'Back',
  ARRAY[]::text[],
  ARRAY['pull-up bar']::text[],
  'The Front Lever is an advanced bodyweight exercise that builds incredible back, core, and bicep strength while holding the body horizontal.',
  '[Hang from a pull-up bar with an overhand grip.', 'Engage your core and pull your shoulders down toward your hips.', 'Lift your legs and hips until your body is parallel to the ground.', 'Keep your arms straight and body rigid.', 'Maintain a straight line from head to heels.', 'Keep your core engaged and avoid arching your back.', 'Hold the position with proper form as long as possible.]'::jsonb,
  ARRAY['Builds back strength', 'Core development', 'Body control', 'Advanced calisthenics']::text[],
  'https://www.youtube.com/watch?v=pYrAf76SNUU',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
  'Advanced',
  90,
  60,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Back Lever
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'df40ab7d8d2e2a06376428f80abce37e',
  'Back Lever',
  'strength',
  'Back',
  ARRAY[]::text[],
  ARRAY['pull-up bar']::text[],
  'The Back Lever is an advanced calisthenics hold that builds tremendous back, shoulder, and core strength while hanging horizontally.',
  '[Hang from a pull-up bar with an underhand or mixed grip.', 'Swing through and invert your body to face upward.', 'Lower your body until it''s parallel to the ground.', 'Keep your arms straight and body rigid.', 'Maintain a straight line from head to heels.', 'Keep your core engaged and glutes squeezed.', 'Hold the position with perfect form.]'::jsonb,
  ARRAY['Back strength', 'Shoulder stability', 'Core development', 'Body control']::text[],
  'https://www.youtube.com/watch?v=kHd93g2bJ40',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
  'Advanced',
  85,
  55,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Human Flag
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  '8c9ec16cd1bb0f4b920477e0369e0ba7',
  'Human Flag',
  'strength',
  'Core',
  ARRAY[]::text[],
  ARRAY['pole']::text[],
  'The Human Flag is an impressive display of core strength and body control, holding the body horizontal from a vertical pole.',
  '[Grip a vertical pole with your hands about shoulder-width apart.', 'Place your bottom hand with palm facing up, top hand palm facing down.', 'Jump up and pull your legs toward the pole.', 'Extend your legs straight out to the side.', 'Keep your body straight and parallel to the ground.', 'Engage your core and squeeze your glutes.', 'Hold the position with perfect form.]'::jsonb,
  ARRAY['Extreme core strength', 'Oblique development', 'Body control', 'Advanced calisthenics skill']::text[],
  'https://www.youtube.com/watch?v=25t3_oCdA4g',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
  'Advanced',
  95,
  65,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Medicine Ball Slams
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'e6e7ecd66318849a5586161e76fdb935',
  'Medicine Ball Slams',
  'strength',
  'Full Body',
  ARRAY[]::text[],
  ARRAY['medicine ball']::text[],
  'Medicine Ball Slams are explosive power exercises that develop full-body strength, coordination, and stress release.',
  '[Stand with feet shoulder-width apart holding a medicine ball.', 'Raise the ball overhead while extending onto your toes.', 'Explosively slam the ball onto the ground in front of you.', 'Follow through with your arms and body.', 'Squat down to pick up the ball.', 'Return to standing position and repeat.', 'Maintain explosive power throughout the movement.]'::jsonb,
  ARRAY['Power development', 'Full-body conditioning', 'Stress relief', 'Core strength']::text[],
  'https://www.youtube.com/watch?v=2PUEkOadn3E',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Intermediate',
  150,
  90,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"full-body"}'::jsonb,
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
  updated_at = now();

-- Boxing Combinations
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  '47187774b27a02695800929b933b27cf',
  'Boxing Combinations',
  'cardio',
  'Cardio',
  ARRAY[]::text[],
  ARRAY['heavy bag', 'boxing gloves']::text[],
  'Boxing combinations develop cardiovascular endurance, coordination, and upper body strength while teaching striking techniques.',
  '[Stand in boxing stance with feet shoulder-width apart.', 'Guard your face with your hands.', 'Practice basic combinations: jab, cross, hook, uppercut.', 'Maintain proper form with each punch.', 'Keep your core engaged and feet moving.', 'Breathe out with each exertion.', 'Mix combinations and maintain rhythm.]'::jsonb,
  ARRAY['Cardio conditioning', 'Coordination', 'Upper body strength', 'Stress relief']::text[],
  'https://www.youtube.com/watch?v=s99Oki-w2Gk',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Intermediate',
  140,
  100,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Kettlebell Ballistic
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  '217befab6b7c60e45ff32d58ad8aa4e0',
  'Kettlebell Ballistic',
  'strength',
  'Full Body',
  ARRAY[]::text[],
  ARRAY['kettlebells']::text[],
  'Kettlebell Ballistic exercises combine kettlebell swings, cleans, and snatches for explosive full-body power development.',
  '[Start with kettlebell swings, driving with hips.', 'Progress to kettlebell cleans, bringing bell to rack position.', 'Include kettlebell snatches overhead.', 'Maintain proper hip hinge pattern.', 'Keep your core engaged throughout.', 'Focus on explosive hip drive.', 'Chain movements together for continuous flow.]'::jsonb,
  ARRAY['Explosive power', 'Full-body conditioning', 'Cardiovascular benefits', 'Functional strength']::text[],
  'https://www.youtube.com/watch?v=ys1yB2aD3rA',
  'https://images.unsplash.com/photo-1598673599333-c94a73278a0c?q=80&w=800&auto=format&fit=crop',
  'Advanced',
  145,
  110,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"full-body"}'::jsonb,
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
  updated_at = now();

-- Plyometric Push-ups
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'f0331ce13f465b05515538ab36a86623',
  'Plyometric Push-ups',
  'strength',
  'Chest',
  ARRAY[]::text[],
  ARRAY['none']::text[],
  'Plyometric Push-ups develop explosive upper body power by incorporating clapping or hand release variations.',
  '[Start in standard push-up position.', 'Lower yourself with control.', 'Explode upward with maximum force.', 'Clap your hands or release briefly from the ground.', 'Land with soft elbows to absorb impact.', 'Immediately begin the next repetition.', 'Maintain proper form throughout.]'::jsonb,
  ARRAY['Explosive power', 'Upper body strength', 'Reaction time', 'Athletic performance']::text[],
  'https://www.youtube.com/watch?v=0JZgA_551-A',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Advanced',
  130,
  70,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Depth Jumps
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  '1dc67a7b24c4d6e1a5a40931e50084fa',
  'Depth Jumps',
  'cardio',
  'Legs',
  ARRAY[]::text[],
  ARRAY['plyometric box']::text[],
  'Depth Jumps develop reactive strength and explosive power by training the stretch-shortening cycle of muscles.',
  '[Stand on a box or platform 12-36 inches high.', 'Step off (don''t jump) and land on the ground.', 'Land with bent knees to absorb the impact.', 'Immediately explode upward upon landing.', 'Minimize ground contact time.', 'Jump as high as possible.', 'Step back onto the box and repeat.]'::jsonb,
  ARRAY['Explosive power', 'Reactive strength', 'Athletic performance', 'Jump height']::text[],
  'https://www.youtube.com/watch?v=t3k1v9gwvH8',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Advanced',
  140,
  80,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Broad Jumps
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  '81f527a94ae5a482a807c0759e8fe18c',
  'Broad Jumps',
  'cardio',
  'Legs',
  ARRAY[]::text[],
  ARRAY['none']::text[],
  'Broad Jumps develop horizontal explosive power and athletic ability, essential for sports performance.',
  '[Start with feet shoulder-width apart.', 'Lower into a quarter-squat position.', 'Swing arms back and explode forward.', 'Jump horizontally as far as possible.', 'Land softly with bent knees.', 'Stick the landing and maintain balance.', 'Reset and repeat for distance or repetitions.]'::jsonb,
  ARRAY['Explosive power', 'Athletic performance', 'Full-body coordination', 'Leg strength']::text[],
  'https://www.youtube.com/watch?v=5v0S5G2hLew',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Intermediate',
  135,
  75,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Agility Ladder Drills
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  '58f0b9661efe9c79cc63674f2b44c347',
  'Agility Ladder Drills',
  'cardio',
  'Cardio',
  ARRAY[]::text[],
  ARRAY['agility ladder']::text[],
  'Agility Ladder Drills improve footwork, coordination, speed, and cognitive processing through various stepping patterns.',
  '[Place an agility ladder on a flat surface.', 'Practice various foot patterns: icky shuffle, in-out, side steps.', 'Stay on the balls of your feet.', 'Keep your knees bent and arms pumping.', 'Start slow and gradually increase speed.', 'Maintain proper form throughout each pattern.', 'Focus on quick, precise foot movements.]'::jsonb,
  ARRAY['Footwork', 'Coordination', 'Speed', 'Cognitive function']::text[],
  'https://www.youtube.com/watch?v=GpqAqkMFT28',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Beginner',
  150,
  85,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Clamshells
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  '651491de0b3dc6dcb24545672ffaa71c',
  'Clamshells',
  'strength',
  'Glutes',
  ARRAY[]::text[],
  ARRAY['none']::text[],
  'Clamshells are a rehabilitation exercise that strengthens the gluteus medius and hip abductors, improving hip stability.',
  '[Lie on your side with knees bent and stacked.', 'Keep your feet together and hips aligned.', 'Lift your top knee toward the ceiling.', 'Keep your feet touching and lower body stable.', 'Pause at the top of the movement.', 'Lower your knee back to the starting position.', 'Complete all reps before switching sides.]'::jsonb,
  ARRAY['Hip stability', 'Glute activation', 'Injury prevention', 'Rehabilitation']::text[],
  'https://www.youtube.com/watch?v=9lj_f27r5i8',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Beginner',
  70,
  30,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Wall Angels
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'f0013142f0416b510a8412369e27b824',
  'Wall Angels',
  'flexibility',
  'Shoulders',
  ARRAY[]::text[],
  ARRAY['wall']::text[],
  'Wall Angels improve shoulder mobility, thoracic extension, and posture while strengthening the upper back.',
  '[Stand with your back against a wall.', 'Place your feet 6 inches from the wall.', 'Keep your head, upper back, and glutes against the wall.', 'Place your arms in a ''W'' position against the wall.', 'Slide your arms up the wall while maintaining contact.', 'Return to the starting position with control.', 'Keep your core engaged and lower back neutral.]'::jsonb,
  ARRAY['Shoulder mobility', 'Posture improvement', 'Thoracic extension', 'Upper back strength']::text[],
  'https://www.youtube.com/watch?v=YW-dI7p_LkE',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Beginner',
  75,
  25,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"flexibility"}'::jsonb,
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
  updated_at = now();

-- Scapular Retraction
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'b8c8e5c3c9f1f9d2e2b3c4d5e6f7a8b9',
  'Scapular Retraction',
  'strength',
  'Upper Back',
  ARRAY[]::text[],
  ARRAY['resistance bands']::text[],
  'Scapular Retraction exercises strengthen the rhomboids and mid-trapezius, improving posture and shoulder health.',
  '[Hold a resistance band with both hands.', 'Extend your arms in front of you at shoulder height.', 'Pull your shoulder blades together by squeezing your upper back.', 'Keep your arms straight and shoulders down.', 'Hold the contraction briefly.', 'Release with control.', 'Maintain proper form throughout the movement.]'::jsonb,
  ARRAY['Upper back strength', 'Posture improvement', 'Shoulder health', 'Scapular stability']::text[],
  'https://www.youtube.com/watch?v=wEYi_Jq3XpQ',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Beginner',
  65,
  20,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Hip Flexor Stretch
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'c9d9e6d4d0e0f1e2e3f4f5f6f7f8f9f0',
  'Hip Flexor Stretch',
  'flexibility',
  'Hip Flexors',
  ARRAY[]::text[],
  ARRAY['mat']::text[],
  'Hip Flexor Stretch alleviates tightness from prolonged sitting, improving mobility and reducing lower back pain.',
  '[Kneel on one knee with the other foot forward.', 'Keep your torso upright and core engaged.', 'Gently push your hips forward.', 'Feel the stretch in the hip flexor of the kneeling leg.', 'Hold for 20-30 seconds.', 'Switch sides and repeat.', 'Avoid arching your lower back excessively.]'::jsonb,
  ARRAY['Hip mobility', 'Lower back relief', 'Improved posture', 'Flexibility']::text[],
  'https://www.youtube.com/watch?v=y0Po2Y2Q0qU',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Beginner',
  50,
  10,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"flexibility"}'::jsonb,
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
  updated_at = now();

-- Glute Activation Exercises
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'd0e0f1f2f3f4f5f6f7f8f9fafbfcfdfe',
  'Glute Activation Exercises',
  'strength',
  'Glutes',
  ARRAY[]::text[],
  ARRAY['resistance bands']::text[],
  'Glute Activation Exercises wake up and strengthen the glute muscles, improving hip function and preventing injury.',
  '[Place a resistance band around your thighs above knees.', 'Perform glute bridges while maintaining band tension.', 'Include clamshells with the band.', 'Add side-stepping with band resistance.', 'Focus on glute engagement throughout.', 'Complete 10-15 reps of each exercise.', 'Perform 2-3 sets on each side.]'::jsonb,
  ARRAY['Glute strength', 'Hip stability', 'Injury prevention', 'Warm-up activation']::text[],
  'https://www.youtube.com/watch?v=4n-OCwz0IwE',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Beginner',
  80,
  35,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Rotator Cuff Exercises
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'e1e2e3e4e5e6e7e8e9eaebecedeeef',
  'Rotator Cuff Exercises',
  'strength',
  'Shoulders',
  ARRAY[]::text[],
  ARRAY['resistance bands']::text[],
  'Rotator Cuff Exercises strengthen the small shoulder stabilizer muscles, preventing injury and improving shoulder health.',
  '[Use light resistance band for internal/external rotation.', 'Keep your elbow tucked at your side at 90 degrees.', 'Rotate arm inward and outward against band resistance.', 'Perform face pulls with band at head height.', 'Include shoulder circles with light resistance.', 'Focus on proper form and muscle engagement.', 'Complete 10-15 reps per exercise.]'::jsonb,
  ARRAY['Shoulder stability', 'Injury prevention', 'Rotator cuff strength', 'Joint health']::text[],
  'https://www.youtube.com/watch?v=s6mEv1kB_1I',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Beginner',
  60,
  25,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Ankle Mobility
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'f2f3f4f5f6f7f8f9fafbfcfdfeff00',
  'Ankle Mobility',
  'flexibility',
  'Ankles',
  ARRAY[]::text[],
  ARRAY['none']::text[],
  'Ankle Mobility exercises improve ankle range of motion and stability, enhancing movement quality and preventing injuries.',
  '[Stand facing a wall with one foot forward.', 'Place your hands on the wall for support.', 'Step forward with one foot, keeping the heel on the ground.', 'Lean forward until you feel a stretch in the ankle.', 'Hold for 20-30 seconds.', 'Perform ankle circles in both directions.', 'Repeat with the other foot.]'::jsonb,
  ARRAY['Ankle mobility', 'Balance improvement', 'Injury prevention', 'Movement quality']::text[],
  'https://www.youtube.com/watch?v=7eYbA07G_e8',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Beginner',
  55,
  15,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"flexibility"}'::jsonb,
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
  updated_at = now();

-- Incline Push-ups
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'f3f4f5f6f7f8f9fafbfcfdfeff0011',
  'Incline Push-ups',
  'strength',
  'Upper Chest',
  ARRAY[]::text[],
  ARRAY['bench']::text[],
  'Incline Push-ups target the upper chest and are a progression toward standard push-ups or an alternative for varied training.',
  '[Place your hands on a bench or elevated surface.', 'Start in plank position with hands wider than shoulders.', 'Lower your chest toward the bench with control.', 'Keep your body in a straight line from head to heels.', 'Push back up to the starting position.', 'Maintain proper form throughout.', 'Adjust incline height for difficulty.]'::jsonb,
  ARRAY['Upper chest development', 'Push-up progression', 'Shoulder strength', 'Beginner friendly']::text[],
  'https://www.youtube.com/watch?v=L3pAa1GfXkQ',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Beginner',
  85,
  35,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Decline Push-ups
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'f4f5f6f7f8f9fafbfcfdfeff001122',
  'Decline Push-ups',
  'strength',
  'Lower Chest',
  ARRAY[]::text[],
  ARRAY['bench']::text[],
  'Decline Push-ups increase the difficulty of standard push-ups and emphasize the lower chest and front deltoids.',
  '[Place your feet on a bench or elevated surface.', 'Start in push-up position with hands on the floor.', 'Lower your chest toward the ground with control.', 'Keep your body in a straight line from head to heels.', 'Push back up to the starting position.', 'Maintain proper form throughout.', 'Adjust height for difficulty level.]'::jsonb,
  ARRAY['Lower chest development', 'Increased difficulty', 'Shoulder strength', 'Upper body power']::text[],
  'https://www.youtube.com/watch?v=1P82g__P3rM',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Intermediate',
  110,
  55,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Diamond Push-ups
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'f5f6f7f8f9fafbfcfdfeff00112233',
  'Diamond Push-ups',
  'strength',
  'Triceps',
  ARRAY[]::text[],
  ARRAY['none']::text[],
  'Diamond Push-ups are a challenging variation that heavily targets the triceps while also working chest and shoulders.',
  '[Start in push-up position with hands close together.', 'Form a diamond shape with your index fingers and thumbs.', 'Lower your chest toward your hands with control.', 'Keep your elbows close to your body.', 'Push back up to the starting position.', 'Maintain proper form throughout.', 'Adjust difficulty as needed.]'::jsonb,
  ARRAY['Triceps development', 'Upper body strength', 'Close-grip pressing', 'Advanced variation']::text[],
  'https://www.youtube.com/watch?v=jAP38Fz0d8E',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Advanced',
  105,
  50,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Skull Crushers
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'f6f7f8f9fafbfcfdfeff0011223344',
  'Skull Crushers',
  'strength',
  'Triceps',
  ARRAY[]::text[],
  ARRAY['ez bar']::text[],
  'Skull Crushers are an isolation exercise for triceps that provides a great stretch and contraction for arm development.',
  '[Lie on a bench holding an EZ bar with narrow grip.', 'Extend your arms straight up over your chest.', 'Lower the bar toward your forehead by bending your elbows.', 'Keep your upper arms stationary throughout.', 'Press the bar back up to the starting position.', 'Control the movement both ways.', 'Use appropriate weight for your fitness level.]'::jsonb,
  ARRAY['Triceps isolation', 'Arm development', 'Stretch and contraction', 'Muscle growth']::text[],
  'https://www.youtube.com/watch?v=zMQX5h8xsfk',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Intermediate',
  70,
  35,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Concentration Curls
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'f7f8f9fafbfcfdfeff001122334455',
  'Concentration Curls',
  'strength',
  'Biceps',
  ARRAY[]::text[],
  ARRAY['dumbbell', 'bench']::text[],
  'Concentration Curls isolate the biceps for maximum muscle engagement and development in the arms.',
  '[Sit on a bench with legs spread.', 'Grasp a dumbbell with one hand.', 'Rest your elbow against your inner thigh.', 'Curl the weight toward your shoulder.', 'Squeeze your biceps at the top.', 'Lower with controlled resistance.', 'Complete all reps before switching arms.]'::jsonb,
  ARRAY['Biceps isolation', 'Arm development', 'Muscle definition', 'Concentration focus']::text[],
  'https://www.youtube.com/watch?v=vBkO4q2r_sA',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Intermediate',
  65,
  30,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Hammer Curls
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'f8f9fafbfcfdfeff00112233445566',
  'Hammer Curls',
  'strength',
  'Biceps',
  ARRAY[]::text[],
  ARRAY['dumbbells']::text[],
  'Hammer Curls target the biceps and brachialis with a neutral grip, promoting balanced arm development and grip strength.',
  '[Stand with feet shoulder-width apart.', 'Hold dumbbells with neutral grip (palms facing each other).', 'Keep your elbows tucked at your sides.', 'Curl both weights toward your shoulders.', 'Maintain the neutral grip throughout.', 'Lower with controlled resistance.', 'Focus on biceps contraction.]'::jsonb,
  ARRAY['Biceps and brachialis development', 'Grip strength', 'Arm balance', 'Neutral grip benefits']::text[],
  'https://www.youtube.com/watch?v=zWJFAhro5m4',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Intermediate',
  70,
  35,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Box Jumps
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'f9fafbfcfdfeff0011223344556677',
  'Box Jumps',
  'cardio',
  'Legs',
  ARRAY[]::text[],
  ARRAY['plyometric box']::text[],
  'Box Jumps develop explosive leg power and athletic ability through vertical jumping onto elevated surfaces.',
  '[Stand in front of a sturdy box or platform.', 'Load your hips and swing arms back.', 'Explode upward and jump onto the box.', 'Land softly with bent knees to absorb impact.', 'Step down carefully (don''t jump down).', 'Reset and repeat for desired reps.', 'Focus on maximum height and proper landing.]'::jsonb,
  ARRAY['Explosive power', 'Athletic performance', 'Leg strength', 'Plyometric benefits']::text[],
  'https://www.youtube.com/watch?v=V0oDunF_T3w',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Advanced',
  145,
  95,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Turkish Get-up
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'fafbfcfdfeff001122334455667788',
  'Turkish Get-up',
  'strength',
  'Full Body',
  ARRAY[]::text[],
  ARRAY['kettlebells']::text[],
  'Turkish Get-ups are a complex exercise that builds strength, stability, mobility, and coordination throughout the entire body.',
  '[Lie on your back holding a kettlebell straight up.', 'Press the kettlebell to the ceiling while keeping your arm locked.', 'Bend your knee on the same side as the kettlebell.', 'Use your opposite arm to prop yourself up to sitting.', 'Bridge your hips and sweep your straight leg under.', 'Move to kneeling position while keeping kettlebell overhead.', 'Stand up while maintaining the overhead lockout.]'::jsonb,
  ARRAY['Full-body strength', 'Shoulder stability', 'Core control', 'Functional movement']::text[],
  'https://www.youtube.com/watch?v=GJhTmQ-uPhk',
  'https://images.unsplash.com/photo-1598673599333-c94a73278a0c?q=80&w=800&auto=format&fit=crop',
  'Advanced',
  80,
  45,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"full-body"}'::jsonb,
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
  updated_at = now();

-- Single-leg Romanian Deadlift
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'fbfcfdfeff00112233445566778899',
  'Single-leg Romanian Deadlift',
  'strength',
  'Hamstrings',
  ARRAY[]::text[],
  ARRAY['dumbbells']::text[],
  'Single-leg Romanian Deadlifts build hamstring and glute strength while improving balance and hip stability.',
  '[Stand on one leg holding dumbbells in front of thighs.', 'Keep a slight bend in your standing knee.', 'Hinge at your hips, lowering the weights toward the ground.', 'Keep your back straight and chest up.', 'Lower until you feel a good hamstring stretch.', 'Drive through your heel to return to standing.', 'Maintain balance throughout the movement.]'::jsonb,
  ARRAY['Hamstring development', 'Balance improvement', 'Hip stability', 'Single-leg strength']::text[],
  'https://www.youtube.com/watch?v=o39rfKd_XP8',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Intermediate',
  90,
  50,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- L-sit
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'fcfdfeff0011223344556677889900',
  'L-sit',
  'strength',
  'Core',
  ARRAY[]::text[],
  ARRAY['none']::text[],
  'The L-sit is an advanced core exercise that builds tremendous abdominal strength, hip flexor strength, and body control.',
  '[Sit on the ground with legs extended straight.', 'Place hands beside your hips on the ground.', 'Press through your palms to lift your hips off the ground.', 'Keep your legs straight and together.', 'Hold your body in an ''L'' position.', 'Keep your chest up and shoulders depressed.', 'Hold as long as possible with proper form.]'::jsonb,
  ARRAY['Core strength', 'Hip flexor development', 'Body control', 'Advanced calisthenics']::text[],
  'https://www.youtube.com/watch?v=V7lA_6_w8Y8',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Advanced',
  85,
  40,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Bulgarian Split Squat
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'fdfeff001122334455667788990011',
  'Bulgarian Split Squat',
  'strength',
  'Legs',
  ARRAY[]::text[],
  ARRAY['dumbbells']::text[],
  'Bulgarian Split Squats are an intense single-leg exercise that builds strength, muscle, and balance in the lower body.',
  '[Stand with back foot elevated on a bench.', 'Hold dumbbells at your sides for added resistance.', 'Lower into a lunge by bending your front knee.', 'Keep your torso upright and core engaged.', 'Lower until your front thigh is parallel to ground.', 'Press through your front heel to return to starting position.', 'Complete all reps before switching legs.]'::jsonb,
  ARRAY['Single-leg strength', 'Balance improvement', 'Muscle development', 'Functional movement']::text[],
  'https://www.youtube.com/watch?v=1-6B8iKXgOA',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Intermediate',
  95,
  60,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Face Pulls
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'feff00112233445566778899001122',
  'Face Pulls',
  'strength',
  'Rear Delts',
  ARRAY[]::text[],
  ARRAY['cable machine']::text[],
  'Face Pulls strengthen the rear deltoids, upper back, and external rotators, improving posture and shoulder health.',
  '[Set a cable pulley at chest height with rope attachment.', 'Grasp the rope with an overhand grip.', 'Step back and stand with feet shoulder-width apart.', 'Pull the rope toward your face, separating your hands.', 'Keep your elbows up and shoulders down.', 'Squeeze your upper back at the peak of the movement.', 'Return to starting position with control.]'::jsonb,
  ARRAY['Rear delt development', 'Shoulder health', 'Posture improvement', 'Upper back strength']::text[],
  'https://www.youtube.com/watch?v=8sDeMRIf9bE',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Intermediate',
  75,
  40,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Cable Crunch
INSERT INTO exercises (
  library_id, name, category, primary_muscle, secondary_muscles, equipment,
  overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at
) VALUES (
  'ff0011223344556677889900112233',
  'Cable Crunch',
  'strength',
  'Upper Abs',
  ARRAY[]::text[],
  ARRAY['cable machine']::text[],
  'Cable Crunches provide constant tension on the abdominal muscles, allowing for progressive overload and core development.',
  '[Attach a rope handle to a high cable pulley.', 'Kneel facing the cable machine.', 'Grasp the rope and place it behind your head.', 'Keep your hips stationary throughout.', 'Crunch your torso down toward your knees.', 'Focus on contracting your abdominal muscles.', 'Return to starting position with control.]'::jsonb,
  ARRAY['Abdominal development', 'Core strength', 'Constant tension', 'Progressive overload']::text[],
  'https://www.youtube.com/watch?v=5V8F4Y2K7WA',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  'Intermediate',
  80,
  35,
  '{"secondary_muscles":[],"phase":3,"exercise_category":"strength"}'::jsonb,
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
  updated_at = now();

-- Total Phase 3 exercises: 35
-- Database update complete