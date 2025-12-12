#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadExercises() {
  const file = path.join(__dirname, '..', 'exercises', 'exercises.json');
  if (!fs.existsSync(file)) {
    console.error('exercises.json not found at', file);
    process.exit(1);
  }

  const raw = fs.readFileSync(file, 'utf8');
  let records = JSON.parse(raw);

  const transform = (src) => {
    const secondary = src.secondary_muscles || [];
    const equipment = src.equipment || [];
    return {
      library_id: src.id || src.uuid || null,
      name: src.name || src.title || 'Unnamed exercise',
      category: src.category || null,
      primary_muscle: (src.primary_muscles && src.primary_muscles[0]) || src.primary || null,
      secondary_muscles: secondary,
      equipment: equipment,
      overview: src.description || src.overview || null,
      instructions: src.instructions || src.steps || [],
      benefits: src.benefits || [],
      video_url: src.video || src.video_url || null,
      image_url: src.image || src.image_url || null,
      difficulty: src.difficulty || null,
      bpm: src.bpm || null,
      calories: src.calories || null,
      metadata: { source: src.source || null, license: src.license || null, raw: src },
    };
  };

  if (!Array.isArray(records)) {
    if (records.exercises) records = records.exercises;
    else records = [records];
  }

  console.log(`Found ${records.length} exercises; starting upsert in chunks`);

  const chunkSize = 200;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize).map(transform);
    const { data, error } = await supabase.from('exercises').upsert(chunk, { onConflict: 'library_id' }).select('id, library_id, name');
    if (error) {
      console.error('Upsert error:', error);
      process.exit(1);
    }
    console.log(`Upserted chunk ${i}-${i + chunk.length - 1}`);
  }

  console.log('Seeding complete');
}

loadExercises().catch((err) => { console.error(err); process.exit(1); });
