const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const FILE = path.resolve(__dirname, '..', 'exercises', 'exercises.json');
const BACKUP = FILE + '.bak.ytdlp.' + Date.now();

function safeRead(file){ return JSON.parse(fs.readFileSync(file,'utf8')); }
function writeJSON(file,obj){ fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8'); }

function ensureYtDlp() {
  try {
    const v = execSync('yt-dlp --version', { stdio: ['pipe','pipe','ignore'] }).toString().trim();
    console.log('yt-dlp available, version', v);
    return 'yt-dlp';
  } catch (_) {
    console.log('yt-dlp not found on PATH; trying npx yt-dlp...');
    try {
      const out = execSync('npx --no-install yt-dlp --version', { stdio: ['pipe','pipe','ignore'] }).toString().trim();
      console.log('npx yt-dlp available');
      return 'npx yt-dlp';
    } catch (_) {
      console.log('Attempting to install yt-dlp via pip...');
      try {
        execSync('python -m pip install -U yt-dlp', { stdio: 'inherit' });
        const v2 = execSync('yt-dlp --version', { stdio: ['pipe','pipe','ignore'] }).toString().trim();
        console.log('yt-dlp installed, version', v2);
        return 'yt-dlp';
      } catch (err) {
        console.error('Failed to ensure yt-dlp is available. Please install yt-dlp or allow npx to run it.');
        throw err;
      }
    }
  }
}

function queryToSafe(q){ return q.replace(/\s+/g,' ').trim(); }

async function main(){
  const data = safeRead(FILE);
  const exercises = data.exercises || [];
  fs.copyFileSync(FILE, BACKUP);
  console.log('Backup created at', BACKUP);

  const runner = ensureYtDlp();

  let updated = 0;
  for (let i=0;i<exercises.length;i++){
    const ex = exercises[i];
    if (ex.video && String(ex.video).trim()) continue;
    const qparts = [ex.name];
    if (ex.equipment) qparts.push(Array.isArray(ex.equipment)?ex.equipment.join(' '):ex.equipment);
    qparts.push('exercise');
    const q = queryToSafe(qparts.join(' '));
    let cmd = `${runner} "ytsearch1:${q}" --get-id --no-warnings --no-playlist`;
    try {
      const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe','pipe','pipe'], maxBuffer: 1024*1024 });
      const id = out.split('\n').map(s=>s.trim()).find(Boolean);
      if (id && id.length>=8){
        ex.video = `https://www.youtube.com/watch?v=${id}`;
        ex.video_embed = `https://www.youtube.com/embed/${id}`;
        ex._video_autofill = { provider: 'youtube', id, confidence: 0.5, source: 'yt-dlp' };
        updated++;
        process.stdout.write(`Filled [${i+1}/${exercises.length}] ${ex.name} -> ${id}\r`);
      } else {
        process.stdout.write(`No result [${i+1}/${exercises.length}] ${ex.name}\r`);
      }
    } catch (err) {
      console.error(`\nyt-dlp failed for ${ex.name}:`, err.message || err);
    }
    // throttle
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 150);
  }

  if (updated>0){
    writeJSON(FILE, data);
    console.log(`\nWrote ${updated} new video fields to ${FILE}`);
  } else {
    console.log('\nNo new fills applied.');
  }
}

main().catch(err=>{ console.error(err); process.exit(1); });
