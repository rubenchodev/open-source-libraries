import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_DIR = join(__dirname, '..');
const GEO_DIR = join(BASE_DIR, 'dist', 'mxGeoJSON');
const COLONIAS_DIR = join(GEO_DIR, 'colonias');

let totalExtracted = 0;
let coloniasIndex = {};

for (let i = 1; i <= 32; i++) {
  const stateId = String(i).padStart(2, '0');
  const filePath = join(GEO_DIR, `${stateId}.json`);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  let stateExtracted = 0;

  for (const m of data.municipalities) {
    if (m.neighborhoods && m.neighborhoods.length > 0) {
      const flatName = `${stateId}${m.id}`;
      mkdirSync(COLONIAS_DIR, { recursive: true });
      writeFileSync(
        join(COLONIAS_DIR, `${flatName}.json`),
        JSON.stringify({
          id: m.id,
          name: m.name,
          neighborhoods: m.neighborhoods
        }),
        'utf-8'
      );
      stateExtracted += m.neighborhoods.length;
      (coloniasIndex[stateId] ||= []).push(m.id);
      delete m.neighborhoods;
    }
  }

  writeFileSync(filePath, JSON.stringify(data), 'utf-8');
  console.log(`${stateId} ${data.name}: ${data.municipalities.length} municipios, ${stateExtracted} colonias extracted`);
  totalExtracted += stateExtracted;
}

mkdirSync(COLONIAS_DIR, { recursive: true });
writeFileSync(join(COLONIAS_DIR, 'index.json'), JSON.stringify(coloniasIndex), 'utf-8');
const stateCount = Object.keys(coloniasIndex).length;
const totalFiles = Object.values(coloniasIndex).flat().length;
console.log(`\nDone. ${totalExtracted} colonias in ${totalFiles} files across ${stateCount} states`);
