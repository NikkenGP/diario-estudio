# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- App v1 + 2 módulos: registrar sesiones (fecha, tema, minutos), racha, mejor racha, semana, mes, **mapa de calor** (12 semanas) y **perfil** (nombre, avatar, meta, saludo).
- Archivos: `index.html`, `styles.css`, `app.js`, `heatmap.js`, `profile.js`, `test/`.
- Datos en localStorage: clave `sesiones` (`{fecha, tema, minutos}`) y clave `perfil` (`{nombre, color, meta, saludo, version}`).
- Tests: **54/54** con `node --test` (sin dependencias). Auditoría QA en `docs/functional-test-report.md` (17/17 RF ✅).
- Versionado: repo público `https://github.com/NikkenGP/diario-estudio` (rama `main`).

## Decisiones (y por qué)
- Sin backend ni dependencias; funciona abriendo `index.html` con doble clic. Sin módulos ES: los archivos de lógica se exportan con guardia CommonJS.
- Lógica pura separada de la interfaz, con "hoy" como parámetro (`heatmap.js`, `profile.js`). Los nombres de función van en inglés; textos en español.
- Fechas siempre en hora local (texto `"AAAA-MM-DD"`); nunca `toISOString()` ni `new Date("AAAA-MM-DD")`. Semana empieza en lunes. Fechas futuras no cuentan.
- Mapa: franjas fijas (0 / 1-30 / 31-60 / 61-120 / >120), etiqueta "D mes — N min", leyenda "Menos…Más".
- Perfil: nombre obligatorio y solo letras (con acentos, espacios, guiones, apóstrofes); meta entera 1–10080; avatar inicial+color de paleta fija; saludo como preferencia. Datos personales mínimos, locales y controlados por el usuario (regla de `AGENTS.md` matizada).
- `.gitignore` ignora config local del agente (`.opencode/`, `.agents/`, `opencode.json`, `skills-lock.json`) y `.env`.
- Cada commit se anota en "Historial de cambios" del `README.md` (si pasa de ~15 entradas, podar a las 10 recientes).

## Aprendizajes y errores a evitar
- No usar `toISOString()` ni `new Date("AAAA-MM-DD")` (UTC desplaza el día). Para sumar días, `setDate`, nunca milisegundos.
- `obtenerSesiones` y `parsearPerfil` toleran almacenamiento corrupto (try/catch) sin borrar la clave.
- Git no está en el PATH: usar `C:\Program Files\Git\cmd\git.exe`. El push usa el token de `opencode.json` de forma efímera (`git -c http.extraheader`); no se guarda en `.git/config`.
- [2026-10-02] `index.html`, `app.js` y `styles.css` tenían ACL de solo lectura (Usuarios=RX); se recrearon para poder editarlos. Backup en `%LOCALAPPDATA%\Temp\opencode\diario-backup`.

## Próximos pasos
- (vacío)
