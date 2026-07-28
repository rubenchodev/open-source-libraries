/**
 * @file fetch-localidades.js
 * @desc Descarga datos de localidades desde la API de INEGI para cada
 *       municipio del país y los guarda en dist/mxGeoJSON/localidades/
 *       en formato { localidades: [{ id, name, ambito }] }.
 *
 * Uso: node scripts/fetch-localidades.js
 *
 * Fuente: https://gaia.inegi.org.mx/wscatgeo/v2/localidades/{cveAGEE}/{cveAGEM}
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_BASE = 'https://gaia.inegi.org.mx/wscatgeo/v2/localidades';
const GEO_DIR = path.join(__dirname, '..', 'dist', 'mxGeoJSON');
const OUT_DIR = path.join(GEO_DIR, 'localidades');

const DELAY_MS = 100;
let totalFetched = 0;
let totalErrors = 0;

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    }).on('error', reject).on('timeout', function () {
      this.destroy();
      reject(new Error('Timeout'));
    });
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchLocalities(stateId, munId) {
  const url = `${API_BASE}/${stateId}/${munId}`;
  const key = stateId + munId;
  const outFile = path.join(OUT_DIR, key + '.json');

  if (fs.existsSync(outFile)) {
    console.log(`  ↻ ${key}.json ya existe, omitiendo`);
    return;
  }

  try {
    const resp = await fetch(url);
    const datos = resp.datos || [];

    const localidades = datos.map(d => ({
      id: d.cve_loc,
      name: d.nomgeo,
      ambito: (d.ambito || '').toLowerCase() === 'urbano' ? 'U' : 'R',
    }));

    fs.writeFileSync(outFile, JSON.stringify({ localidades }), 'utf8');
    totalFetched++;
    console.log(`  ✓ ${key}.json — ${localidades.length} localidades`);
  } catch (err) {
    totalErrors++;
    console.error(`  ✗ ${key}.json — Error: ${err.message}`);
  }
}

async function main() {
  console.log('📡 Descargando localidades desde INEGI...\n');

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const indexFile = path.join(GEO_DIR, 'index.json');
  if (!fs.existsSync(indexFile)) {
    console.error('No se encuentra index.json en dist/mxGeoJSON/');
    process.exit(1);
  }

  const states = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  console.log(`Estados encontrados: ${states.length}\n`);

  for (const state of states) {
    const stateFile = path.join(GEO_DIR, state.id + '.json');
    if (!fs.existsSync(stateFile)) {
      console.warn(`  ⚠ ${state.id}.json no encontrado, saltando estado ${state.name}`);
      continue;
    }

    const stateData = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    const municipalities = stateData.municipalities || [];

    if (!municipalities.length) {
      console.warn(`  ⚠ ${state.name} no tiene municipios`);
      continue;
    }

    console.log(`${state.id} ${state.name} (${municipalities.length} municipios):`);

    for (const mun of municipalities) {
      await fetchLocalities(state.id, mun.id);
      await delay(DELAY_MS);
    }
    console.log('');
  }

  console.log('✅ Proceso completado');
  console.log(`   Localidades descargadas: ${totalFetched}`);
  console.log(`   Errores: ${totalErrors}`);
}

main().catch(err => {
  console.error('Error fatal:', err.message);
  process.exit(1);
});
