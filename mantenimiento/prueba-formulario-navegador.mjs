// Envía el formulario real desde el navegador (validate.js) contra un servidor local.
// Uso: node mantenimiento/prueba-formulario-navegador.mjs [url base]  (por defecto http://127.0.0.1:8081)
import { chromium } from 'playwright';
import path from 'node:path';

const base = process.argv[2] || 'http://127.0.0.1:8081';
const executablePath = process.env.CHROMIUM_PATH
  || path.join(process.env.LOCALAPPDATA || '', 'ms-playwright', 'chromium-1243', 'chrome-win64', 'chrome.exe');
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base + '/index.html');

const honeypot = page.locator('input[name="website"]');
const caja = await honeypot.boundingBox();
console.log('honeypot fuera de pantalla:', caja === null || caja.x + caja.width <= 0);

let fallas = 0;
async function enviar(desc, datos, selectorEsperado, textoEsperado) {
  await page.reload();
  for (const [k, v] of Object.entries(datos)) await page.fill(`[name="${k}"]`, v);
  await page.click('.php-email-form button[type="submit"]');
  const el = page.locator(selectorEsperado);
  try {
    await el.waitFor({ state: 'visible', timeout: 5000 });
    const texto = (await el.innerText()).trim();
    const ok = !textoEsperado || texto === textoEsperado;
    if (!ok) fallas++;
    console.log(ok ? 'ok   ' : 'FALLA', desc, '->', texto);
  } catch { fallas++; console.log('FALLA', desc, '-> no apareció', selectorEsperado); }
}
const validos = { name: 'Juan Pérez', email: 'juan@example.com', subject: 'Cotización', message: 'Hola, quería consultar.' };
await enviar('envío válido muestra éxito', validos, '.sent-message');
await enviar('nombre largo muestra error en español', { ...validos, name: 'a'.repeat(101) }, '.error-message',
  // validate.js antepone "Error: " porque muestra el objeto Error completo (vendor, no se edita).
  'Error: El nombre, el asunto o el mensaje son demasiado largos.');
await browser.close();
console.log('Fallas:', fallas);
process.exit(fallas);
