# AGENTS.md - Diario de Estudio

## Stack y estructura
- `index.html` (estructura), `styles.css` (estilos), `app.js` (interfaz, almacenamiento y cálculos de racha/semana/mes), `heatmap.js` (lógica pura del mapa de calor), `profile.js` (lógica pura del perfil) y `test/` (tests con `node --test`).
- Debe funcionar abriendo `index.html` con doble click (`file://`); nada de módulos ES (`type="module"`), `fetch` a archivos locales ni nada que requiera servidor

## Convenciones

- Textos de la interfaz en español.
- Código simple, nombres descriptivos y comentarios solo donde aporten.
- Diseño limpio y responsive; cualquier pantalla nueva debe verse bien en el móvil.

## Datos

- LocalStorage, clave `sesiones`: array de `{ fecha: "AAAA-MM-DD", tema, minutos }` (`minutos` es el total en minutos de la sesión).
- LocalStorage, clave `perfil`: objeto `{ nombre, color, meta, saludo, version }` (independiente de `sesiones`).
- Si cambias la forma de los datos, mantén compatibilidad con lo ya guardado o el usuario perderá sus sesiones.

## Fechas y racha (fácil equivocarse)
- Trabaja siempre con la fecha local del usuario. Nunca uses `toISOString()` ni `new Date("AAAA-MM-DD")`: se interpretan en UTC y desplazan el día.
- Racha = días consecutivos con al menos 1 sesión que terminan hoy. Si hoy no hay sesión pero ayer sí, la racha sigue viva y se cuenta desde ayer.
- Varias sesiones el mismo día cuentan como un solo día. Las fechas futuras no suman.

## Forma de trabajar
- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de dejarlo en la memoria.
- No guardes nunca secretos ni datos sensibles: claves, tokens, contraseñas o credenciales. Los datos personales del usuario (p. ej. nombre o meta) solo se admiten si son mínimos, se guardan únicamente en el dispositivo y el propio usuario los controla.

## Comandos
- Tests: `node --test`

## Git
- Cada commit debe registrar sus cambios en la sección "Historial de cambios" del `README.md`.
- El historial vive en el `README.md`. Si supera ~15 entradas, poda las más antiguas dejando las 10 más recientes.

## Reglas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código. 

## Límites
- ✅ Siempre: respetar las reglas de fechas y racha, mantener los textos en español.
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea.
- ⚠️ Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados.
- 🚫 Nunca: añadir dependencias, frameworks o un paso de build.

## Verificación
- La lógica pura (`heatmap.js`) se prueba con `node --test`. Después de cada cambio, verifica también con el MCP de Chrome DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la vista móvil.
- Para empezar de cero: DevTools → Application → Local Storage → borrar la clave `sesiones`.
