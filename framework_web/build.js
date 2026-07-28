const Terser = require('terser');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

async function minifyFile(file) {
  const input = fs.readFileSync(file, 'utf8');
  const outName = path.basename(file, '.js') + '.min.js';
  const outPath = path.join(DIST, outName);

  try {
    const result = await Terser.minify(input, {
      ecma: 2015,
      compress: { drop_console: false },
      output: { comments: false },
    });
    if (result.error) throw result.error;
    fs.writeFileSync(outPath, result.code, 'utf8');
    const inSize = Buffer.byteLength(input, 'utf8');
    const outSize = Buffer.byteLength(result.code, 'utf8');
    const saved = ((1 - outSize / inSize) * 100).toFixed(1);
    console.log(`✓ ${path.basename(file)} → ${outName}  (${outSize} bytes, -${saved}%)`);
  } catch (err) {
    console.error(`✗ Error en ${path.basename(file)}:`, err.message);
  }
}

async function build() {
  console.log('🔨 Building framework-web...\n');

  if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

  const files = fs.readdirSync(SRC).filter(f => f.endsWith('.js'));
  if (!files.length) {
    console.log('No se encontraron archivos .js en src/');
    return;
  }

  await Promise.all(files.map(f => minifyFile(path.join(SRC, f))));

  console.log('\n✅ Build complete!');

  if (process.argv.includes('--watch')) {
    console.log('👀 Watching for changes...');
    files.forEach(f => {
      fs.watchFile(path.join(SRC, f), { interval: 500 }, () => {
        console.log(`\n📦 Change detected: ${f}`);
        minifyFile(path.join(SRC, f));
      });
    });
  }
}

build();
