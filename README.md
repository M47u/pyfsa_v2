# PyFsa Software - Sitio web

Sitio institucional de PyFsa Software (https://pyfsasoftware.com.ar), empresa de desarrollo de software de Formosa, Argentina.

Es un sitio estático (HTML, CSS y JavaScript con Bootstrap 5) basado en una plantilla de BootstrapMade, más un formulario de contacto en PHP. No hay paso de compilación: lo que está en el repositorio es lo que se publica.

## Estructura

```
index.html              Página principal (todo el sitio es una sola página)
forms/contact.php       Formulario de contacto: valida los datos y envía el correo con mail()
assets/css/style.css    Estilos propios
assets/js/main.js       Comportamiento propio (menú, scroll, animaciones)
assets/img/             Imágenes (clients/: logos de clientes, team/: fotos del equipo)
assets/vendor/          Librerías de terceros (Bootstrap, AOS, Bootstrap Icons, GLightbox,
                        php-email-form). No se editan.
robots.txt, sitemap.xml SEO
inner-page.html         Remanente de la plantilla (sin enlaces entrantes)
changelog.txt           Changelog de la plantilla original
preview/                Copia anterior del sitio. No se publica.
mantenimiento/          Backlog, bitácora, pendientes y scripts de verificación. No se publica.
package.json            Herramientas de desarrollo (Playwright). No se publica.
screenshot.mjs          Script de capturas antiguo, con rutas de otra carpeta de XAMPP.
```

## Probar localmente

Requiere PHP 8 (por ejemplo, el de XAMPP).

```bash
php -S 127.0.0.1:8080
```

Abrir http://127.0.0.1:8080/index.html.

El formulario de contacto no envía correo en local. Para probarlo sin enviar nada, usar el script de pruebas (ver "Mantenimiento"), que levanta un servidor en el puerto 8081 y guarda los correos en archivos.

### Cómo responde el formulario

`assets/vendor/php-email-form/validate.js` muestra el mensaje de éxito solo si `forms/contact.php` responde HTTP 200 con el texto exacto `OK`. Cualquier otro texto se muestra al visitante como error. Por eso `contact.php` responde `OK` o un mensaje breve en español, siempre con HTTP 200. Los correos salen desde `info@pyfsasoftware.com.ar`, con `Reply-To` al email del visitante.

## Qué se sube al hosting

Se sube la raíz del repositorio **excepto**:

- `preview/`
- `mantenimiento/`
- `node_modules/`, `package.json`, `package-lock.json`, `screenshot.mjs`
- `.git/`, `.gitignore`, `.claude/`, `README.md`
- Cualquier archivo local que no esté versionado (por ejemplo, `.zip` o prompts)

Es decir: `index.html`, `forms/`, `assets/`, `robots.txt`, `sitemap.xml` (y `inner-page.html` / `changelog.txt` mientras no se decida eliminarlos).

Al publicar, revisar que en el servidor no queden archivos viejos que ya no están en el repo (por ejemplo, `default.php` de la página por defecto del hosting).

## Mantenimiento

El mantenimiento lo hace un agente de Claude Code definido en `.claude/agents/pyfsa-mantenimiento.md`. Trabaja siempre en una rama `mantenimiento/...`, con commits pequeños, y nunca publica nada.

Archivos en `mantenimiento/`:

| Archivo | Para qué sirve |
|---|---|
| `BACKLOG.md` | Tareas y su estado. Es la única fuente de verdad sobre qué hacer. |
| `BITACORA.md` | Registro de lo hecho: qué, por qué, cómo se verificó y cómo revertirlo. |
| `PENDIENTES.md` | Decisiones y datos que tiene que aportar el dueño, con el cambio ya preparado. |
| `INFORME.md` | Resumen de cada ejecución, para leer en pocos minutos. |
| `checks.py` | Auditoría de HTML: etiquetas sin cerrar, ids duplicados, anclas y archivos inexistentes, `alt`, `rel="noopener"`. |
| `pruebas-formulario.sh` | Pruebas de `forms/contact.php` con `curl`. No envía correos: los guarda en `mantenimiento/capturas/mails/`. |
| `capturar-mail.php` | Reemplazo de sendmail que usa el script anterior (solo funciona por consola). |
| `capturas.mjs` | Capturas de `index.html` a 390 y 1440 px en `mantenimiento/capturas/`. |
| `comparar.mjs` | Compara dos capturas píxel a píxel. |
| `prueba-formulario-navegador.mjs` | Envía el formulario real desde el navegador. |

Uso habitual (desde la raíz del repo):

```bash
python mantenimiento/checks.py                   # auditoría de index.html
bash mantenimiento/pruebas-formulario.sh         # pruebas del formulario (puerto 8081)

npm ci                                           # instala Playwright en node_modules/
php -S 127.0.0.1:8080                            # en otra terminal
node mantenimiento/capturas.mjs antes            # capturas antes de un cambio
node mantenimiento/capturas.mjs despues          # capturas después
node mantenimiento/comparar.mjs antes despues    # 0 píxeles distintos = sin cambios visuales
```

Los scripts de capturas usan el Chromium de Playwright ya instalado en `%LOCALAPPDATA%\ms-playwright\chromium-1243`. Se puede indicar otro navegador con la variable `CHROMIUM_PATH`. `mantenimiento/capturas/` no se versiona.

Para revisar el trabajo de una rama de mantenimiento:

```bash
git log main..HEAD --oneline
git diff main --stat
```
