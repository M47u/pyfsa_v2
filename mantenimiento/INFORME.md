# Informe de mantenimiento: noche del 24/09/2026

Rama: `mantenimiento/noche-2026-09-24` (desde `main` en `2286e4f`). 19 commits, sin push ni merge.

> **Nada fue desplegado.** No hubo conexiones al hosting ni a producción. Todas las pruebas se hicieron contra `127.0.0.1` y no se envió ningún correo real.

## Resumen

1. **El formulario de contacto quedó arreglado y seguro.** Antes mostraba error aunque el correo saliera (respondía JSON y `validate.js` espera `OK`) y permitía inyectar cabeceras (spam desde el hosting). Ahora valida, rechaza la inyección, tiene honeypot y responde `OK`. Pasa 18/18 casos con `curl` y la prueba en navegador.
2. SEO: canonical, `og:locale`, `og:site_name` y `lastmod` actualizado. Los logos legibles de clientes tienen `alt` con el nombre. El repo tiene `.gitignore` y `README.md`, y se eliminaron `default.php` (x2) y `preview/.atl/`.
3. La auditoría HTML (`checks.py`) no encontró errores mecánicos en `index.html`.
4. **El sitio se ve idéntico a `main`**: 0 píxeles distintos a 390 y 1440 px. No se cambiaron textos comerciales ni diseño.
5. Hay **15 decisiones pendientes** en `PENDIENTES.md`, cada una con el cambio preparado. Las más importantes: número de WhatsApp (P01), cifras del hero (P02), permisos de testimonios (P04) y peso de las fotos del equipo (P15).

## Tareas

| Tarea | Tipo | Estado | Commits |
|---|---|---|---|
| T01 Formulario de contacto | Aplicar | **Hecha** | `3db8603` |
| T02 Número de WhatsApp | Solo registrar | Decisión humana (P01) | `21baa92` |
| T03 Inconsistencias de contenido | Solo registrar | Decisión humana (P02 a P05) | `21baa92` |
| T04 Redes sociales vacías | Solo registrar | Decisión humana (P06) | `21baa92` |
| T11 Accesibilidad | Solo registrar | Decisión humana (P07, P08) | `21baa92` |
| T09 Auditoría HTML | Aplicar | **Hecha**: 0 errores, nada que corregir | `6bfa90a` |
| T05 SEO técnico | Aplicar | **Hecha**; `og:image` en P09 | `32c8218` |
| T06 `alt` de logos | Aplicar condicional | **Hecha** (3 de 4); client-1 en P10 | `60afe18` |
| T07 Higiene del repo | Aplicar | **Hecha**; registros en P11 a P14 | `fb3b423`, `69011ed` |
| T08 Peso de imágenes | Aplicar condicional | Decisión humana: sin Pillow ni sharp (P15) | `32ec4e8` |
| T10 README | Aplicar | **Hecha** | `f6a6769` |
| T12 Cierre | Aplicar | **Hecha** | este commit |

Ninguna tarea quedó bloqueada.

## Commits

| Hash | Resumen |
|---|---|
| `f192367` | chore(mantenimiento): agrega backlog, bitácora y script de capturas |
| `cfb45b5` | chore(mantenimiento): agrega scripts de verificación visual y del formulario |
| `3db8603` | fix(contacto): valida el formulario, evita inyección de cabeceras y responde OK |
| `9380d72` | docs(mantenimiento): registra T01 en backlog y bitácora |
| `21baa92` | docs(mantenimiento): registra pendientes de WhatsApp, contenido, redes y accesibilidad (T02, T03, T04, T11) |
| `6bfa90a` | chore(mantenimiento): agrega auditoría mecánica de HTML (checks.py) |
| `0901824` | docs(mantenimiento): registra T09 en backlog y bitácora |
| `32c8218` | feat(seo): agrega canonical, og:locale y og:site_name; actualiza lastmod |
| `f3a2ce0` | docs(mantenimiento): registra T05 y pendiente de og:image |
| `60afe18` | fix(clientes): texto alternativo con el nombre de tres logos legibles |
| `c3a608f` | docs(mantenimiento): registra T06 y pendiente del logo client-1 |
| `fb3b423` | chore(repo): agrega .gitignore |
| `69011ed` | chore(repo): elimina página por defecto de Hostinger y preview/.atl |
| `9467d58` | docs(mantenimiento): registra T07 y pendientes de orden del repositorio |
| `32ec4e8` | docs(mantenimiento): registra T08 (peso de imágenes) como pendiente |
| `f6a6769` | docs: agrega README con estructura, prueba local, publicación y mantenimiento |
| `2649723` | docs(mantenimiento): registra T10 en backlog y bitácora |
| `e1a012b` | fix(mantenimiento): reintenta la captura si Bootstrap Icons no cargó |
| (final) | docs(mantenimiento): informe final y cierre (T12) |

Los commits que tocan el sitio publicado son `3db8603`, `32c8218`, `60afe18` y `69011ed`. El resto son documentación, herramientas de `mantenimiento/`, `.gitignore` y README.

## Requiere decisión humana

Detalle y cambios listos en `mantenimiento/PENDIENTES.md`:

- **P01** Confirmar el número de WhatsApp `+54 9 3704 21-6650`. El comando de reemplazo ya está probado.
- **P02** "5 Programadores" y "+11 Clientes" contra 3 personas y 6 logos en la página.
- **P03** Confirmar los compromisos de la FAQ: soporte en todos los proyectos, capacitación, plazos e instancias gratuitas.
- **P04** Autorización de Renco, Innova y San Simón SRL para publicar sus testimonios.
- **P05** Año del copyright (2021 en el sitio, 2025 en `preview/`).
- **P06** URLs de redes sociales (9 enlaces `href="#"`), o quitar los íconos.
- **P07** Botón del menú móvil accesible (cambio HTML/JS/CSS preparado).
- **P08** Contraste: copyright, etiquetas de contacto y placeholders (1.6 a 1.8:1), y botón de WhatsApp (1.98:1).
- **P09** Imagen de 1200x630 para compartir en redes (`og:image`).
- **P10** Nombre exacto del cliente de `client-1.png` ("ELECTRO DA" o "ELECTRO DR").
- **P11 a P13** Qué hacer con `preview/` (versión anterior, no idéntica), `inner-page.html` y `screenshot.mjs`.
- **P14** Borrar `default.php` también del servidor; `.gitignore` de los archivos del kit; `.gitattributes` para los `.sh`.
- **P15** Optimizar las fotos del equipo (3.3 MB para círculos de 148 px) y unos 2.5 MB de imágenes sin uso.

## Riesgos detectados

- **Correo real no probado.** En local se verificó que el éxito llama a `mail()` con las cabeceras correctas, pero no el envío desde Hostinger. Después de publicar, conviene mandar un mensaje de prueba desde el sitio. Si no llega, revisar que `info@pyfsasoftware.com.ar` exista como casilla del dominio, porque ahora es el remitente (`From`).
- **Mensaje de error:** `validate.js` (vendor) antepone "Error: " a los mensajes en español ("Error: Ingresá un correo válido."). Es aceptable y no se modificó el vendor.
- **Archivos viejos en el servidor:** `default.php` e `inner-page.html` pueden seguir publicados aunque se borren del repo (P12, P14).
- **Rendimiento:** unos 3.3 MB de fotos del equipo (P15).
- **Contenido no verificado:** cifras, testimonios y compromisos de la FAQ (P02 a P04) pueden ser un riesgo comercial o legal si no son exactos.
- **Herramientas locales:** Playwright 1.60 no tiene su navegador descargado; los scripts usan el Chromium `chromium-1243` ya instalado. `node_modules/` quedó instalado localmente con `npm ci` (ignorado por git).
- **Incidente menor ya corregido:** un commit de documentación incluyó por error capturas y correos de prueba. Se deshizo con `git reset --soft` antes de seguir y no quedó en el historial (ver bitácora, T07).

## Verificaciones finales (T12)

- `php -l forms/contact.php`: sin errores.
- `python mantenimiento/checks.py`: `index.html` con 0 errores.
- `bash mantenimiento/pruebas-formulario.sh`: 18/18 ok (GET, válido, vacíos, email inválido, inyección de cabeceras en email/nombre/asunto, honeypot, largos, array). Solo 2 correos capturados, sin `Bcc`.
- `node mantenimiento/prueba-formulario-navegador.mjs`: éxito y error se muestran bien; el honeypot no se ve.
- Visual, `main` contra la rama: 0 píxeles distintos a 390 y 1440 px en 5 capturas seguidas.
- `sitemap.xml`: XML válido.
- Ningún commit tocó `assets/vendor/`. En `preview/` solo se eliminó `preview/.atl/` (autorizado).
- `git status`: limpio, salvo los archivos sin seguimiento del kit (`.claude/`, `PROMPT_NOCHE.md`, `files.zip`), que se dejaron sin versionar a propósito.

## Cómo revisar

```bash
git log main..HEAD --oneline
git diff main --stat
git diff main -- forms/contact.php index.html sitemap.xml   # solo los cambios del sitio
```

Para verlo funcionando: `php -S 127.0.0.1:8080` y abrir http://127.0.0.1:8080/index.html. Para las pruebas: `bash mantenimiento/pruebas-formulario.sh`.

## Cómo revertir

Cualquier commit se revierte por separado con `git revert <hash>` (por ejemplo, `git revert 3db8603` deshace el formulario y `git revert 69011ed` restaura los archivos eliminados). Para descartar todo, alcanza con no mergear la rama: `main` no fue modificada.
