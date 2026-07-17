import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_DIR = join(__dirname, '..');
const GEO_DIR = join(BASE_DIR, 'dist', 'mxGeoJSON');
const COLONIAS_DIR = join(GEO_DIR, 'colonias');
const PROGRESS_FILE = join(BASE_DIR, 'scripts', '.sync-progress.json');
const REPORT_FILE = join(BASE_DIR, 'scripts', '.sync-report.json');

const API_BASE = 'https://cp.terio.dev/v1';
const RATE_LIMIT = 4; // requests per second (under 5 limit)
const MIN_DELAY = 1000 / RATE_LIMIT;

// cli args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_COLONIAS = args.includes('--skip-colonias');
const RESUME = args.includes('--resume');
const FORCE = args.includes('--force');

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

let requestTimestamps = [];
async function rateLimitedFetch(url) {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(t => now - t < 1000);
  if (requestTimestamps.length >= RATE_LIMIT) {
    const wait = 1000 - (now - requestTimestamps[0]);
    if (wait > 0) await delay(wait);
  }
  requestTimestamps.push(Date.now());
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 429) {
      console.error(`  ⚠ Rate limited. Waiting 5s...`);
      await delay(5000);
      return rateLimitedFetch(url);
    }
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

function readJSON(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data), 'utf-8');
}

let report = {
  started: new Date().toISOString(),
  states: {},
  summary: { added: 0, removed: 0, renamed: 0, coloniasAdded: 0, errors: 0 }
};

async function main() {
  console.log('=== mxGeoJSON Sync Tool ===');
  if (DRY_RUN) console.log('  MODE: Dry run (no files will be written)');
  if (SKIP_COLONIAS) console.log('  MODE: Skipping colonias fetch');
  console.log('');

  // Phase 1: Fetch states and municipalities from API
  console.log('Phase 1: Fetching catalog from cp.terio.dev...');

  const statesAPI = await rateLimitedFetch(`${API_BASE}/estados`);
  const states = statesAPI.datos;

  // Get current file list
  const indexCurrent = readJSON(join(GEO_DIR, 'index.json')) || [];

  let progress = { states: {} };
  if (RESUME && existsSync(PROGRESS_FILE)) {
    progress = readJSON(PROGRESS_FILE);
    console.log('  Resuming from previous progress');
  }

  for (const st of states) {
    const stateId = st.codigo_estado;
    const stateName = st.estado;
    const filePath = join(GEO_DIR, `${stateId}.json`);

    if (progress.states[stateId]?.municipalitiesDone && !FORCE) {
      console.log(`  ${stateId} ${stateName} — already synced, skipping`);
      continue;
    }

    console.log(`\n  Processing ${stateId} ${stateName}...`);

    // Fetch municipalities from API
    const munsAPI = await rateLimitedFetch(`${API_BASE}/estados/${stateId}/municipios`);
    const apiMunicipios = munsAPI.datos.map(m => ({
      id: m.codigo_municipio,
      name: m.municipio
    }));

    // Read current file
    let currentData = readJSON(filePath);
    let currentMunicipios = currentData?.municipalities || [];

    // Compare
    const apiMap = new Map(apiMunicipios.map(m => [m.id, m.name]));
    const currentMap = new Map(currentMunicipios.map(m => [m.id, m.name]));

    const toAdd = [];
    const toRemove = [];
    const toRename = [];

    for (const [id, name] of apiMap) {
      if (!currentMap.has(id)) {
        toAdd.push({ id, name });
      } else if (currentMap.get(id) !== name) {
        toRename.push({ id, oldName: currentMap.get(id), newName: name });
      }
    }

    for (const [id, name] of currentMap) {
      if (!apiMap.has(id)) {
        toRemove.push({ id, name });
      }
    }

    // Report
    const stateReport = report.states[stateId] = {
      name: stateName,
      currentCount: currentMunicipios.length,
      apiCount: apiMunicipios.length,
      added: toAdd.map(m => `${m.id} ${m.name}`),
      removed: toRemove.map(m => `${m.id} ${m.name}`),
      renamed: toRename.map(m => `${m.id}: "${m.oldName}" → "${m.newName}"`),
      coloniasBefore: 0,
      coloniasAfter: 0
    };

    report.summary.added += toAdd.length;
    report.summary.removed += toRemove.length;
    report.summary.renamed += toRename.length;

    if (toAdd.length) console.log(`    +${toAdd.length} to add: ${toAdd.map(m => m.name).join(', ')}`);
    if (toRemove.length) console.log(`    -${toRemove.length} to remove: ${toRemove.map(m => m.name).join(', ')}`);
    if (toRename.length) toRename.forEach(r => console.log(`    ~ ${r.id}: "${r.oldName}" → "${r.newName}"`));
    if (!toAdd.length && !toRemove.length && !toRename.length) console.log('    ✓ No changes needed');

    if (DRY_RUN) {
      progress.states[stateId] = { municipalitiesDone: true };
      writeJSON(PROGRESS_FILE, progress);
      continue;
    }

    let newMunicipios = apiMunicipios.map(api => ({ id: api.id, name: api.name }));

    currentData = currentData || { id: stateId, name: stateName };
    currentData.name = stateName;
    currentData.id = stateId;
    currentData.municipalities = newMunicipios;

    if (!SKIP_COLONIAS) {
      console.log(`    Fetching colonias...`);
      mkdirSync(COLONIAS_DIR, { recursive: true });

      for (let i = 0; i < newMunicipios.length; i++) {
        const m = newMunicipios[i];
        const flatName = `${stateId}${m.id}`;
        const colFilePath = join(COLONIAS_DIR, `${flatName}.json`);
        const existingCol = readJSON(colFilePath);
        if (existingCol && !FORCE) continue;

        try {
          const cpData = await rateLimitedFetch(
            `${API_BASE}/estados/${stateId}/municipios/${m.id}/codigos-postales?limite=500`
          );
          const cps = cpData.datos.map(d => d.codigo_postal);
          const neighborhoods = [];
          const seen = new Set();

          for (const cp of cps) {
            try {
              const coloniasData = await rateLimitedFetch(`${API_BASE}/codigos-postales/${cp}`);
              for (const col of coloniasData.datos) {
                const key = col.asentamiento.toLowerCase().trim();
                if (!seen.has(key)) {
                  seen.add(key);
                  neighborhoods.push({ name: col.asentamiento, zip: cp });
                }
              }
            } catch (e) {
              console.error(`      ⚠ Error fetching CP ${cp}: ${e.message}`);
              report.summary.errors++;
            }
          }

          if (neighborhoods.length > 0) {
            neighborhoods.sort((a, b) => a.zip.localeCompare(b.zip) || a.name.localeCompare(b.name));
            writeJSON(colFilePath, { id: m.id, name: m.name, neighborhoods });
            report.summary.coloniasAdded += neighborhoods.length;
          }

          if (i % 10 === 0 && i > 0) {
            console.log(`    ...processed ${i}/${newMunicipios.length} municipios`);
          }
        } catch (e) {
          console.error(`    ⚠ Error fetching municipality ${m.id} ${m.name}: ${e.message}`);
          report.summary.errors++;
        }
      }
    }

    // Write file
    writeJSON(filePath, currentData);

    // Save progress
    progress.states[stateId] = { municipalitiesDone: true };
    writeJSON(PROGRESS_FILE, progress);
  }

  // Update index.json
  console.log('\nPhase 3: Updating index.json...');
  const newIndex = states.map(s => ({
    id: s.codigo_estado,
    name: s.estado
  }));

  // Sort by id
  newIndex.sort((a, b) => a.id.localeCompare(b.id));

  if (!DRY_RUN) {
    writeJSON(join(GEO_DIR, 'index.json'), newIndex);
  }

  // Build colonias index
  const coloniasIndex = {};
  if (!DRY_RUN) {
    try {
      const files = readdirSync(COLONIAS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
      for (const f of files) {
        const sid = f.slice(0, 2);
        const mid = f.slice(2, -5);
        (coloniasIndex[sid] ||= []).push(mid);
      }
    } catch {}
    mkdirSync(COLONIAS_DIR, { recursive: true });
    writeJSON(join(COLONIAS_DIR, 'index.json'), coloniasIndex);
  }

  // Final report
  report.ended = new Date().toISOString();
  report.summary.totalMunicipiosApi = states.reduce((sum, s) => sum + report.states[s.codigo_estado]?.apiCount || 0, 0);

  console.log('\n=== Sync Complete ===');
  console.log(`  Added: ${report.summary.added} municipalities`);
  console.log(`  Removed: ${report.summary.removed} municipalities`);
  console.log(`  Renamed: ${report.summary.renamed} municipalities`);
  if (!SKIP_COLONIAS) {
    console.log(`  Colonias added: ${report.summary.coloniasAdded}`);
  }
  console.log(`  Errors: ${report.summary.errors}`);

  if (!DRY_RUN) {
    writeJSON(REPORT_FILE, report);
    // Cleanup progress file
    try { writeFileSync(PROGRESS_FILE, '{}'); } catch {}
  }

  console.log(`\nFull report saved to: ${REPORT_FILE}`);
  console.log(`To schedule: add .github/workflows/sync-mxgeo.yml`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
