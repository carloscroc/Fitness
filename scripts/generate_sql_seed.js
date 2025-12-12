import { promises as fs } from 'fs'
import crypto from 'crypto'
import path from 'path'

const exercisesPath = path.join(process.cwd(), 'exercises', 'exercises.json')
const outDir = path.join(process.cwd(), 'supabase', 'seeds')
const outFile = path.join(outDir, 'insert_exercises.sql')

function dollarQuote(s) {
  if (s === null || s === undefined) return '$$$$'
  return '$$' + String(s).replace(/\$\$/g, '$$$$') + '$$'
}

function toText(value) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.join('\n')
  return JSON.stringify(value)
}

async function main() {
  await fs.mkdir(outDir, { recursive: true })
  const raw = await fs.readFile(exercisesPath, 'utf8')
  const parsed = JSON.parse(raw)

  let arr = []
  if (Array.isArray(parsed)) arr = parsed
  else if (Array.isArray(parsed.exercises)) arr = parsed.exercises
  else if (Array.isArray(parsed.data)) arr = parsed.data
  else if (Array.isArray(parsed.items)) arr = parsed.items
  else if (parsed && typeof parsed === 'object') {
    const maybeArray = Object.values(parsed).filter(v => typeof v === 'object' && (v.id || v.library_id || v.name))
    arr = maybeArray.length ? maybeArray : []
  }

  if (!Array.isArray(arr) || arr.length === 0) {
    console.error('No exercises found in', exercisesPath)
    process.exit(1)
  }

  const lines = []
  lines.push('-- Generated SQL seed: idempotent upserts into exercises')
  lines.push('BEGIN;')

  for (const ex of arr) {
    const name = toText(ex.name) || ''
    // deterministic library_id: prefer source id, else md5(name)
    const srcId = ex.id ?? ex.library_id ?? ex.uuid ?? null
    const library_id = srcId ? String(srcId) : crypto.createHash('md5').update(name.trim().toLowerCase()).digest('hex')

    const overview = toText(ex.description ?? ex.overview)
    const instructionsArr = Array.isArray(ex.instructions) ? ex.instructions : (ex.steps || ex.instructions || [])
    const instructions = JSON.stringify(instructionsArr)
    const benefitsArr = Array.isArray(ex.benefits) ? ex.benefits : (ex.benefits ? [ex.benefits] : [])
    const benefits = benefitsArr
    const secondary = Array.isArray(ex.secondary_muscles) ? ex.secondary_muscles : (ex.secondary_muscles || [])
    const equipment = Array.isArray(ex.equipment) ? ex.equipment : (ex.equipment || [])
    const metadata = JSON.stringify(ex)

    function sqlTextArray(arr) {
      if (!arr || arr.length === 0) return "ARRAY[]::text[]"
      const items = arr.map(it => `'${String(it).replace(/'/g, "''")}'`).join(', ')
      return `ARRAY[${items}]::text[]`
    }

    const stmt = `INSERT INTO exercises (library_id, name, category, primary_muscle, secondary_muscles, equipment, overview, instructions, benefits, video_url, image_url, difficulty, bpm, calories, metadata, created_at, updated_at) VALUES (`
      + `${dollarQuote(library_id)}, `
      + `${dollarQuote(name)}, `
      + `${dollarQuote(ex.category || '')}, `
      + `${dollarQuote((ex.primary_muscles && ex.primary_muscles[0]) || ex.primary || '')}, `
      + `${sqlTextArray(secondary)}, ${sqlTextArray(equipment)}, `
      + `${dollarQuote(overview)}, ${dollarQuote(instructions)}::jsonb, ${sqlTextArray(benefits)}, `
      + `${dollarQuote(ex.video || ex.video_url || null)}, ${dollarQuote(ex.image || ex.image_url || null)}, `
      + `${dollarQuote(ex.difficulty || null)}, ${ex.bpm || 'NULL'}, ${ex.calories || 'NULL'}, ${dollarQuote(metadata)}::jsonb, now(), now()) `
      + `ON CONFLICT (library_id) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category, primary_muscle = EXCLUDED.primary_muscle, secondary_muscles = EXCLUDED.secondary_muscles, equipment = EXCLUDED.equipment, overview = EXCLUDED.overview, instructions = EXCLUDED.instructions, benefits = EXCLUDED.benefits, video_url = EXCLUDED.video_url, image_url = EXCLUDED.image_url, difficulty = EXCLUDED.difficulty, bpm = EXCLUDED.bpm, calories = EXCLUDED.calories, metadata = EXCLUDED.metadata, updated_at = now();`

    lines.push(stmt)
  }

  lines.push('COMMIT;')
  await fs.writeFile(outFile, lines.join('\n\n'))
  console.log('Wrote SQL seed to', outFile)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
