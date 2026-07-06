import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { minify as terserMinify } from "terser";
import CleanCSS from "clean-css";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "src");
const DIST = join(__dirname, "dist");

const css = new CleanCSS({ level: 2, sourceMap: false });

async function minifyJS(file) {
  const code = readFileSync(file, "utf8");
  const result = await terserMinify(code, {
    compress: { passes: 2, drop_console: false },
    mangle: { reserved: ["AgrocityKit"] },
    output: { comments: false },
  });
  if (result.error) throw result.error;
  return result.code;
}

function minifyCSS(file) {
  const code = readFileSync(file, "utf8");
  const result = css.minify(code);
  if (result.errors.length) throw new Error(result.errors.join("\n"));
  return result.styles;
}

async function build() {
  // Crear dist/
  mkdirSync(join(DIST, "js"), { recursive: true });
  mkdirSync(join(DIST, "css"), { recursive: true });

  const jsFiles = readdirSync(join(SRC, "js")).filter(f => f.endsWith(".js"));
  const cssFiles = readdirSync(join(SRC, "css")).filter(f => f.endsWith(".css"));

  // JS
  for (const file of jsFiles) {
    const srcPath = join(SRC, "js", file);
    const outPath = join(DIST, "js", file.replace(".js", ".min.js"));

    console.log(`JS: ${file} → ${outPath}`);
    const min = await minifyJS(srcPath);
    writeFileSync(outPath, min, "utf8");
  }

  // CSS
  for (const file of cssFiles) {
    const srcPath = join(SRC, "css", file);
    const outPath = join(DIST, "css", file.replace(".css", ".min.css"));

    console.log(`CSS: ${file} → ${outPath}`);
    const min = minifyCSS(srcPath);
    writeFileSync(outPath, min, "utf8");
  }

  // Banner con versión
  const pkg = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));
  console.log(`\n✓ Build completo — Agrocity Kit v${pkg.version}`);
}

build().catch(err => {
  console.error("Build falló:", err);
  process.exit(1);
});
