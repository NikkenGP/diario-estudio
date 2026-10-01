# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- v1 funcionando: registrar sesiones (fecha, tema, horas+minutos), racha actual, mejor racha con rango de fechas, total de horas/minutos de la semana actual, días estudiados del mes actual, lista de sesiones.
- Tres archivos: `index.html`, `styles.css`, `app.js`.
- Datos en localStorage bajo la clave `sesiones`.
- Versionado en Git: repo público `https://github.com/NikkenGP/diario-estudio` (rama `main`).

## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Mejor racha con rango de fechas en formato corto (ej: "1 oct - 12 oct"): mobile-first y legible.
- Fechas futuras se filtran antes de calcular rachas: una sesión con fecha > hoy no debe contar.
- Semana empieza en lunes (estándar ISO): coherente con el calendario español.
- Días del mes: cuenta fechas únicas (varias sesiones el mismo día = 1 día), mes natural (día 1 a hoy), etiqueta "Este mes: N días". Se calcula como texto `"YYYY-MM"` sin parsear fechas, reutilizando `filtrarSesionesValidas` y `fechaAtexto`.
- Diseño (skill `frontend-design`): concepto "cuaderno de bocetos" — fondo de papel cuadriculado, tinta azul, subrayador amarillo en la racha. Un solo protagonista (la tarjeta de racha); estadísticas semana/mes agrupadas en un bloque `.resumen` de dos columnas; sin sombras ni tarjetas-clon. Tipografía: serif del sistema (Georgia) para títulos/cifras y sans del sistema para el resto; sin fuentes externas (respeta "sin dependencias").
- `.gitignore` ignora config local del agente (`.opencode/`, `.agents/`, `opencode.json`, `skills-lock.json`) y `.env`. `AGENTS.md` y `MEMORY.md` sí se versionan.
- El push usa el token de `opencode.json` de forma efímera (`git -c http.extraheader`); no se guarda en `.git/config`. Git no está en el PATH: usar `C:\Program Files\Git\cmd\git.exe`.
- `README.md` en la raíz (uso, funcionamiento interno, reglas de fechas, estructura) + `docs/captura-movil.png`. Corregida en `AGENTS.md` la clave de localStorage a `sesiones` (antes decía `diario-estudio-sesiones`, que no existe en el código).
- Spec `specs/001-heat-map/spec.md` escrita: mapa de calor tipo GitHub, 12 semanas alineadas a lunes, franjas fijas de minutos (0 / 1-30 / 31-60 / 61-120 / >120), detalle al interactuar, leyenda. Solo QUÉ y POR QUÉ; plan pendiente.
- Plan `specs/001-heat-map/plan.md` escrito: `heatmap.js` (lógica pura con "hoy"), `test/heatmap.test.js` (node --test), cambios en `index.html`/`styles.css`/`app.js`. Guardia CommonJS para servir en navegador y en Node. BLOQUEANTE: decidir el modelo de datos (AGENTS.md dice `diario-estudio-sesiones`+`createdAt`; el código usa `sesiones`+`{fecha,tema,minutos}`).
- Tasks `specs/001-heat-map/tasks.md` escritas: 17 tareas (T0–T16) en 5 fases, con checkboxes, RF por tarea y "Hecho cuando" verificable. T0 (modelo de datos) es bloqueante.
- Regla nueva en `AGENTS.md`: cada commit se anota en la sección "Historial de cambios" del `README.md`. El historial se queda en el README (no se crea `CHANGELOG.md`); si pasa de ~15 entradas, se podan las más antiguas dejando las 10 recientes.

## Aprendizajes y errores a evitar
- [2026-09-30] Fechas futuras inflaban las rachas. Solución: filtrar sesiones con fecha > hoy antes de calcular cualquier racha.
- [2026-09-30] No usar `toISOString()` ni `new Date("AAAA-MM-DD")` para fechas locales: se interpretan en UTC y desplazan el día.
- [2026-10-01] Probado en Chrome con 3 sesiones (hoy 1 oct, ayer 30 sept, anteayer 29 sept): racha=3, mejor racha=3 días (29 sept - 1 oct), sin errores de consola. Ojo: si ayer cae en el mes anterior, "Este mes" cuenta solo los días del mes natural actual (mostró 1 día: solo el 1 oct). Es el comportamiento esperado.
- [2026-10-01] DISCREPANCIA: el AGENTS.md actualizado dice que los datos van en clave `diario-estudio-sesiones` con forma `{date, topic, minutes, createdAt}`, pero el código real usa la clave `sesiones` y `{fecha, tema, minutos}` (sin `createdAt`). Pendiente de decidir cuál es la fuente de verdad.

## Próximos pasos
- `calcularMejorRacha` usa `new Date("AAAA-MM-DD")` y división por `86400000` (líneas ~109-111): viola la skill `local-dates`. Pendiente de corregir si el usuario lo autoriza.
- SEGURIDAD: rotar/revocar el token de GitHub expuesto en texto plano en `opencode.json` y moverlo a variable de entorno.
