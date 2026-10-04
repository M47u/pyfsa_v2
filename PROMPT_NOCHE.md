Vas a trabajar sin supervisión, durante toda la noche, en el repositorio del sitio web de PyFsa Software (la carpeta actual). Actúa como el agente definido en `.claude/agents/pyfsa-mantenimiento.md`: léelo completo antes de empezar y respeta todos sus límites.

Objetivo: ejecutar el backlog de `mantenimiento/BACKLOG.md` y dejar por la mañana una rama revisable, con commits pequeños y reversibles, más un informe claro. No hay nadie para responder preguntas: ante la duda entre actuar y registrar, registra en `mantenimiento/PENDIENTES.md` y continúa con la siguiente tarea.

Pasos:

1. Prepara el entorno.
   - Ejecuta `git status`. Si el árbol de trabajo tiene cambios sin commitear, detente y escribe la causa en `mantenimiento/INFORME.md` (sin tocar nada más).
   - Si la rama actual no empieza con `mantenimiento/`, crea `mantenimiento/noche-AAAA-MM-DD` (fecha obtenida con `date +%F`) a partir de la rama actual y trabaja solo ahí. Nunca commitees en `main`.
   - Crea `mantenimiento/BITACORA.md` y `mantenimiento/PENDIENTES.md` si no existen.
   - Detecta qué herramientas hay (php, node/npm, python y Pillow, Playwright con navegador) y anótalo en la bitácora. Usa solo las disponibles y no instales nada global.

2. Ejecuta el backlog.
   - Lee `mantenimiento/BACKLOG.md` y sigue exactamente el orden de ejecución que indica.
   - Para cada tarea: investiga, aplica el cambio mínimo, verifica, haz un commit atómico, actualiza el estado en el backlog y agrega la entrada a la bitácora.
   - Las tareas SOLO REGISTRAR no modifican el sitio: escribe los hallazgos y la propuesta exacta en `PENDIENTES.md`.
   - Si una verificación falla dos veces en la misma tarea, revierte esa tarea, márcala como bloqueada con la causa y sigue.

3. Reglas que no puedes romper, aunque parezca razonable.
   - No hagas push, merge, rebase ni comandos destructivos. No despliegues nada.
   - No inventes teléfonos, URLs, cifras, nombres de clientes, testimonios ni promesas comerciales.
   - No cambies textos comerciales. No edites `assets/vendor/` ni `preview/`.
   - No agregues tareas por tu cuenta: las ideas nuevas van a `PENDIENTES.md` como propuestas.
   - Si un permiso te es denegado, no lo rodees con otro comando. Regístralo y sigue.

4. Cierra.
   - Cuando termines todas las tareas, o cuando se cumpla un criterio de detención del agente (mismo error tres veces, nada más por hacer), ejecuta las verificaciones finales de la tarea T12.
   - Escribe `mantenimiento/INFORME.md` con el formato indicado en la definición del agente y haz el commit final.
   - Tu última respuesta debe ser un resumen de diez líneas como máximo: tareas hechas, bloqueadas y pendientes de decisión, nombre de la rama y cantidad de commits.

Criterio de éxito: por la mañana existe una rama con commits limpios, `INFORME.md` explica todo en pocos minutos de lectura, `PENDIENTES.md` lista cada decisión que necesito tomar con el cambio ya preparado, y el sitio en producción no fue tocado.
