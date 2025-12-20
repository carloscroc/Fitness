// Phase 3 Exercise MD5 Hash Generator
import crypto from 'crypto';

// List of all 35 Phase 3 exercises
const phase3Exercises = [
  // Advanced Compound Exercises (8)
  'muscle-up',
  'handstand push-up',
  'pistol squat',
  'one-arm push-up',
  'planche',
  'front lever',
  'back lever',
  'human flag',

  // Sport-specific Exercises (7)
  'medicine ball slams',
  'boxing combinations',
  'kettlebell ballistic',
  'plyometric push-ups',
  'depth jumps',
  'broad jumps',
  'agility ladder drills',

  // Rehabilitation Exercises (7)
  'clamshells',
  'wall angels',
  'scapular retraction',
  'hip flexor stretch',
  'glute activation exercises',
  'rotator cuff exercises',
  'ankle mobility',

  // Chest & Arms Variations (6)
  'incline push-ups',
  'decline push-ups',
  'diamond push-ups',
  'skull crushers',
  'concentration curls',
  'hammer curls',

  // Additional Advanced & Specialized Exercises (7)
  'box jumps',
  'turkish get-up',
  'single-leg romanian deadlift',
  'l-sit',
  'bulgarian split squat',
  'face pulls',
  'cable crunch'
];

console.log('Phase 3 Exercise MD5 Hashes');
console.log('=====================================\n');

// Generate MD5 hashes for each exercise
phase3Exercises.forEach((exercise, index) => {
  const hash = crypto.createHash('md5').update(exercise.toLowerCase()).digest('hex');
  const exerciseId = `e_${index + 1 < 10 ? 'adv' + (index + 1) : index < 17 ? 'sport' + (index - 8) : index < 24 ? 'rehab' + (index - 16) : index < 30 ? 'ca' + (index - 23) : 'spec' + (index - 29)}`;
  console.log(`${exercise}: ${hash}`);
});

console.log('\nPhase 3 Exercise IDs with Hashes:');
console.log('=====================================\n');

// Generate exercise IDs with hashes
phase3Exercises.forEach((exercise, index) => {
  const hash = crypto.createHash('md5').update(exercise.toLowerCase()).digest('hex');
  let exerciseId;

  if (index < 8) {
    exerciseId = `e_adv_00${index + 1}`;
  } else if (index < 15) {
    exerciseId = `e_sport_00${index - 7}`;
  } else if (index < 22) {
    exerciseId = `e_rehab_00${index - 14}`;
  } else if (index < 28) {
    exerciseId = `e_ca_00${index - 21}`;
  } else {
    exerciseId = `e_spec_00${index - 27}`;
  }

  console.log(`${exerciseId}: ${hash} // ${exercise}`);
});

console.log('\nTotal Phase 3 exercises:', phase3Exercises.length);