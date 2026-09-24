// Compara dos capturas píxel a píxel usando canvas en Chromium (sin dependencias extra).
// Uso: node mantenimiento/comparar.mjs <etiquetaA> <etiquetaB>   (compara 390 y 1440)
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'capturas');
const [a, b] = process.argv.slice(2);
const executablePath = process.env.CHROMIUM_PATH
  || path.join(process.env.LOCALAPPDATA || '', 'ms-playwright', 'chromium-1243', 'chrome-win64', 'chrome.exe');
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage();
let distintas = 0;
for (const w of [390, 1440]) {
  const uri = e => 'data:image/png;base64,' + readFileSync(path.join(dir, `${e}-${w}.png`)).toString('base64');
  const r = await page.evaluate(async ([ua, ub]) => {
    const cargar = u => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = u; });
    const [ia, ib] = await Promise.all([cargar(ua), cargar(ub)]);
    const datos = i => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height;
      const x = c.getContext('2d'); x.drawImage(i, 0, 0); return x.getImageData(0, 0, i.width, i.height).data; };
    const res = { a: `${ia.width}x${ia.height}`, b: `${ib.width}x${ib.height}`, pix: null, primeraFila: null };
    if (res.a !== res.b) return res;
    const da = datos(ia), db = datos(ib); let n = 0;
    for (let p = 0; p < da.length; p += 4) {
      if (Math.abs(da[p]-db[p]) + Math.abs(da[p+1]-db[p+1]) + Math.abs(da[p+2]-db[p+2]) > 30) {
        if (n === 0) res.primeraFila = Math.floor(p / 4 / ia.width); n++; }
    }
    res.pix = n; return res;
  }, [uri(a), uri(b)]);
  const igual = r.a === r.b && r.pix === 0;
  if (!igual) distintas++;
  console.log(`${w}px: ${r.a} vs ${r.b}` + (r.pix === null ? ' (tamaño distinto)' : `, píxeles distintos: ${r.pix}` + (r.pix ? ` (desde la fila ${r.primeraFila})` : '')));
}
await browser.close();
process.exit(distintas ? 1 : 0);
