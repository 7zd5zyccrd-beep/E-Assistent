// Erzeugt die drei PDFs aus den HTML-Vorlagen daneben (Chromium über Playwright).
// Aufruf aus diesem Ordner:  node erzeugen.mjs
// Die Seitengröße steht in den Vorlagen selbst (@page): 44 × 44 mm bzw. A4.
import { createRequire } from 'module';
import { execSync } from 'child_process';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();
for (const [quelle, ziel] of [
  ['druckvorlage.html',     'Pruefaufkleber 40mm - Druckvorlage.pdf'],
  ['mit-schnittlinie.html', 'Pruefaufkleber 40mm - mit Schnittlinie.pdf'],
  ['probebogen.html',       'Pruefaufkleber 40mm - Probebogen A4.pdf'],
]) {
  await p.setContent(fs.readFileSync(quelle, 'utf8'));
  await p.waitForTimeout(300);
  await p.pdf({ path: ziel, preferCSSPageSize: true, printBackground: true });
  console.log('geschrieben:', ziel);
}
await b.close();
