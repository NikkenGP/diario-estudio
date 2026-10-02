# Reporte de pruebas funcionales y automatizadas — Diario de Estudio

## Fecha de la prueba
2026-10-02

## Estado de correcciones (2026-10-02)
Los dos hallazgos detectados fueron **corregidos y re-verificados** (ver sección final
"Correcciones aplicadas"). Tras la corrección, `node --test` sigue en **48/48** y ambos
RF pasan de ⚠️ Parcial a ✅ Cumple.

## Resumen de Módulos Evaluados

| Módulo | Spec | Estado en `tasks.md` | Lógica pura | Interfaz / almacenamiento |
|---|---|---|---|---|
| `001-heat-map` | `specs/001-heat-map/spec.md` | Implementado (T0–T16) | `heatmap.js` | `app.js` + `index.html` + `styles.css` |
| `002-personal-data` | `specs/002-personal-data/spec.md` | Implementado (T1–T19) | `profile.js` | `app.js` + `index.html` + `styles.css` |

**Fuera de alcance (por indicación):** inicio de sesión, autenticación y bases de datos externas. La funcionalidad de autenticación se descartó y no generó spec.

## Resultados de Tests Automatizados

Comando: `node --test` (sin dependencias, `node:test` + `node:assert`).

```
# tests 48
# pass 48
# fail 0
```

**Pasaron: 48 / Fallaron: 0.**

- `test/heatmap.test.js`: 20 tests (RF-1, RF-2, RF-3, RF-6, RF-7, RF-8).
- `test/profile.test.js`: 28 tests (RF-2, RF-3, RF-4, RF-5, RF-8, RNF-8).

**Cobertura automatizada:** solo la lógica pura (constitución #3). Los RF de interfaz y de `localStorage` no tienen test automatizado y se verificaron manualmente con Chrome DevTools.

## Matriz de Cobertura por Módulo

### Módulo 001 — Mapa de calor

| RF | Requisito | Estado | Evidencia |
|---|---|---|---|
| RF-1 | Ventana de 12 semanas alineada a lunes | ✅ Cumple | Tests 12,13,15,16; UI: 12 columnas, primera en lunes, última = actual |
| RF-2 | Intensidad por franjas fijas | ✅ Cumple | Tests 10,11; UI: 1→nivel-1, 60→nivel-2, 121→nivel-4 |
| RF-3 | Suma de minutos por día | ✅ Cumple | Test 7; UI: 100+21=121 el mismo día → nivel-4 |
| RF-4 | Detalle del día (ratón/toque/teclado) | ✅ Cumple | Ratón y teclado OK ("2 oct — 121 min", foco sin sesión); **corregido**: el toque fuera ahora oculta la etiqueta (bug #1) |
| RF-5 | Leyenda de la escala | ✅ Cumple | UI: leyenda "Menos … Más" con 5 muestras, visible también sin datos |
| RF-6 | Días sin sesión / futuros | ✅ Cumple | UI: celda vacía; futuros con borde discontinuo, inertes (`tabIndex=-1`, sin `aria-label`) |
| RF-7 | Estado sin datos | ✅ Cumple | Test 18,19; UI: mensaje "Aún no hay datos en las últimas 12 semanas" (también con sesiones fuera de ventana) |
| RF-8 | Ignorar fechas futuras | ✅ Cumple | Tests 8,20; UI: sesión del 5 oct no pinta celda |

RNF: RNF-1 ✅ · RNF-2 ✅ (375 px sin overflow) · RNF-3 ✅ · RNF-4 ✅ · RNF-5 ✅ · RNF-6 ✅ (tests sin DOM) · RNF-7 ✅ (verde) · RNF-8 ✅ · RNF-9 ✅ (almacenamiento corrupto → "sin datos", sin errores).

### Módulo 002 — Datos personales

| RF | Requisito | Estado | Evidencia |
|---|---|---|---|
| RF-1 | Vista de perfil | ✅ Cumple | UI: muestra y edita nombre, avatar, meta y preferencia |
| RF-2 | Nombre (obligatorio, solo letras, 1–40) | ✅ Cumple | Tests 23–26,43,46; UI: "Ana123" rechazado; "José María" aceptado |
| RF-3 | Avatar (inicial + color) | ✅ Cumple | Tests 27–29,39; UI: avatar "J" con color `#8e44ad`; `?` sin nombre |
| RF-4 | Meta semanal con progreso | ✅ Cumple | Tests 30–37,45,47; UI: progreso y meta cumplida OK; **corregido**: el texto no numérico ahora se rechaza con mensaje (bug #2) |
| RF-5 | Preferencia (saludo) | ✅ Cumple | Test 38; UI: "Hola, José María", interruptor instantáneo y persistente |
| RF-6 | Persistencia local | ✅ Cumple | UI: perfil se restaura tras recargar; red solo `file://`, sin envíos externos |
| RF-7 | Independencia de las sesiones | ✅ Cumple | UI: guardar/borrar/reiniciar perfil no altera `sesiones` (4 intactas) |
| RF-8 | Tolerancia a datos corruptos | ✅ Cumple | Tests 39–42; UI: aviso visible, clave preservada, app viva; "Reiniciar perfil" |
| RF-9 | Borrar perfil | ✅ Cumple | UI: cancelar no borra; confirmar borra solo `perfil` |

RNF: RNF-1 ✅ · RNF-2 ✅ · RNF-3 ✅ · RNF-4 ✅ (375 px sin overflow) · RNF-5 ✅ · RNF-6 ✅ · RNF-7 ✅ · RNF-8 ✅ (test 48) · RNF-9 ✅ · RNF-10 ✅ (labels, `aria-label`, `aria-*` en progreso).

### Leyenda
✅ Cumple · ⚠️ Parcial · ❌ Falla

## Bugs Encontrados / Recomendaciones

### Bug #1 — [001 · RF-4] El toque fuera del mapa no ocultaba la etiqueta — ✅ CORREGIDO
- **Qué era:** en la interacción táctil, tocar un día mostraba la etiqueta, pero tocar fuera **no la ocultaba**.
- **Dónde estaba:** `app.js`, `actualizarMapaCalor()`; no existía manejador global de toque.
- **Corrección:** se añadió un `document.addEventListener('touchstart', ...)` que oculta la etiqueta cuando el toque ocurre **fuera** de la rejilla (`contenedorMapa`).
- **Verificación:** tocar celda → etiqueta visible; tocar fuera (`h1`) → `oculto: true`. Ratón (`mouseleave`) y teclado (`blur`) siguen funcionando.

### Bug #2 — [002 · RF-4] El texto no numérico en la meta no mostraba error — ✅ CORREGIDO
- **Qué era:** con `<input type="number">`, escribir letras se descartaba y el guardado lo tomaba como "sin meta", sin mensaje.
- **Dónde estaba:** `index.html` (`#perfil-meta`) + `app.js` (guardado).
- **Corrección:** el campo pasó a `type="text"` con `inputmode="numeric"` (teclado numérico en móvil, pero sin descartar texto), de modo que la validación pura de `construirPerfil` recibe el valor crudo y muestra el error.
- **Verificación:** "abc" → se conserva y muestra "La meta debe ser un número entero entre 1 y 10080 minutos"; "1.5" y "10081" → mismo error; "90" → se guarda `meta: 90`.

### Observaciones (no son fallos)
- **`001` duda abierta:** la spec mantiene la `[NECESITA ACLARACIÓN]` sobre el modelo de datos (`sesiones` vs `diario-estudio-sesiones`), aunque `spec`, `AGENTS.md` y código ya están alineados en `sesiones`. Recomendación: cerrar la duda en la spec para dejarla limpia.
- **Cobertura de tests:** RF de interfaz (001 RF-4/5; 002 RF-1/6/7/9) no tienen test automatizado. Se recomienda, si se quiere subir el listón, añadir verificación automatizada de UI (no trivial en `node --test` puro) o mantener planilla manual.
- Sin errores en consola en ninguno de los escenarios (uso normal y datos corruptos).

## Correcciones aplicadas
Ambos hallazgos se corrigieron el 2026-10-02 con cambios mínimos y enfocados:

| Bug | Archivo | Cambio |
|---|---|---|
| #1 | `app.js` | Manejador global `touchstart` que oculta la etiqueta al tocar fuera de la rejilla |
| #2 | `index.html` | `#perfil-meta` pasa de `type="number"` a `type="text"` con `inputmode="numeric"` |

**Pruebas tras la corrección:** `node --test` → **48/48** en verde; verificación en Chrome
(consola sin errores, móvil 375 px sin overflow). Con ello **los 17 RF quedan ✅ Cumple**.

## Conclusión
- **Tests automatizados:** 48/48 en verde.
- **Cobertura funcional:** **17/17 RF ✅ Cumple** (tras corregir los bugs #1 y #2).
- **Veredicto:** la app cumple ambas especificaciones al 100 %. Las dos incidencias
  detectadas eran de interacción/validación y ya están resueltas.
