const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_KEY = process.env.YT_API_KEY;
if (!API_KEY) {
  console.error('Set YT_API_KEY environment variable before running.');
  process.exit(1);
}

const FILE = path.resolve(__dirname, '..', 'exercises', 'exercises.json');
const BACKUP = FILE + '.bak.' + Date.now();

function safeRead(file) {
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw);
}

function writeJSON(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
}

function isoDurationToSeconds(iso) {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = parseInt(m[1]||0,10);
  const mm = parseInt(m[2]||0,10);
  const s = parseInt(m[3]||0,10);
  return h*3600 + mm*60 + s;
}

function normalizeName(name) {
  return (name || '').toLowerCase().replace(/[\W_]+/g, ' ').trim();
}

function titleScore(name, title) {
  const n = normalizeName(name);
  const t = normalizeName(title);
  if (!n || !t) return 0;
  const tokens = n.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const tk of tokens) {
    if (t.includes(tk)) score += 1;
  }
  return score / Math.max(tokens.length, 1);
}

async function searchYouTube(q, maxResults = 5) {
  const res = await requestWithRetry('https://www.googleapis.com/youtube/v3/search', {
    params: { part: 'snippet', q, type: 'video', maxResults, key: API_KEY }
  });
  return res.data.items || [];
}

async function getVideosInfo(ids) {
  if (!ids || ids.length === 0) return [];
  const res = await requestWithRetry('https://www.googleapis.com/youtube/v3/videos', {
    params: { part: 'snippet,contentDetails,statistics', id: ids.join(','), key: API_KEY }
  });
  return res.data.items || [];
}

async function requestWithRetry(url, opts, maxRetries = 4) {
  let attempt = 0;
  let delay = 1000;
  while (true) {
    try {
      return await axios.get(url, opts);
    } catch (err) {
      attempt++;
      const status = err && err.response && err.response.status;
      // Retry on 403 or 429 (quota/rate limit) or network issues
      if (attempt > maxRetries || (status && status !== 403 && status !== 429 && status !== 500)) {
        throw err;
      }
      console.warn(`Request failed (status=${status}). retry #${attempt} after ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(30000, delay * 2);
    }
  }
}

async function main() {
  const data = safeRead(FILE);
  const exercises = Array.isArray(data.exercises) ? data.exercises : (Array.isArray(data) ? data : (data.items || []));
  if (!Array.isArray(exercises)) {
    console.error('Unexpected exercises.json structure');
    process.exit(1);
  }
  fs.copyFileSync(FILE, BACKUP);
  console.log('Backup saved to', BACKUP);

  let updated = 0;
  const missing = exercises.filter(e => !e.video || !String(e.video).trim());
  console.log(`${exercises.length} total, ${missing.length} missing video field`);

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    if (ex.video && String(ex.video).trim()) continue;

    const queryParts = [ex.name];
    if (ex.muscles) queryParts.push(Array.isArray(ex.muscles) ? ex.muscles.join(' ') : ex.muscles);
    if (ex.equipment) queryParts.push(Array.isArray(ex.equipment) ? ex.equipment.join(' ') : ex.equipment);
    queryParts.push('exercise');
    const q = queryParts.filter(Boolean).join(' ');

    try {
      const items = await searchYouTube(q, 5);
      const ids = items.map(it => it.id.videoId).filter(Boolean);
      const infos = await getVideosInfo(ids);

      const candidates = infos.map(info => {
        const id = info.id;
        const title = info.snippet.title || '';
        const duration = isoDurationToSeconds(info.contentDetails && info.contentDetails.duration);
        const views = parseInt((info.statistics && info.statistics.viewCount) || '0', 10);
        const tscore = titleScore(ex.name, title);
        let score = tscore;
        if (duration >= 5 && duration <= 1800) score += 0.2;
        score += Math.min(1, Math.log10(Math.max(1, views)) / 8) * 0.1;
        return { id, title, duration, views, score };
      }).sort((a,b) => b.score - a.score);

      const best = candidates[0];
      if (best && best.score >= 0.35) {
        ex.video = `https://www.youtube.com/watch?v=${best.id}`;
        ex.video_embed = `https://www.youtube.com/embed/${best.id}`;
        ex._video_autofill = { provider: 'youtube', id: best.id, confidence: Number(best.score.toFixed(2)) };
        updated++;
        console.log(`Filled [${i+1}/${exercises.length}] ${ex.name} -> ${ex.video} (score=${best.score.toFixed(2)})`);
      } else if (best) {
        ex._video_suggestion = { provider: 'youtube', id: best.id, confidence: Number((best.score||0).toFixed(2)), title: best.title };
        console.log(`Suggested [${i+1}/${exercises.length}] ${ex.name} -> ${best.id} (score=${(best.score||0).toFixed(2)})`);
      } else {
        console.log(`No candidate for [${i+1}/${exercises.length}] ${ex.name}`);
      }

      await new Promise(r => setTimeout(r, 250));
    } catch (err) {
      console.error('Error searching for', ex.name, err.message || err.toString());
    }
  }

  if (updated > 0) {
    writeJSON(FILE, data);
    console.log(`Wrote ${updated} new video fields to ${FILE}`);
  } else {
    console.log('No automatic fills applied; suggestions may be present under `_video_suggestion`');
  }
}

main().catch(err => { console.error(err); process.exit(1); });