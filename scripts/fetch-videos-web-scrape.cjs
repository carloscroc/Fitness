const fs = require('fs');
const path = require('path');
const axios = require('axios');

const FILE = path.resolve(__dirname, '..', 'exercises', 'exercises.json');
const BACKUP = FILE + '.bak.webscrape.' + Date.now();

function safeRead(file){ return JSON.parse(fs.readFileSync(file,'utf8')); }
function writeJSON(file,obj){ fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8'); }

function extractFirstVideoId(html){
  // Try to find videoId occurrences in the page JS
  const re = /"videoId"\s*:\s*"([A-Za-z0-9_-]{11})"/g;
  const found = new Set();
  let m;
  while ((m = re.exec(html)) !== null){
    found.add(m[1]);
    if (found.size >= 5) break;
  }
  return found.size ? Array.from(found)[0] : null;
}

async function searchYouTube(query){
  const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
  };
  const res = await axios.get(url, { headers, timeout: 15000 });
  return extractFirstVideoId(res.data || '');
}

async function main(){
  const data = safeRead(FILE);
  const exercises = data.exercises || [];
  fs.copyFileSync(FILE, BACKUP);
  console.log('Backup created at', BACKUP);

  let updated = 0;
  for (let i=0;i<exercises.length;i++){
    const ex = exercises[i];
    if (ex.video && String(ex.video).trim()) continue;
    const qparts = [ex.name];
    if (ex.equipment) qparts.push(Array.isArray(ex.equipment)?ex.equipment.join(' '):ex.equipment);
    qparts.push('exercise');
    const q = qparts.filter(Boolean).join(' ');
    try{
      const id = await searchYouTube(q);
      if (id){
        ex.video = `https://www.youtube.com/watch?v=${id}`;
        ex.video_embed = `https://www.youtube.com/embed/${id}`;
        ex._video_autofill = { provider: 'youtube', id, confidence: 0.4, source: 'web-scrape' };
        updated++;
        process.stdout.write(`Filled [${i+1}/${exercises.length}] ${ex.name} -> ${id}\r`);
      } else {
        process.stdout.write(`No result [${i+1}/${exercises.length}] ${ex.name}\r`);
      }
    } catch (err){
      console.error(`\nSearch failed for ${ex.name}:`, err.message || err);
    }
    await new Promise(r=>setTimeout(r, 250));
  }

  if (updated>0){
    writeJSON(FILE, data);
    console.log(`\nWrote ${updated} new video fields to ${FILE}`);
  } else {
    console.log('\nNo new fills applied.');
  }
}

main().catch(err=>{ console.error(err); process.exit(1); });
