# 📚 Diario de Estudio

Aplicación web sencilla para registrar tus sesiones de estudio y ver tu racha,
tus horas y los días que has estudiado. Funciona directamente en el navegador,
sin instalar nada.

![Vista móvil del Diario de Estudio](docs/captura-movil.png)

## Qué hace

- Registra sesiones con fecha, tema y tiempo (horas + minutos).
- Calcula la **racha actual** de días consecutivos.
- Muestra la **mejor racha** histórica con su rango de fechas.
- Suma el **tiempo de la semana** (de lunes a hoy).
- Cuenta los **días estudiados este mes**.
- Lista el historial de sesiones.

## Cómo usarla

1. Descarga o clona el repositorio.
2. Abre `index.html` con doble clic. No hace falta servidor ni instalar nada.
3. Rellena el formulario y pulsa "Guardar sesión".

Tus datos se guardan en el navegador (`localStorage`), no en ningún servidor.

**Empezar de cero:** abre DevTools (F12) → Application → Local Storage y borra
la clave `sesiones`.

## Cómo funciona por dentro

- Sin backend, sin dependencias y sin paso de build: HTML, CSS y JavaScript puros.
- Tres archivos: `index.html`, `styles.css` y `app.js`.
- Los datos se guardan en `localStorage` bajo la clave `sesiones`.

## Reglas de fechas

Las fechas son la mayor fuente de errores, así que se tratan con cuidado:

- Se guardan como texto `"AAAA-MM-DD"` en la **hora local** del usuario.
- Nunca se usa `toISOString()` ni `new Date("AAAA-MM-DD")`: se interpretan en UTC
  y desplazan el día.
- Las sesiones con fecha futura no cuentan para ninguna racha.
- Varias sesiones el mismo día cuentan como un solo día.
- La semana empieza en **lunes**.

## Desarrollo

- No hay tests automáticos. Después de cada cambio, se verifica con Chrome
  DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y
  comprueba la vista móvil.
- Consulta `AGENTS.md` para las reglas del proyecto y `MEMORY.md` para el estado
  actual y las decisiones tomadas.

## Estructura del repositorio

| Archivo | Qué es |
|---|---|
| `index.html` | Estructura de la interfaz |
| `styles.css` | Estilos |
| `app.js` | Lógica (racha, semana, mes, almacenamiento) |
| `AGENTS.md` | Reglas para los agentes |
| `MEMORY.md` | Memoria del proyecto entre sesiones |
| `docs/captura-movil.png` | Captura de la vista móvil |
