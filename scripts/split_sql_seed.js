const fs = require('fs');
const path = require('path');

const INPUT = path.resolve(__dirname, '..', 'supabase', 'seeds', 'insert_exercises.sql');
const OUT_DIR = path.resolve(__dirname, '..', 'supabase', 'seeds', 'parts');
const MAX_BYTES = 512 * 1024; // 512KB per chunk

if (!fs.existsSync(INPUT)) {
  console.error('Input SQL not found:', INPUT);
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const content = fs.readFileSync(INPUT, 'utf8');

// Split on ";\n" boundaries for individual statements
const statements = content.split(/;\s*\n/).map(s => s.trim()).filter(Boolean).map(s => s + ';\n');

let part = 0;
let buffer = '';
for (const stmt of statements) {
  if ((Buffer.byteLength(buffer + stmt, 'utf8') > MAX_BYTES) && buffer.length > 0) {
    const outPath = path.join(OUT_DIR, `part-${String(part).padStart(3,'0')}.sql`);
    fs.writeFileSync(outPath, buffer, 'utf8');
    console.log('Wrote', outPath);
    part++;
    buffer = '';
  }
  buffer += stmt + '\n';
}
if (buffer.length > 0) {
  const outPath = path.join(OUT_DIR, `part-${String(part).padStart(3,'0')}.sql`);
  fs.writeFileSync(outPath, buffer, 'utf8');
  console.log('Wrote', outPath);
}

console.log('Done. Generated', part + 1, 'parts in', OUT_DIR);
