# Pendientes de decisión - PyFsa Software

Decisiones y datos que solo puede aportar el dueño del sitio. Cada punto trae el cambio listo para aplicar cuando haya respuesta. Los números de línea corresponden a `index.html` en la rama `mantenimiento/noche-2026-09-24` al momento de escribirse cada punto y pueden correrse unas líneas después de otros cambios. Conviene buscar por texto.

---

## P01 - Número de WhatsApp (T02)

**Qué hay que confirmar:** si el número de WhatsApp es el celular `+54 9 3704 21-6650`.

Hoy el sitio usa `543704216650` y lo muestra como `+54 370 421 6650`. En Argentina, los enlaces de WhatsApp a celulares llevan el 9 después del 54, y el código de área de Formosa es **3704**. El formato visible actual parte el número como 370 / 421 / 6650, lo que sugiere un código de área de 3 dígitos que no corresponde.

Ocurrencias (`grep -n '543704216650\|421 6650' index.html`):

| Línea | Dónde | Texto actual |
|---|---|---|
| 60 | JSON-LD `telephone` | `"+543704216650"` |
| 112 | Botón del hero | `https://wa.me/+543704216650?text=...` |
| 234 | Tarjeta "Soluciones a medida" | `https://wa.me/+543704216650?text=...` |
| 298 | Bloque CTA "Escribinos por WhatsApp" | `https://wa.me/+543704216650?text=...` |
| 574 | Contacto (enlace y texto visible) | `https://wa.me/+543704216650?text=...` / `+54 370 421 6650` |
| 642 | Footer (enlace y texto visible) | `https://wa.me/+543704216650` / `+54 370 421 6650` |
| 653 | Botón flotante | `https://wa.me/+543704216650?text=...` |

**Cambio propuesto** (6 enlaces, 1 JSON-LD, 2 textos visibles; probado sobre una copia):

- JSON-LD: `"telephone": "+5493704216650"`
- Enlaces: `https://wa.me/5493704216650...` La guía de `wa.me` pide el número internacional sin `+`, sin ceros ni guiones. Hoy funciona con `+`, pero conviene quitarlo.
- Texto visible: `+54 9 3704 21-6650`

Comandos para aplicarlo cuando se confirme:

```bash
sed -i 's#wa\.me/+543704216650#wa.me/5493704216650#g; s#"telephone": "+543704216650"#"telephone": "+5493704216650"#; s#+54 370 421 6650#+54 9 3704 21-6650#g' index.html
grep -n '543704216650\|5493704216650\|6650' index.html   # verificar: 6 enlaces, 1 telephone, 2 textos
```

Nota: `preview/index.html` no se tocó (fuera de alcance).

---

## P02 - Cifras del hero vs. contenido de la página (T03)

| Afirmación | Dónde | Lo que muestra el sitio |
|---|---|---|
| "5 Programadores" | Hero, línea 122 | La sección Equipo muestra 3 personas (Daniel Rojas, Marcos Franco, Matías Aveiro). |
| "+11 Clientes" | Hero, línea 127 | La sección Clientes muestra 6 logos. Cuatro tienen texto alternativo genérico (`client-1.png` a `client-4.png`). |

**Qué hay que decidir:** si las cifras son correctas (por ejemplo, hay programadores o clientes que no figuran), o cuáles son las cifras reales. No se cambió nada. Cuando haya respuesta, se editan solo los `<span class="stat-number">` de las líneas 122 y 127, o se agregan integrantes o logos si faltan.

## P03 - Compromisos comerciales de la FAQ y del sitio (T03)

La FAQ y otros textos afirman lo siguiente. Hay que confirmar que son compromisos reales que PyFsa cumple:

- Soporte post-entrega en **todos** los proyectos: "Todos nuestros proyectos incluyen un período de soporte post-entrega" (FAQ 2). También menciona "planes de mantenimiento continuo".
- Capacitación incluida: "La capacitación está incluida en la entrega" (FAQ 5). También afirma "Cualquier empleado puede aprender a usarlo en minutos".
- Plazos: "Un sistema básico puede estar listo en 2 a 4 semanas. Proyectos más complejos [...] 1 a 3 meses" (FAQ 1).
- Instancias gratuitas: "relevamiento gratuito" (FAQ 1), "cotización gratuita y sin compromiso" (FAQ 4), "reunión gratuita" (FAQ 6), "Asesoramiento gratuito" (hero) y "El asesoramiento es gratis" (bloque CTA).

Si alguno no aplica siempre, el dueño debe indicar el texto que lo reemplaza. No se modificó ningún texto comercial.

## P04 - Autorización de testimonios (T03)

Hay tres testimonios atribuidos por nombre (líneas 318 a 358):

- **Renco**, "Desarrollos inmobiliarios".
- **Innova**, "Inmobiliaria".
- **San Simón SRL**, "Empresa constructora".

**Qué hay que confirmar:** que cada cliente autorizó publicar el texto con su nombre, idealmente por escrito. Si alguno no autorizó, las alternativas son quitar la tarjeta o anonimizarla (por ejemplo "Inmobiliaria de Formosa"). El texto lo decide el dueño.

## P05 - Año del copyright (T03)

- `index.html` línea 646: `&copy; 2021 PyFsa Software. Todos los derechos reservados.`
- `preview/index.html` línea 643: `&copy; 2025 PyFsa Software.`

**Qué hay que decidir:** el año o rango deseado. Opciones habituales: `2021-2026` (año de inicio y año actual) o solo el año actual. Cambio: editar esa línea de `index.html`. `preview/` queda fuera de alcance.

---

## P06 - Enlaces de redes sociales vacíos (T04)

Todos los íconos de redes apuntan a `href="#"`: al hacer clic, la página salta al inicio. Ocurrencias (`grep -n 'href="#"' index.html`):

| Línea | Enlace |
|---|---|
| 413 / 414 | Instagram / LinkedIn de Daniel Rojas |
| 429 / 430 | Instagram / LinkedIn de Marcos Franco |
| 445 / 446 | Instagram / LinkedIn de Matías Aveiro |
| 580 / 581 / 582 | Instagram / Facebook / LinkedIn de PyFsa Software (bloque de contacto) |

(La línea 658, `back-to-top`, también usa `href="#"`, pero es el botón "volver arriba" y funciona como corresponde.)

**Datos necesarios:** URL de Instagram, Facebook y LinkedIn de la empresa, y URL de Instagram y LinkedIn de cada integrante (o cuáles no existen o no se quieren mostrar).

**Alternativas:**

1. **Completar los enlaces:** reemplazar cada `href="#"` por la URL real y agregar `target="_blank" rel="noopener"`, como en los enlaces de WhatsApp. Ejemplo:
   `<a href="https://www.instagram.com/USUARIO/" target="_blank" rel="noopener" aria-label="Instagram de PyFsa Software"><i class="bi bi-instagram"></i></a>`
2. **Quitar los íconos que no se usen:** borrar la línea `<a ...>` correspondiente. Si una tarjeta del equipo queda sin redes, se puede borrar todo su `<div class="member-social">`. El diseño de la tarjeta lo tolera, pero conviene revisarlo visualmente.

No se inventaron URLs.

---

## P07 - Botón del menú móvil no accesible (T11)

**Problema:** el botón que abre el menú en pantallas de hasta 991 px es un `<i class="bi bi-list mobile-nav-toggle"></i>` (`index.html` línea 89). Un `<i>` no recibe foco con Tab, no se activa con Enter ni Espacio, no tiene nombre accesible y no anuncia si el menú está abierto o cerrado. Quien navega con teclado o lector de pantalla no puede abrir el menú en móvil.

**Cambio propuesto** (no aplicado):

HTML (`index.html` línea 89):

```html
<button type="button" class="mobile-nav-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="navbar">
  <i class="bi bi-list" aria-hidden="true"></i>
</button>
```

JS (`assets/js/main.js`, líneas 116 a 120 y 139 a 144): alternar las clases en el `<i>` interno y actualizar los atributos ARIA. Reemplazar el manejador del toggle por:

```js
  function setMobileNav(abierto) {
    select('#navbar').classList.toggle('navbar-mobile', abierto)
    let toggle = select('.mobile-nav-toggle')
    toggle.setAttribute('aria-expanded', abierto ? 'true' : 'false')
    toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú')
    let icono = toggle.querySelector('i')
    icono.classList.toggle('bi-list', !abierto)
    icono.classList.toggle('bi-x', abierto)
  }

  on('click', '.mobile-nav-toggle', function(e) {
    setMobileNav(!select('#navbar').classList.contains('navbar-mobile'))
  })
```

En el manejador de `.scrollto`, reemplazar el bloque que hace `navbar.classList.remove('navbar-mobile')` y alterna `bi-list` / `bi-x` por `setMobileNav(false)`.

CSS (`assets/css/style.css`, regla `.mobile-nav-toggle`, línea 163): el `<button>` trae estilos del navegador. Agregar:

```css
.mobile-nav-toggle {
  background: none;
  border: 0;
  padding: 0;
}
.mobile-nav-toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
```

Opcional: cerrar el menú con la tecla Escape.

**Verificación sugerida:** capturas a 390 px con el menú abierto y cerrado, y navegación con Tab/Enter.

## P08 - Contraste de colores (T11)

Relaciones de contraste calculadas con la fórmula WCAG 2.x. El mínimo AA es 4.5:1 para texto normal y 3:1 para texto grande o íconos.

| Uso | Colores | Contraste | Resultado |
|---|---|---|---|
| `--text-faint` en `.service-number`, `.cta-or` ("o"), `.contact-detail strong` ("Ubicación", "Email", "WhatsApp"), `.footer-bottom` (copyright) y placeholders del formulario | `#3a3a3a` sobre `#080808` a `#161616` | 1.6 a 1.8:1 | **No cumple.** El copyright, las etiquetas de contacto y los placeholders ("Tu nombre", "Tu correo") casi no se leen en las capturas. |
| Texto blanco del botón "Escribinos por WhatsApp" (`.cta-whatsapp-btn`) | `#ffffff` sobre `#25D366` | 1.98:1 | **No cumple** (15 px, peso 500). El ícono blanco del botón flotante (`.whatsapp-float`) tampoco llega al 3:1 que se pide para íconos. |
| `--text-muted` | `#888888` sobre `#080808` / `#161616` | 5.65 / 5.10:1 | Cumple. |
| Texto principal y botones con acento | | 15:1 o más | Cumple. |

**Propuestas** (cambios de diseño: requieren aprobación y no se aplicaron):

- Subir `--text-faint` a un gris que llegue a 4.5:1 sobre `#161616`, por ejemplo `#7f7f7f` (4.52:1 sobre `#161616`; `#7a7a7a` no alcanza: 4.22:1). Otra opción: usar `--text-muted` (`#888`) en `.footer-bottom`, `.contact-detail strong` y los placeholders, y dejar `--text-faint` solo para elementos decorativos como `.service-number`.
- Botón de WhatsApp: texto oscuro (`color: #080808`, 10.1:1) o un verde más oscuro de fondo (por ejemplo `#128C7E` con texto blanco: 4.14:1, cumple solo para texto grande). Es un cambio de identidad visual y lo decide el dueño.

---

## P09 - Imagen para compartir en redes (og:image) (T05)

**Situación:** `og:image` apunta a `https://pyfsasoftware.com.ar/assets/img/iconPyfsa_final.png`, el ícono del sitio (682x675 px, casi cuadrado). Al compartir el enlace en WhatsApp, Facebook o LinkedIn, la vista previa se ve chica o recortada. `twitter:card` es `summary` (miniatura chica) y no define `twitter:image`.

**Dato necesario:** una imagen de **1200x630 px** (JPG o PNG, idealmente de menos de 300 KB) con la identidad de PyFsa. No se generó ninguna para no inventar diseño.

**Cambio listo para cuando exista** (suponiendo que se guarde como `assets/img/og-pyfsa.jpg`):

```html
<meta property="og:image" content="https://pyfsasoftware.com.ar/assets/img/og-pyfsa.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="PyFsa Software - Sistemas web y apps a medida">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://pyfsasoftware.com.ar/assets/img/og-pyfsa.jpg">
```

(reemplaza la línea `og:image` actual y la de `twitter:card`).

---

## P10 - Nombre del cliente del logo `client-1.png` (T06)

El logo muestra un enchufe y el texto "ELECTRO D?". La última letra no se distingue con seguridad entre **A** y **R**: la imagen mide 101x101 px y la tipografía es muy estilizada, incluso ampliada. Se dejó el `alt` actual ("Cliente 1 de PyFsa Software").

**Dato necesario:** el nombre exacto de la empresa. **Cambio listo:** en `index.html`, reemplazar `alt="Cliente 1 de PyFsa Software"` por `alt="Logo de <NOMBRE>, cliente de PyFsa Software"`.

Nota aparte: los seis logos miden 101x101 px y se ven borrosos en pantallas de alta densidad. Si el dueño tiene los originales, conviene exportarlos a unos 300x300 px.

---

## P11 - Carpeta `preview/` (T07)

`preview/` (105 archivos, unos 15 MB) es una copia **anterior** del sitio, no idéntica:

- `index.html`: usa `col-lg-4 col-md-6` en lugar de `col-sm-6 col-lg-4` (9 tarjetas) y dice `&copy; 2025`.
- `assets/css/style.css`: le falta todo el bloque "RESPONSIVE" del final (unas 155 líneas).
- `assets/img/team/`: tiene además versiones JPG de las fotos del equipo (`Pyfsa_*.jpg`, `Pyfsa_*__.jpeg`), que no están en la raíz.
- `forms/contact.php` y `sitemap.xml`: iguales a los de `main` (sin los cambios de esta rama).

**Qué hay que decidir:** si `preview/` todavía cumple alguna función (por ejemplo, un entorno de prueba en el hosting). Si no:

```bash
git rm -r preview
git commit -m "chore(repo): elimina la copia preview/ del sitio"
```

Si se conserva, recordar que no debe subirse al hosting (el README lo indica). No se tocó (solo se eliminó `preview/.atl/`, autorizado en T07).

## P12 - `inner-page.html` (T07)

Es el remanente de la plantilla de BootstrapMade. **Ningún archivo del sitio lo enlaza.** Solo aparece mencionado en `changelog.txt` (el changelog de la plantilla) y en su copia de `preview/`. `checks.py` le encuentra 9 anclas sin destino (`#hero`, `#about`, `#pricing`, `#gallery`, etc., del menú original). Si está publicado en el hosting, es accesible en `/inner-page.html` y se ve como una página rota de la plantilla.

**Propuesta:** eliminarlo (`git rm inner-page.html`) y, si ya está en el servidor, borrarlo también allá. `changelog.txt` es el changelog de la plantilla y tampoco aporta al sitio: se puede eliminar en el mismo commit, o conservar como referencia de la versión de la plantilla.

## P13 - Herramientas de desarrollo: `screenshot.mjs`, `package.json`, `package-lock.json` (T07)

- `screenshot.mjs` tiene rutas fijas de XAMPP (`http://localhost/pyfsasoftware_orig/` y `C:/xampp/htdocs/pyfsasoftware_orig/screenshots`), que corresponden a otra carpeta (`pyfsasoftware_orig`, no `pyfsa_v22`). Así como está no funciona en este repo. Para capturas se puede usar `mantenimiento/capturas.mjs`, que sirve el sitio con `php -S` y no depende de XAMPP.
- `package.json` solo declara `playwright` (el nombre `pyfsasoftware_orig` también es heredado). Son herramientas de desarrollo: **no se suben al hosting**, igual que `node_modules/`.
- Nota: Playwright 1.60 espera un navegador (`chromium_headless_shell-1223`) que no está descargado en esta PC. Los scripts de `mantenimiento/` usan el Chromium ya instalado (`chromium-1243`). Para usar `screenshot.mjs` habría que correr `npx playwright install chromium`.

**Propuesta:** eliminar `screenshot.mjs` (reemplazado por `mantenimiento/capturas.mjs`) o corregir sus rutas; decisión del dueño.

## P14 - Otros hallazgos de orden del repositorio (T07)

- **`default.php` en el servidor:** se eliminó del repo, pero si sigue en el hosting hay que borrarlo allá también. Según la configuración del servidor, puede mostrarse en lugar del sitio o quedar accesible en `/default.php`.
- **Archivos sin seguimiento en la raíz:** `.claude/`, `PROMPT_NOCHE.md` y `files.zip` (este último contiene copias del backlog, del prompt y de la definición del agente). No se agregaron al `.gitignore` porque no estaban en la lista de T07. Propuesta: sumarlos al `.gitignore`, o versionar `.claude/agents/` si se quiere compartir el agente, y en cualquier caso no subirlos al hosting.
- **Fin de línea:** el repo tiene `core.autocrlf=true`. Con esa configuración, `mantenimiento/pruebas-formulario.sh` puede quedar con CRLF en otro clon y fallar en bash. Propuesta: agregar un `.gitattributes` con `*.sh text eol=lf`.
