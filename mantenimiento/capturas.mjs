// Uso: node mantenimiento/capturas.mjs <etiqueta> [url]
// Captura la página a 390 px y 1440 px de ancho en mantenimiento/capturas/.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'capturas');
const etiqueta = process.argv[2] || 'captura';
const url = process.argv[3] || 'http://127.0.0.1:8080/index.html';

// Usa el Chromium ya instalado en la PC (no descarga navegadores). Se puede cambiar con CHROMIUM_PATH.
const executablePath = process.env.CHROMIUM_PATH
  || path.join(process.env.LOCALAPPDATA || '', 'ms-playwright', 'chromium-1243', 'chrome-win64', 'chrome.exe');
const browser = await chromium.launch({ executablePath });
for (const width of [390, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errores = [];
  page.on('pageerror', e => errores.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  // Desactiva animaciones y transiciones para que dos capturas del mismo estado sean idénticas.
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
  // Fuerza las animaciones AOS para que todo el contenido sea visible.
  await page.evaluate(() => document.querySelectorAll('[data-aos]').forEach(el => el.classList.add('aos-animate')));
  // Quita el lazy loading y espera a que carguen todas las imágenes.
  await page.evaluate(async () => {
    const imgs = [...document.images];
    imgs.forEach(img => img.loading = 'eager');
    await Promise.all(imgs.map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; })));
  });
  // Fuerza la carga de todas las fuentes (Bootstrap Icons se pide recién cuando se usa un glifo).
  // A veces la fuente no llega a cargar: se reintenta recargando la página.
  for (let intento = 1; ; intento++) {
    const ok = await page.evaluate(async () => {
      await document.fonts.load('16px "bootstrap-icons"', '');
      await Promise.all([...document.fonts].map(f => f.load().catch(() => null)));
      await document.fonts.ready;
      return document.fonts.check('16px "bootstrap-icons"', '');
    });
    if (ok) break;
    if (intento === 3) { errores.push('Bootstrap Icons no cargó tras 3 intentos'); break; }
    await page.reload({ waitUntil: 'networkidle' });
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
    await page.evaluate(() => document.querySelectorAll('[data-aos]').forEach(el => el.classList.add('aos-animate')));
    await page.evaluate(async () => {
      const imgs = [...document.images];
      imgs.forEach(img => img.loading = 'eager');
      await Promise.all(imgs.map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; })));
    });
  }
  await page.waitForTimeout(1500);
  const archivo = path.join(dir, `${etiqueta}-${width}.png`);
  await page.screenshot({ path: archivo, fullPage: true });
  console.log(archivo, errores.length ? 'errores JS: ' + errores.join(' | ') : 'sin errores JS');
  await page.close();
}
await browser.close();
