# Bitácora de mantenimiento

Rama: `mantenimiento/noche-2026-09-24` (creada desde `main` en `2286e4f`).

## 2026-09-24 - Preparación del entorno

- `git status` al inicio: sin cambios en archivos versionados. Solo había archivos sin seguimiento que forman el kit de instrucciones (`.claude/`, `PROMPT_NOCHE.md`, `files.zip`, `mantenimiento/`). Se consideró el árbol limpio y se continuó. `.claude/`, `PROMPT_NOCHE.md` y `files.zip` quedan sin seguimiento a propósito (no son parte del sitio).
- Herramientas detectadas:
  - PHP 8.2.12 (CLI de XAMPP): disponible. Servidor local con `php -S 127.0.0.1:8080`.
  - Node v22.23.2 / npm 10.9.8: disponible. Se ejecutó `npm ci` (existe `package-lock.json`): instala `playwright` 1.60.0 en `node_modules/` local.
  - Python 3.13.14: disponible. Pillow: NO instalado (no se instaló).
  - Playwright: el navegador que espera la versión 1.60 (`chromium_headless_shell-1223`) no está descargado. No se ejecutó `npx playwright install`. Se usa el Chromium ya presente en `%LOCALAPPDATA%\ms-playwright\chromium-1243` vía `executablePath`. Funciona.
  - curl: disponible.
- Verificación visual: `mantenimiento/capturas.mjs <etiqueta>` captura `index.html` a 390 y 1440 px en `mantenimiento/capturas/` (no se commitean). Fuerza AOS, quita el lazy loading y espera las fuentes para que las capturas sean comparables.
- Capturas base: `antes-390.png`, `antes-1440.png`. Sin errores de JS en consola.

### Herramientas de verificación (commit `cfb45b5`)

- `capturas.mjs`: además de lo anterior, desactiva animaciones CSS y fuerza la carga de Bootstrap Icons. Tres capturas seguidas del mismo estado dan 0 píxeles distintos.
- `comparar.mjs <a> <b>`: compara dos capturas píxel a píxel (canvas en Chromium, sin dependencias nuevas).
- Línea base: `main` extraído con `git archive` a una carpeta temporal y servido en `127.0.0.1:8082` (no toca el árbol de trabajo).
- `pruebas-formulario.sh`: 18 casos contra `php -S 127.0.0.1:8081` con `sendmail_path` apuntando a `capturar-mail.php`, que guarda los correos en `mantenimiento/capturas/mails/` en lugar de enviarlos.
- `prueba-formulario-navegador.mjs`: envía el formulario real desde Chromium a través de `validate.js`.

## T01 - Formulario de contacto (commit `3db8603`)

- Qué: se reescribió `forms/contact.php` y se agregó un honeypot `website` en el formulario de `index.html` (oculto con estilo inline, fuera de pantalla, `tabindex="-1"`, `autocomplete="off"`, `aria-hidden="true"`). No se tocó `assets/vendor/` ni el CSS.
- Por qué: el email del visitante iba directo a las cabeceras de `mail()` (inyección de cabeceras); no había validaciones; y la respuesta JSON hacía que `validate.js` mostrara siempre error, porque exige HTTP 200 con el texto exacto `OK` (confirmado leyendo el archivo).
- Decisión: los errores responden HTTP 200 con un texto breve. Con un código 4xx/5xx, `validate.js` muestra "400 Bad Request <url>", que expone la URL y no ayuda al visitante. `validate.js` antepone "Error: " al texto (muestra el objeto Error completo). Es comportamiento del vendor y no se modificó.
- Asunto: `mb_encode_mimeheader` (UTF-8, base64, plegado RFC 2047), con alternativa manual si el hosting no tiene mbstring. `display_errors` desactivado en el script para no filtrar avisos internos.
- Verificación:
  - `php -l`: sin errores.
  - `pruebas-formulario.sh`: 18/18 ok (GET redirige 302 a `../index.html`, POST válido, vacíos, solo espacios, POST sin datos, campo como array, email inválido, inyección `%0d%0aBcc:` en email/nombre/asunto, solo LF, honeypot, límites 100/101 con tildes, asunto 151, mensaje 5001). Solo se generaron 2 correos (el honeypot no envía). Cabeceras correctas y sin `Bcc`.
  - Navegador: el envío válido muestra "Tu mensaje fue enviado con éxito. ¡Gracias!" y un nombre largo muestra el error en español. El honeypot queda fuera de pantalla.
  - Visual: `main` vs T01 con 0 píxeles distintos a 390 y 1440 px.
- No verificado: el envío real desde el hosting. El entorno local no manda correo; se verificó que la ruta de éxito llame a `mail()` con cabeceras correctas.
- Revertir: `git revert 3db8603`.
