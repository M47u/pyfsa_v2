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
