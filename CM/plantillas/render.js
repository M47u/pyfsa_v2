// Renderiza las piezas graficas de octubre 2026 a partir de las plantillas HTML.
// Uso: node cm/plantillas/render.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PLANTILLAS = __dirname;
const MEDIA = path.join(__dirname, '..', 'media');

function render(templateFile, tokens, outPath) {
  let html = fs.readFileSync(path.join(PLANTILLAS, templateFile), 'utf-8');
  for (const [k, v] of Object.entries(tokens)) {
    html = html.split(`{{${k}}}`).join(v);
  }
  return { html, outPath };
}

const specs = [
  render('relanzamiento-servicios.html', {
    BADGE: 'Estamos de vuelta',
    EYEBROW: 'PYFSA SOFTWARE',
    TITLE: 'El software que tu negocio necesita',
    ITEM1_TITLE: 'Comercios',
    ITEM1_DESC: 'Kioscos, autoservicios, tiendas: stock y ventas, sin planillas.',
    ITEM2_TITLE: 'Profesionales de la salud',
    ITEM2_DESC: 'Consultorios y clínicas que necesitan ordenar los turnos.',
    ITEM3_TITLE: 'Cualquier otro negocio',
    ITEM3_DESC: 'Si hoy lo resolvés a mano, lo armamos a medida.',
  }, '2026-10-01_volvemos/1.jpg'),

  render('relanzamiento-servicios.html', {
    BADGE: 'Nuevo por acá',
    EYEBROW: 'QUÉ HACEMOS',
    TITLE: 'Esto resolvemos todos los días',
    ITEM1_TITLE: 'Control de stock',
    ITEM1_DESC: 'Compras, ventas e inventario en un solo lugar.',
    ITEM2_TITLE: 'Seguimiento de obra',
    ITEM2_DESC: 'Materiales controlados, con reportes automáticos.',
    ITEM3_TITLE: 'Sitios web a medida',
    ITEM3_DESC: 'Pensados para lo que tu negocio necesita mostrar.',
  }, '2026-10-02_que-hacemos/1.jpg'),

  render('relanzamiento.html', {
    BADGE: 'Se viene',
    EYEBROW: 'DETRÁS DE ESCENA',
    TITLE: 'No es un sistema para gimnasios más',
    SUBTITLE: 'Arma rutinas con IA según el objetivo de cada socio, y avisa cuándo alguien empieza a faltar antes de que se dé de baja.',
  }, '2026-10-03_gym-saas-detras-escena/1.jpg'),

  render('columnas.html', {
    EYEBROW: 'CONSEJO PYFSA',
    TITLE: 'Ordená tu stock por rotación',
    ITEM1_TITLE: 'Rotación rápida',
    ITEM1_DESC: 'Nunca deben faltar en el local.',
    ITEM2_TITLE: 'Rotación media',
    ITEM2_DESC: 'Pedí menos cantidad y con más tiempo.',
    ITEM3_TITLE: 'Rotación lenta',
    ITEM3_DESC: 'Revisá si conviene seguir teniéndolos.',
  }, '2026-10-05_rotacion-stock/1.jpg'),

  render('mockup-dashboard.html', {
    EYEBROW: 'PANEL DE CONTROL DE STOCK',
    TITLE: 'Todo tu stock, de un vistazo',
    M1_LABEL: 'Ventas del mes', M1_VALUE: '128',
    M2_LABEL: 'Productos activos', M2_VALUE: '342',
    M3_LABEL: 'Alertas de stock bajo', M3_VALUE: '6',
  }, '2026-10-07_reporte-stock/1.jpg'),

  render('mockup-chart.html', {
    EYEBROW: 'PRODUCTOS MÁS VENDIDOS',
    TITLE: 'El reporte, con gráficos',
    V1: '58', H1: '90', L1: 'Producto A',
    V2: '44', H2: '68', L2: 'Producto B',
    V3: '31', H3: '48', L3: 'Producto C',
    V4: '19', H4: '30', L4: 'Producto D',
  }, '2026-10-07_reporte-stock/2.jpg'),

  render('hook.html', {
    EYEBROW: 'PROBLEMA FRECUENTE',
    TITLE: '¿Cuánto material queda en la obra?',
    SUBTITLE: 'Sin un registro claro, se compra de más y los números no cierran.',
  }, '2026-10-09_control-materiales-obra/1.jpg'),

  render('mockup-dashboard.html', {
    EYEBROW: 'SEGUIMIENTO DE OBRA',
    TITLE: 'El reporte semanal, listo solo',
    M1_LABEL: 'Obras activas', M1_VALUE: '5',
    M2_LABEL: 'Materiales usados', M2_VALUE: '214',
    M3_LABEL: 'Pendientes de registrar', M3_VALUE: '0',
  }, '2026-10-12_seguimiento-obra/1.jpg'),

  render('mockup-chart.html', {
    EYEBROW: 'MATERIALES POR OBRA',
    TITLE: 'Comparar obras, en segundos',
    V1: '72', H1: '85', L1: 'Obra 1',
    V2: '55', H2: '65', L2: 'Obra 2',
    V3: '40', H3: '47', L3: 'Obra 3',
    V4: '28', H4: '33', L4: 'Obra 4',
  }, '2026-10-12_seguimiento-obra/2.jpg'),

  render('hook.html', {
    EYEBROW: 'DETRÁS DE ESCENA',
    TITLE: 'Trabajamos remoto, desde Formosa',
    SUBTITLE: 'Con clientes de otras provincias y también del exterior.',
  }, '2026-10-14_equipo-remoto/1.jpg'),

  render('hook.html', {
    EYEBROW: 'PROBLEMA FRECUENTE',
    TITLE: 'La fila no avanza y la planilla se llena de tachones',
    SUBTITLE: 'Controlar el ingreso a mano genera demoras y errores en la puerta del evento.',
  }, '2026-10-16_control-acceso-eventos/1.jpg'),

  render('tip.html', {
    EYEBROW: 'TIP 1 DE 3', NUM: '01',
    TITLE: 'Un solo punto de entrada',
    SUBTITLE: 'No abras varios accesos al mismo tiempo: se pierde el control de quién entró.',
  }, '2026-10-19_organizar-acceso-eventos/1.jpg'),

  render('tip.html', {
    EYEBROW: 'TIP 2 DE 3', NUM: '02',
    TITLE: 'Registro nominal, no solo conteo',
    SUBTITLE: 'Saber cuántos entraron no alcanza: también hay que saber quiénes.',
  }, '2026-10-19_organizar-acceso-eventos/2.jpg'),

  render('tip.html', {
    EYEBROW: 'TIP 3 DE 3', NUM: '03',
    TITLE: 'Una persona fija en el control',
    SUBTITLE: 'No vayas rotando gente en la puerta: el criterio cambia y se pierden datos.',
  }, '2026-10-19_organizar-acceso-eventos/3.jpg'),

  render('mockup-dashboard.html', {
    EYEBROW: 'CONTROL DE ACCESO A EVENTOS',
    TITLE: 'El ingreso, controlado en vivo',
    M1_LABEL: 'Ingresos registrados', M1_VALUE: '184',
    M2_LABEL: 'Personas dentro', M2_VALUE: '172',
    M3_LABEL: 'Duplicados evitados', M3_VALUE: '3',
  }, '2026-10-21_qr-eventos-accion/1.jpg'),

  render('hook.html', {
    EYEBROW: 'PROBLEMA FRECUENTE',
    TITLE: '¿Y si te preguntan por algo que no tenés?',
    SUBTITLE: 'Pasa todos los días en kioscos, autoservicios y comercios de barrio.',
  }, '2026-10-23_falta-producto-comercio/1.jpg'),

  render('hook.html', {
    EYEBROW: 'CONSEJO PYFSA',
    TITLE: '¿Buscaste un dato y no lo encontraste?',
    SUBTITLE: 'Esa es la primera señal de que tu negocio necesita ordenar su información.',
  }, '2026-10-26_senales-desorden/1.jpg'),

  render('columnas.html', {
    EYEBROW: '3 SEÑALES',
    TITLE: '¿Te pasa alguna de estas?',
    ITEM1_TITLE: 'Datos duplicados',
    ITEM1_DESC: 'Anotás lo mismo en el cuaderno, la planilla y la cabeza.',
    ITEM2_TITLE: 'Nadie sabe dónde está',
    ITEM2_DESC: 'El equipo no encuentra los datos actualizados.',
    ITEM3_TITLE: 'Decisiones a ojo',
    ITEM3_DESC: 'Juntar la información lleva demasiado tiempo.',
  }, '2026-10-26_senales-desorden/2.jpg'),

  render('hook.html', {
    EYEBROW: 'DETRÁS DE ESCENA',
    TITLE: 'Primero escuchamos, después programamos',
    SUBTITLE: 'El asesoramiento inicial es gratuito. Contanos tu problema con tus palabras.',
  }, '2026-10-28_primera-charla/1.jpg'),

  render('comparacion.html', {
    EYEBROW: 'EL PRODUCTO EN ACCIÓN',
    TITLE: 'Antes y después del sitio',
    LEFT_CLASS: 'antes', LEFT_LABEL: 'Antes',
    LEFT_1: 'Carga lenta',
    LEFT_2: 'No se ve bien en el celular',
    LEFT_3: 'Información difícil de encontrar',
    RIGHT_CLASS: 'despues', RIGHT_LABEL: 'Después',
    RIGHT_1: 'Carga rápido',
    RIGHT_2: 'Se adapta a cualquier pantalla',
    RIGHT_3: 'Todo, prolijo y a la vista',
  }, '2026-10-30_sitio-web-antes-despues/1.jpg'),

  render('comparacion.html', {
    EYEBROW: 'EL PRODUCTO EN ACCIÓN',
    TITLE: 'Igual de bien en todas las pantallas',
    LEFT_CLASS: 'despues', LEFT_LABEL: 'Computadora',
    LEFT_1: 'Diseño prolijo',
    LEFT_2: 'Navegación clara',
    LEFT_3: 'Carga rápida',
    RIGHT_CLASS: 'despues', RIGHT_LABEL: 'Celular',
    RIGHT_1: 'Mismo diseño, adaptado',
    RIGHT_2: 'Botones fáciles de tocar',
    RIGHT_3: 'Carga igual de rápido',
  }, '2026-10-30_sitio-web-antes-despues/2.jpg'),
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  const tmpFile = path.join(PLANTILLAS, '_tmp_render.html');
  for (const spec of specs) {
    const outFull = path.join(MEDIA, spec.outPath);
    fs.mkdirSync(path.dirname(outFull), { recursive: true });
    // Se escribe a un archivo temporal junto a estilos.css para que los
    // enlaces relativos (estilos.css, fuentes) se resuelvan bien via file://.
    fs.writeFileSync(tmpFile, spec.html, 'utf-8');
    await page.goto('file://' + tmpFile.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
    await page.screenshot({ path: outFull, type: 'jpeg', quality: 92 });
    console.log('OK', spec.outPath);
  }
  fs.unlinkSync(tmpFile);
  await browser.close();
})();
