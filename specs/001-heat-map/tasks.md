# Tasks 001 — Mapa de calor de días estudiados

> Descompone `specs/001-heat-map/spec.md` según `specs/001-heat-map/plan.md`.
> Tareas pequeñas (20–30 min), en orden de dependencia. Cada una indica los RF que
> cubre y una línea **"Hecho cuando:"** verificable.
> Respeta `docs/constitution.md` y `AGENTS.md` (sin dependencias, sin build, lógica
> pura con "hoy", tests con `node --test`, datos del usuario intactos, textos en
> español).
>
> **Bloqueante (T0):** decidir el modelo de datos (ver spec, dudas abiertas y plan §0).

---

## Fase 0 — Preparación

- [x] **T0. Resolver el modelo de datos**
  - **RF:** — (bloquea RF-3, RF-8)
  - Decidir la fuente de verdad: clave `sesiones` / `{fecha, tema, minutos}` (código
    real) o `diario-estudio-sesiones` / `{date, topic, minutes, createdAt}` (`AGENTS.md`).
    Confirmar el enfoque defensivo (leer `fecha`/`date` y `minutos`/`minutes`,
    sin migrar datos).
  - **Hecho cuando:** queda escrita en `MEMORY.md` la decisión y el plan §0 queda
    confirmado (o ajustado).

- [x] **T1. Crear el esqueleto de `heatmap.js` con guardia CommonJS**
  - **RF:** RNF-3
  - Crear el archivo con el patrón `if (typeof module !== "undefined")` y la
    estructura de funciones (vacías o mínimas). Sin DOM ni localStorage.
  - **Hecho cuando:** `node -e "require('./heatmap.js')"` no lanza error y el archivo
    puede cargarse también como `<script>` clásico.

- [x] **T2. Preparar `test/heatmap.test.js` y verificar que se ejecuta**
  - **RF:** RNF-7
  - Crear el archivo de test con `node:test` y `node:assert`, importando desde
    `../heatmap.js`. Añadir un test trivial que pase.
  - **Hecho cuando:** `node --test` termina en verde (0 fallos) sin instalar nada.

---

## Fase 1 — Lógica pura de fechas

- [x] **T3. Utilidades de fecha locales**
  - **RF:** RF-1, RNF-5
  - Implementar en `heatmap.js`: formateo local `"AAAA-MM-DD"`, `addDays` (con
    `setDate`, nunca milisegundos) y `startOfWeek` (lunes).
  - **Hecho cuando:** los tests verifican que sumar/restar días cruza mes y año
    correctamente y que `startOfWeek` de un domingo devuelve el lunes anterior.

- [x] **T4. Normalización defensiva de sesiones**
  - **RF:** RF-2, RF-3, RF-8
  - Implementar `fechaValida(sesion)` y `minutosValidos(sesion)`: aceptan
    `fecha`/`date` y `minutos`/`minutes`; no numérico, negativo o ausente → 0;
    fecha inválida → `null`.
  - **Hecho cuando:** los tests confirman que entradas con campos ausentes,
    `NaN` o negativos no rompen y devuelven los valores por defecto.

---

## Fase 2 — Cálculos del mapa

- [x] **T5. Minutos por día (con exclusión del futuro)**
  - **RF:** RF-3, RF-8
  - Implementar `minutosPorDia(sesiones, hoy)`: agrupa por fecha, suma minutos de
    varias sesiones del mismo día e ignora fechas `> hoy` y registros inválidos.
  - **Hecho cuando:** los tests verifican que dos sesiones del mismo día suman, que
    una sesión futura no aparece y que una sesión inválida se ignora.

- [x] **T6. Nivel de intensidad por franjas fijas**
  - **RF:** RF-2
  - Implementar `nivelIntensidad(minutos)`: 0 / 1–30 / 31–60 / 61–120 / >120 → 0..4.
  - **Hecho cuando:** los tests de frontera (0, 1, 30, 31, 60, 61, 120, 121) dan
    niveles 0, 1, 1, 2, 2, 3, 3, 4.

- [x] **T7. Ventana de 12 semanas alineada a lunes**
  - **RF:** RF-1, RF-6
  - Implementar `ventanaSemanas(hoy, numSemanas)`: 12 semanas × 7 días, la última
    contiene hoy, cada día con `{ fecha, futuro }`.
  - **Hecho cuando:** los tests verifican 12 semanas de 7 días, que la primera
    empieza en lunes, que la última contiene `hoy`, y que los días posteriores a
    hoy tienen `futuro = true`.

- [x] **T8. Ensamblado del modelo `buildHeatmap`**
  - **RF:** RF-1, RF-2, RF-3, RF-6, RF-7, RF-8
  - Implementar `buildHeatmap(sesiones, hoy, numSemanas)`: combina minutos, niveles
    y ventana; calcula `tieneDatos` y `mensaje` ("Aún no hay datos en las últimas
    12 semanas" cuando no hay datos).
  - **Hecho cuando:** los tests verifican el modelo completo con datos, con datos
    solo fuera de ventana (→ mensaje) y sin datos (→ mensaje), y que `mensaje` es
    `null` cuando hay datos.

---

## Fase 3 — Interfaz

- [x] **T9. Estructura del mapa en `index.html`**
  - **RF:** RF-4, RF-5, RF-7
  - Añadir la sección `.mapa-calor` (título, contenedor `#mapa-calor`, etiqueta
    `#mapa-etiqueta` con `aria-live="polite"`, y la leyenda "Menos … Más"). Cargar
    `heatmap.js` **antes** de `app.js`.
  - **Hecho cuando:** al abrir `index.html` con doble clic, los elementos existen en
    el DOM y la consola no muestra errores.

- [x] **T10. Pintado de la rejilla en `app.js`**
  - **RF:** RF-1, RF-2, RF-3, RF-6, RF-7, RF-8
  - Implementar `actualizarMapaCalor()`: llamar a `buildHeatmap`, vaciar el
    contenedor y reconstruirlo con `createElement` (columnas = semanas), celda por
    día con `class="nivel-N"`, sin celda para días futuros, y mensaje cuando
    corresponda. No toca la lógica existente.
  - **Hecho cuando:** con sesiones registradas se dibujan las 12 semanas con las
    intensidades correctas y los días futuros quedan en blanco.

- [x] **T11. Interacción y accesibilidad del detalle**
  - **RF:** RF-4
  - Añadir `tabindex`, `aria-label` y los eventos (`mouseenter`/`mouseleave`,
    `focus`/`blur`, `touchstart`) que muestran/ocultan `#mapa-etiqueta` con
    "D mes — N min" o "D mes — sin sesión".
  - **Hecho cuando:** con ratón, teclado y toque se ve la etiqueta con el formato
    fijo, y desaparece al salir; los días futuros no responden.

- [x] **T12. Estilos de rejilla, niveles, leyenda y etiqueta**
  - **RF:** RF-2, RF-5, RNF-2
  - En `styles.css`: rejilla compacta (lunes arriba), cinco tonos coherentes con la
    app, leyenda en fila y etiqueta flotante legible; ajuste móvil sin scroll
    horizontal.
  - **Hecho cuando:** en 375 px el mapa se ve completo y usable, sin desborde
    horizontal, y los cinco niveles son visualmente distinguibles.

- [x] **T13. Conectar el recálculo del mapa**
  - **RF:** RF-1, RF-3, RF-7
  - Llamar a `actualizarMapaCalor()` en el arranque (PASO 6) y en el `submit` del
    formulario, junto a las demás `actualizar*()`.
  - **Hecho cuando:** al guardar una sesión nueva, el mapa se actualiza sin recargar
    la página.

---

## Fase 4 — Verificación

- [x] **T14. Completar la matriz de tests**
  - **RF:** RF-1, RF-2, RF-3, RF-6, RF-7, RF-8, RNF-7
  - Cubrir todos los casos de la tabla del plan §6: fronteras, suma por día, futuro,
    ventana, sin datos, sesiones fuera de ventana, datos inválidos y calendario
    (hoy lunes, hoy domingo, cambio de mes/año, 29 feb).
  - **Hecho cuando:** `node --test` pasa en verde con todos los casos anteriores.

- [x] **T15. Verificación manual con Chrome DevTools**
  - **RF:** RF-1..RF-8, RNF-1, RNF-2
  - Abrir `index.html`, registrar sesiones en varios días (incluida una futura),
    comprobar intensidades, etiqueta, leyenda, mensaje sin datos, consola y vista
    móvil de 375 px.
  - **Hecho cuando:** no hay errores en consola, todos los RF se observan cumplidos
    y el mapa se ve bien en móvil.

- [x] **T16. Cerrar la tarea: memoria y commit**
  - **RF:** — (proceso)
  - Actualizar `MEMORY.md` (estado, decisiones, aprendizajes) y hacer commit/push
    con el token efímero de siempre.
  - **Hecho cuando:** `MEMORY.md` refleja la funcionalidad terminada y el commit está
    subido a `origin/main`.

---

## Resumen de trazabilidad RF → tareas

| RF | Tareas |
|---|---|
| RF-1 Ventana 12 semanas | T3, T7, T8, T10, T14, T15 |
| RF-2 Intensidad por franjas | T4, T6, T12, T14, T15 |
| RF-3 Suma por día | T4, T5, T8, T10, T13, T14 |
| RF-4 Detalle del día | T9, T11, T15 |
| RF-5 Leyenda | T9, T12, T15 |
| RF-6 Días sin sesión/futuros | T7, T8, T10, T14 |
| RF-7 Estado sin datos | T8, T9, T10, T13, T14 |
| RF-8 Ignorar futuro | T4, T5, T8, T10, T14 |
| RNF-2 Móvil | T12, T15 |
| RNF-3 Simplicidad | T1 |
| RNF-5 Coherencia con la app | T3 |
| RNF-7 Tests como puerta | T2, T14 |
