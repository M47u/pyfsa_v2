// Genera variantes del wordmark "PyFsa" (texto "Py" + "Fsa" en dos colores,
// segun MARCA.md seccion 6). No reemplaza un logo vectorial de disenador:
// es un wordmark de texto, util como placeholder solido para foto de
// perfil, favicon temporal, documentos, etc.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PLANTILLAS = __dirname;
const OUT = path.join(__dirname, '..', 'marca-assets');
fs.mkdirSync(OUT, { recursive: true });

function build(tokens) {
  let html = fs.readFileSync(path.join(PLANTILLAS, 'logo.html'), 'utf-8');
  for (const [k, v] of Object.entries(tokens)) {
    html = html.split(`{{${k}}}`).join(v);
  }
  return html;
}

const variantes = [
  { nombre: 'logo-fondo-negro.png', tokens: { BG: '#080808', SIZE: '220' }, transparente: false },
  { nombre: 'logo-transparente.png', tokens: { BG: 'transparent', SIZE: '220' }, transparente: true },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  const tmpFile = path.join(PLANTILLAS, '_tmp_logo.html');
  for (const v of variantes) {
    fs.writeFileSync(tmpFile, build(v.tokens), 'utf-8');
    await page.goto('file://' + tmpFile.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
    await page.screenshot({
      path: path.join(OUT, v.nombre),
      omitBackground: v.transparente,
    });
    console.log('OK', v.nombre);
  }
  fs.unlinkSync(tmpFile);
  await browser.close();
})();
