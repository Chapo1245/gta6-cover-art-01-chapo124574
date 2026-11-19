import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// Neon Coast Cover Studio — entry program for make.fun gta6-cover-art-01.
// Copies app/ + screenshots/ from this repo into the output dir and writes
// /output/dossier.json with the kit's buildDossier. Node 22, stdlib only.

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname);
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');

if (!existsSync(join(appDir, 'index.html')) || !statSync(join(appDir, 'index.html')).isFile()) {
  throw new Error('gate: app/index.html is missing');
}
if (!existsSync(shotsDir) || !statSync(shotsDir).isDirectory()) {
  throw new Error('gate: screenshots/ is missing');
}
const shots = readdirSync(shotsDir)
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  .filter((f) => statSync(join(shotsDir, f)).isFile())
  .sort();
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`gate: screenshots/ must hold 3-4 images, found ${shots.length}`);
}
for (const f of shots) {
  const bytes = statSync(join(shotsDir, f)).size;
  if (bytes > 262144) throw new Error(`gate: screenshot ${f} is ${bytes} bytes, over the 256 KiB cap`);
}

mkdirSync(outDir, { recursive: true });
cpSync(appDir, join(outDir, 'app'), { recursive: true });
cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`wrote ${join(outDir, 'dossier.json')} (${dossier.length} bytes) with ${shots.length} screenshots: ${shots.join(', ')}`);
// Entry: Neon Coast Cover Studio — Vice City Cover Studio (gta6-cover-art-01).
