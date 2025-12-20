import fs from 'fs';

// Read the existing seed file
const existingSeed = fs.readFileSync('supabase/seeds/insert_exercises.sql', 'utf8');

// Read the Phase 3 exercises
const phase3Exercises = fs.readFileSync('phase3-sql-inserts.sql', 'utf8');

// Remove the final COMMIT from existing seed
const seedWithoutCommit = existingSeed.replace(/\nCOMMIT;$/, '');

// Create the combined content
const combinedSeed = seedWithoutCommit + `\n\n-- Phase 3 Exercises - Advanced & Specialized (35 exercises)
-- Added on: ${new Date().toISOString().split('T')[0]}
-- Total exercises will increase from 872 to 907

` + phase3Exercises + '\nCOMMIT;';

// Write the combined seed file
fs.writeFileSync('supabase/seeds/insert_exercises.sql', combinedSeed);

console.log('Phase 3 exercises added to supabase/seeds/insert_exercises.sql');
console.log('Total exercises in seed file: 907 (was 872)');