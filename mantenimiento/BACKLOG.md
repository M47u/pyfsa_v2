# Backlog de mantenimiento - PyFsa Software

Fuente de verdad del agente `pyfsa-mantenimiento`. Estados posibles: pendiente, en curso, hecha, bloqueada, decisión humana.

Origen: revisión del repositorio `pyfsa_v2` (commit `2286e4f`, 23/09/2026).

## Orden de ejecución

T01, T02, T03, T04, T11, T09, T05, T06, T07, T08, T10, T12

Las tareas SOLO REGISTRAR (T02, T03, T04, T11) van temprano porque son rápidas y garantizan que `PENDIENTES.md` exista aunque la ejecución se corte.

---

## T01 - Formulario de contacto seguro y funcional (APLICAR) - estado: hecha (3db8603)

Problemas detectados:
- `forms/contact.php` pasa el email del visitante directo a las cabeceras de `mail()`: permite inyección de cabeceras (spam desde el hosting).
- No valida campos vacíos, formato de email ni longitudes.
- Responde JSON, pero `assets/vendor/php-email-form/validate.js` exige HTTP 200 con el texto exacto `OK`. Es probable que el formulario muestre error aunque el correo se envíe. Confirmarlo leyendo `validate.js` antes de cambiar nada.

Requisitos:
- Aceptar solo POST. Un GET redirige a `../index.html`.
- Recortar (`trim`) y validar: nombre hasta 100 caracteres, asunto hasta 150, mensaje hasta 5000, email con `filter_var(..., FILTER_VALIDATE_EMAIL)`.
- Rechazar cualquier CR o LF en nombre, email y asunto.
- Cabecera `From` fija con el dominio propio (`info@pyfsasoftware.com.ar`) y `Reply-To` con el email validado del visitante. Cuerpo en texto plano UTF-8 con `Content-Type: text/plain; charset=UTF-8`. Asunto codificado correctamente para tildes.
- Honeypot: agregar en el formulario de `index.html` un campo oculto (por ejemplo `name="website"`, `tabindex="-1"`, `autocomplete="off"`, `aria-hidden="true"`, fuera de pantalla). Si llega con contenido, responder `OK` sin enviar nada.
- Respuesta compatible con `validate.js`: éxito con `OK` y HTTP 200; errores con HTTP 200 y un texto de error breve en español (o el código HTTP que `validate.js` maneje bien; verificar leyendo el archivo). No exponer detalles internos.
- No modificar `assets/vendor/`.

Criterio de aceptación:
- `php -l` sin errores.
- Pruebas locales con `php -S` y `curl` para todos los casos listados en la sección Verificaciones del agente. La inyección de cabeceras debe ser rechazada.
- Captura visual del formulario sin cambios de diseño (el honeypot no debe verse).

## T02 - Número de WhatsApp (SOLO REGISTRAR) - estado: pendiente

- Listar con `grep -n` todas las ocurrencias de `543704216650` y `421 6650` en `index.html` (enlaces `wa.me`, texto visible, footer, JSON-LD `telephone`).
- En `PENDIENTES.md`, dejar el reemplazo propuesto listo para aplicar cuando el dueño confirme: enlace `+5493704216650` (celular con 9), y formato visible `+54 9 3704 21-6650`. Aclarar que el código de área de Formosa es 3704 y que el número actual se muestra partido en 370 / 421 / 6650.
- No modificar ningún archivo del sitio.

## T03 - Inconsistencias de contenido (SOLO REGISTRAR) - estado: pendiente

Registrar en `PENDIENTES.md`, sin cambiar nada:
- El hero dice "5 Programadores" y la sección Equipo muestra 3 personas.
- El hero dice "+11 Clientes" y la sección Clientes muestra 6 logos (cuatro con nombre genérico).
- La FAQ afirma soporte post-entrega en todos los proyectos, capacitación incluida, plazos de 2 a 4 semanas y 1 a 3 meses, y reunión inicial gratuita: el dueño debe confirmar que son compromisos reales.
- Los tres testimonios están atribuidos por nombre a Renco, Innova y San Simón SRL: confirmar autorización de cada cliente para publicarlos.
- Diferencia de copyright entre `index.html` (2021) y `preview/index.html` (2025): confirmar el año deseado.

## T04 - Enlaces de redes sociales vacíos (SOLO REGISTRAR) - estado: pendiente

- Listar con `grep -n` todos los `href="#"` en las tarjetas del equipo y en el bloque de redes de contacto.
- En `PENDIENTES.md`, pedir las URLs reales (Instagram, Facebook, LinkedIn de la empresa y de cada integrante) y describir las dos alternativas: completar los enlaces o quitar los íconos que no se usen. No inventar URLs.

## T11 - Accesibilidad (SOLO REGISTRAR) - estado: pendiente

- Revisar `index.html` y `assets/js/main.js`: el botón del menú móvil es un `<i class="bi bi-list mobile-nav-toggle">`, que no es operable con teclado ni anuncia su estado.
- En `PENDIENTES.md`, proponer el cambio (botón real con `aria-label` y `aria-expanded`) indicando qué habría que ajustar en HTML, CSS y JS. No aplicar.
- Anotar también cualquier problema de contraste evidente que se detecte en las capturas.

## T09 - Auditoría de HTML y enlaces (APLICAR) - estado: pendiente

- Crear `mantenimiento/checks.py` y ejecutarlo sobre `index.html`.
- Corregir solo lo mecánico: enlaces locales rotos, ids duplicados, anclas sin destino, `target="_blank"` sin `rel="noopener"`, etiquetas sin cerrar. Un `alt=""` en una imagen decorativa es válido: no tocarlo.
- Lo que requiera una decisión de contenido va a `PENDIENTES.md`.

Criterio de aceptación: el script no reporta errores mecánicos y las capturas antes y después son equivalentes.

## T05 - SEO técnico menor (APLICAR) - estado: pendiente

- Agregar `<link rel="canonical" href="https://pyfsasoftware.com.ar/">`, `og:locale` con `es_AR` y `og:site_name` con `PyFsa Software`.
- Actualizar `lastmod` de `sitemap.xml` a la fecha del día (`date +%F`).
- Eliminar el comentario obsoleto de Google Analytics que dice "reemplazar G-XXXXXXXXXX" (el ID ya está cargado; no modificar el ID).
- Verificar que `robots.txt` apunte al sitemap correcto.
- `og:image`: SOLO REGISTRAR. Hoy usa el ícono chico; para compartir en redes hace falta una imagen de 1200x630 px que debe aportar el dueño.

## T06 - Texto alternativo de logos de clientes (APLICAR condicional) - estado: pendiente

- Abrir cada imagen de `assets/img/clients/` con la herramienta de lectura.
- Si el nombre de la empresa es legible en el logo, actualizar el `alt` (por ejemplo "Logo de X, cliente de PyFsa Software"). Si no se lee con seguridad, dejar el `alt` actual y anotar el archivo en `PENDIENTES.md`.

## T07 - Higiene del repositorio (APLICAR) - estado: pendiente

Commit 1, `.gitignore`: `node_modules/`, `*.log`, `.DS_Store`, `Thumbs.db`, `mantenimiento/capturas/`, `screenshots/`.

Commit 2, separado, con `git rm`: `default.php`, `default.php.old.php` (página por defecto de Hostinger) y `preview/.atl/` (contiene rutas locales de la PC del dueño).

Solo registrar en `PENDIENTES.md`, sin tocar: `preview/` (copia casi idéntica del sitio), `inner-page.html` (remanente de la plantilla: indicar si algún archivo lo enlaza), `screenshot.mjs` y `package.json` (herramientas de desarrollo: recordar que `screenshot.mjs` usa rutas de XAMPP).

## T08 - Peso de imágenes (APLICAR condicional) - estado: pendiente

- Listar imágenes de más de 250 KB con su tamaño. Las fotos del equipo (`assets/img/team/Pyfsa_*.png`) pesan más de 1 MB cada una.
- Si hay Pillow o `sharp`, generar versiones WebP de las fotos del equipo (ancho máximo 800 px, calidad cercana a 82) junto a los originales, sin borrar estos.
- Cambiar el `src` en `index.html` a la versión WebP solo si la comparación visual antes y después es equivalente. Commit separado para poder revertirlo solo.
- Si no hay herramientas o falla la verificación visual, registrar los pesos y la propuesta en `PENDIENTES.md`.

## T10 - README del proyecto (APLICAR) - estado: pendiente

Crear `README.md` en la raíz (hoy no existe en este repo) con: qué es el proyecto; estructura de carpetas; cómo probarlo localmente (`php -S 127.0.0.1:8080`); qué archivos se suben al hosting y cuáles no; cómo usar el agente de mantenimiento y sus archivos en `mantenimiento/`. No incluir datos sensibles ni credenciales.

## T12 - Cierre (APLICAR) - estado: pendiente

- Ejecutar todas las verificaciones una última vez sobre el estado final de la rama.
- Confirmar que `git status` está limpio y que ningún commit tocó `assets/vendor/` ni `preview/` (única excepción autorizada: la eliminación de `preview/.atl/` en T07).
- Escribir `mantenimiento/INFORME.md` según el formato del agente y hacer el commit final.
