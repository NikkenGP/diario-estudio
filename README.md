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
- Muestra un **mapa de calor** de las últimas 12 semanas (cuantos más minutos, más intenso).
- Guarda un **perfil personal** (nombre, avatar con inicial y color, meta semanal con progreso y preferencia de saludo), solo en el dispositivo.
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
- Cuatro archivos: `index.html`, `styles.css`, `app.js` y `heatmap.js`.
- Los datos se guardan en `localStorage` bajo la clave `sesiones` (y el perfil, bajo `perfil`).

## Tests

La lógica del mapa de calor vive en `heatmap.js` como funciones puras (reciben
"hoy" como parámetro, sin DOM ni `localStorage`) y se prueba sin instalar nada:

```
node --test
```

## Reglas de fechas

Las fechas son la mayor fuente de errores, así que se tratan con cuidado:

- Se guardan como texto `"AAAA-MM-DD"` en la **hora local** del usuario.
- Nunca se usa `toISOString()` ni `new Date("AAAA-MM-DD")`: se interpretan en UTC
  y desplazan el día.
- Las sesiones con fecha futura no cuentan para ninguna racha.
- Varias sesiones el mismo día cuentan como un solo día.
- La semana empieza en **lunes**.

## Desarrollo

- Los tests automáticos se ejecutan con `node --test`. Después de cada cambio, se
  verifica con Chrome DevTools: abre `index.html`, prueba la funcionalidad, revisa
  la consola y comprueba la vista móvil.
- Consulta `AGENTS.md` para las reglas del proyecto y `MEMORY.md` para el estado
  actual y las decisiones tomadas.

## Estructura del repositorio

| Archivo | Qué es |
|---|---|
| `index.html` | Estructura de la interfaz |
| `styles.css` | Estilos |
| `app.js` | Lógica (racha, semana, mes, almacenamiento) |
| `heatmap.js` | Lógica pura del mapa de calor (recibe "hoy"; sin DOM) |
| `profile.js` | Lógica pura del perfil (validación, avatar, meta, parseo; sin DOM) |
| `test/` | Tests de la lógica con `node --test` |
| `AGENTS.md` | Reglas para los agentes |
| `MEMORY.md` | Memoria del proyecto entre sesiones |
| `docs/constitution.md` | Principios innegociables del proyecto |
| `specs/` | Especificaciones, planes y tareas por funcionalidad |
| `docs/captura-movil.png` | Captura de la vista móvil |

## Historial de cambios

Cada commit relevante se anota aquí (el más reciente primero).

| Fecha | Cambio |
|---|---|
| 2026-10-02 | Recomendaciones QA aplicadas: cerrada la duda de la spec 001 y ampliada la cobertura de tests (54/54) con etiqueta del mapa, leyenda y round-trip del perfil. |
| 2026-10-02 | Auditoría QA (`docs/functional-test-report.md`) y corrección de los 2 hallazgos: toque fuera oculta la etiqueta del mapa y la meta no numérica muestra error. |
| 2026-10-02 | Skill local `iniciar-sdd` (flujo SDD de 6 pasos con confirmación por paso); vive en `.agents/` (no versionado). |
| 2026-10-01 | El nombre del perfil ahora solo admite letras (con acentos, espacios, guiones y apóstrofes); se rechazan dígitos. |
| 2026-10-01 | Perfil del usuario (002): `profile.js` con lógica pura y tests, vista de perfil, saludo, meta con progreso y borrado. |
| 2026-10-01 | Tasks `specs/002-personal-data/tasks.md`: 19 tareas en 6 fases con RF y "Hecho cuando". |
| 2026-10-01 | Plan `specs/002-personal-data/plan.md`: lógica pura en `profile.js`, clave `perfil` separada, tests con `node --test`. |
| 2026-10-01 | Regla de `AGENTS.md` matizada (secretos vs datos personales) y spec 002 sin dudas abiertas. |
| 2026-10-01 | Spec `specs/002-personal-data/spec.md` refinada tras revisión de QA (RF de borrado, límites, inicial del avatar, preferencia concreta, requisitos de accesibilidad). |
| 2026-10-01 | Spec `specs/002-personal-data/spec.md`: perfil local (nombre, avatar inicial+color, meta semanal, preferencia). |

> Entradas anteriores podadas según la regla de mantenimiento (~15 entradas).
