# Plan 001 — Mapa de calor de días estudiados

> **Qué**: implementar `specs/001-heat-map/spec.md`.
> **Restricciones**: `docs/constitution.md` y `AGENTS.md` (sin dependencias, sin build,
> funciona con doble clic `file://`, sin `type="module"`, sin `fetch` local; lógica
> pura separada de la interfaz; tests con `node --test`; datos del usuario intactos;
> interfaz y documentación en español, código en inglés).

---

## 0. Prerrequisito bloqueante

- **[PENDIENTE DE DECISIÓN] Modelo de datos.** La spec dejó abierta la duda:
  - `AGENTS.md`: clave `diario-estudio-sesiones`, forma `{date, topic, minutes, createdAt}`.
  - Código real (`app.js`): clave `sesiones`, forma `{fecha, tema, minutos}`.

  Este plan asume como **fuente de verdad el código real** (`sesiones` /
  `{fecha, tema, minutos}`), porque es lo que hoy se guarda y la constitución
  (#5) prohíbe perder datos. Además, la lectura de campos será **defensiva**: se
  aceptará `fecha`/`date` y `minutos`/`minutes` para no romper si más adelante se
  alinean los nombres. Si decides lo contrario, hay que revisar el plan.

---

## 1. Archivos que se crean o se modifican

| Archivo | Acción | Responsabilidad | RF cubiertos |
|---|---|---|---|
| `heatmap.js` | **Crear** | Lógica pura del mapa: agrupación de minutos por día, nivel de intensidad, ventana de semanas y ensamblado del modelo de datos del mapa. Sin DOM ni localStorage; recibe "hoy" como parámetro. Exporta por guardia CommonJS para poder probarse con `node --test`. | RF-1, RF-2, RF-3, RF-6, RF-7, RF-8 |
| `test/heatmap.test.js` | **Crear** | Pruebas de la lógica pura con `node:test` + `node:assert`, sin paquetes. | RNF-6, RNF-7 (verificación de RF-1, RF-2, RF-3, RF-6, RF-7, RF-8) |
| `index.html` | **Modificar** | Añadir la sección del mapa (contenedor + leyenda + zona de etiqueta) y cargar `heatmap.js` **antes** de `app.js`. | RF-4, RF-5, RF-7 (estructura) |
| `styles.css` | **Modificar** | Estilos de la rejilla, las celdas por nivel, la leyenda y la etiqueta flotante; comportamiento móvil sin scroll horizontal. | RF-2 (visual), RF-5, RNF-2, RNF-5 |
| `app.js` | **Modificar** | Solo la capa de interfaz: referencias a los elementos nuevos, función de pintado `actualizarMapaCalor()` que consume `heatmap.js`, y sus llamadas al iniciar y tras guardar una sesión. No se toca la lógica existente. | RF-4, RF-5, RF-6, RF-7 (presentación e interacción) |
| `MEMORY.md` | **Modificar** | Registrar la decisión y el estado al terminar. | — (proceso) |

> No se crean `package.json`, ni build, ni dependencias. `node --test` se ejecuta
> directamente sobre `test/heatmap.test.js`.

---

## 2. Funciones puras de lógica (con "hoy" como parámetro)

Todas viven en `heatmap.js`, no tocan DOM ni almacenamiento, y son deterministas
dada la entrada. "hoy" viaja como texto local `"AAAA-MM-DD"` (nunca `Date` sin
normalizar, para evitar UTC).

| Función (código en inglés) | Entrada | Salida | Responsabilidad | RF |
|---|---|---|---|---|
| `localDateToText(date)` | par de apoyo | `"AAAA-MM-DD"` | Formato local de fecha sin UTC (se apoya en el patrón ya usado en la app). | RNF-5 |
| `addDays(dateText, n)` | texto + entero | texto | Suma/resta de días con `setDate` (nunca milisegundos). | RF-1 |
| `startOfWeek(dateText)` | texto | texto | Lunes de la semana de esa fecha. | RF-1, RNF-5 |
| `minutosValidos(sesion)` | sesión | número ≥ 0 | Normaliza el campo de minutos de forma defensiva (`minutos`/`minutes`); no numérico, negativo o ausente → 0. | RF-2, RF-3 |
| `fechaValida(sesion)` | sesión | texto o `null` | Normaliza el campo de fecha (`fecha`/`date`) y valida formato. | RF-3, RF-8 |
| `minutosPorDia(sesiones, hoy)` | sesiones + hoy | objeto `{ "AAAA-MM-DD": minutos }` | Suma minutos por fecha, ignorando fechas futuras (`> hoy`) y registros inválidos. | RF-3, RF-8 |
| `nivelIntensidad(minutos)` | número | 0..4 | Traduce minutos a nivel: 0 / 1–30 / 31–60 / 61–120 / >120. | RF-2 |
| `ventanaSemanas(hoy, numSemanas)` | hoy + nº | matriz `numSemanas × 7` de `{ fecha, futuro }` | Construye 12 semanas alineadas a lunes; marca `futuro = fecha > hoy`. | RF-1, RF-6 |
| `buildHeatmap(sesiones, hoy, numSemanas)` | sesiones + hoy (+nº) | `{ semanas, tieneDatos, mensaje }` | Ensambla el modelo: cada día con `{ fecha, minutos, nivel, futuro }`, más la bandera de datos y el mensaje. | RF-1, RF-2, RF-3, RF-6, RF-7, RF-8 |

**Decisiones de diseño de estas funciones**
- `hoy` es siempre parámetro explícito → testeable sin reloj real (constitución #3).
- La salida de `buildHeatmap` es un **modelo de datos**, no HTML: la interfaz no
  contiene reglas de negocio (constitución #3, separación lógica/interfaz).
- Se devuelve `mensaje` ya resuelto para que la interfaz solo lo muestre (RF-7).

---

## 3. Algoritmo del mapa en pseudocódigo

```
FUNCIÓN minutosPorDia(sesiones, hoy):
    acumulado = {}                          // "AAAA-MM-DD" -> minutos
    PARA cada sesion EN sesiones:
        fecha = fechaValida(sesion)         // fecha/date; null si inválida
        SI fecha ES null: CONTINUAR
        SI fecha > hoy: CONTINUAR           // RF-8: ignorar futuro
        minutos = minutosValidos(sesion)    // número >= 0 (RF-2)
        acumulado[fecha] = (acumulado[fecha] o 0) + minutos   // RF-3
    DEVOLVER acumulado

FUNCIÓN nivelIntensidad(minutos):
    SI minutos <= 0:   DEVOLVER 0
    SI minutos <= 30:  DEVOLVER 1
    SI minutos <= 60:  DEVOLVER 2
    SI minutos <= 120: DEVOLVER 3
    DEVOLVER 4

FUNCIÓN ventanaSemanas(hoy, numSemanas):
    lunesActual  = startOfWeek(hoy)
    lunesInicial = addDays(lunesActual, -7 * (numSemanas - 1))
    semanas = []
    PARA i DE 0 HASTA numSemanas - 1:
        lunes = addDays(lunesInicial, 7 * i)
        dias = []
        PARA d DE 0 HASTA 6:
            fecha = addDays(lunes, d)
            dias.AÑADIR { fecha, futuro: fecha > hoy }   // RF-6
        semanas.AÑADIR dias
    DEVOLVER semanas

FUNCIÓN buildHeatmap(sesiones, hoy, numSemanas):
    acumulado = minutosPorDia(sesiones, hoy)
    semanas   = ventanaSemanas(hoy, numSemanas)
    tieneDatos = FALSO
    PARA cada semana EN semanas:
        PARA cada dia EN semana:
            dia.minutos = acumulado[dia.fecha] o 0
            dia.nivel   = nivelIntensidad(dia.minutos)     // RF-2
            SI dia.minutos > 0: tieneDatos = VERDADERO
    mensaje = SI tieneDatos ENTONCES null
              SINO "Aún no hay datos en las últimas 12 semanas"   // RF-7
    DEVOLVER { semanas, tieneDatos, mensaje }
```

---

## 4. Cómo se pinta en la interfaz

La interfaz **no calcula nada**: recibe el modelo de `buildHeatmap` y lo dibuja.

**Estructura añadida en `index.html`** (RF-4, RF-5, RF-7):
- Una sección `.mapa-calor` con: título, un contenedor de la rejilla
  (`id="mapa-calor"`), un elemento de etiqueta del día
  (`id="mapa-etiqueta"`, `aria-live="polite"`) y la leyenda fija
  "Menos ▢▢▢▢ Más".

**Función de pintado en `app.js`** `actualizarMapaCalor()`:
1. Llama a `buildHeatmap(obtenerSesiones(), fechaAtexto(new Date()), 12)`.
2. Vacía el contenedor y lo reconstruye con `createElement` (mismo estilo que
   `actualizarLista`): una columna por semana, una celda por día.
3. Por cada día:
   - Si `futuro` → **no** dibuja celda; deja un hueco no interactivo (RF-6).
   - Si no → dibuja celda con `class="nivel-N"` (N = `dia.nivel`), `data-fecha`,
     `tabindex="0"` y `aria-label` con fecha y minutos (RF-2, RF-4).
4. Interacción (RF-4): `mouseenter`/`focus`/`touchstart` muestran `#mapa-etiqueta`
   con el texto del día; `mouseleave`/`blur`/toque fuera la ocultan. El texto se
   compone en la interfaz a partir de fecha + minutos ("30 sept — 45 min" o
   "28 sept — sin sesión").
5. Si `mensaje` no es nulo → mostrar el mensaje junto al mapa; la rejilla se pinta
   igual (RF-7). La leyenda se pinta siempre (RF-5).

**Llamadas**: se añade `actualizarMapaCalor()` junto a las demás `actualizar*()` en
el arranque (PASO 6) y en el `submit` del formulario, para que el mapa se
recalcule al guardar una sesión.

**Estilos (`styles.css`)**: rejilla en cuadrícula compacta (columnas = semanas,
filas = días, lunes arriba), celdas cuadradas, cinco tonos derivados del color de
acento de la app; leyenda en una fila; etiqueta flotante legible; en móvil, celdas
que se ajustan al ancho sin desbordar (RNF-2).

---

## 5. Decisiones técnicas justificadas (con alternativa descartada)

1. **Lógica en archivo aparte `heatmap.js`, cargado con `<script>` antes de
   `app.js`** — *RF: todos.*
   - **Por qué**: cumple la constitución #3 (lógica pura separada de la interfaz) y
     permite probarla con `node --test` sin navegador.
   - **Alternativa descartada**: dejar todo dentro de `app.js` con DOM y
     localStorage mezclados. Se descarta porque no se puede testear y viola #3.

2. **Exportación mediante guardia CommonJS** (`if (typeof module !== "undefined")
   módulo.exports = { … }`) al final de `heatmap.js`.
   - **Por qué**: el mismo archivo sirve de `<script>` clásico en el navegador y de
     `require()` en Node, sin build (constitución #1) ni `type="module"`
     (prohibido por `AGENTS.md` y roto en `file://`).
   - **Alternativa descartada**: módulos ES. Se descarta porque `AGENTS.md` los
     prohíbe y no cargan con doble clic. Otra alternativa descartada: duplicar la
     lógica en el test (mantenimiento doble y tests que no prueban el código real).

3. **`heatmap.js` autocontenido**, con sus propias utilidades de fecha mínimas, en
   lugar de extraer las de `app.js`.
   - **Por qué**: evita reescribir la lógica que ya funciona (regla de `AGENTS.md`:
     cambios pequeños y enfocados) y reduce el riesgo sobre los datos del usuario.
   - **Alternativa descartada**: refactorizar `app.js` extrayendo un `fechas.js`
     compartido. Es más limpio a largo plazo, pero toca funciones críticas
     (racha, semana) y amplía el alcance. **Deuda registrada**: si se abordan más
     funcionalidades, proponer esa extracción como tarea aparte.

4. **"hoy" como texto local `"AAAA-MM-DD"`, no `Date`.**
   - **Por qué**: respeta la regla de fechas (constitución #5 y skill `local-dates`);
     comparar cadenas evita por completo el corrimiento UTC.
   - **Alternativa descartada**: pasar objetos `Date`: introduce riesgo de zonas
     horarias y de comparaciones inconsistentes.

5. **Rejilla en columnas (semanas), lunes arriba (estilo GitHub).**
   - **Por qué**: lectura natural del tiempo de izquierda a derecha y encaja en
     vertical en móvil (RNF-2).
   - **Alternativa descartada**: semanas en filas; en móvil obliga a scroll
     horizontal o a celdas diminutas.

6. **Etiqueta del día como elemento propio** (`#mapa-etiqueta`) actualizado por
   eventos, en lugar del atributo `title`.
   - **Por qué**: `title` no funciona de forma fiable en táctil ni teclado, y no
     permite el formato fijo en español exigido por RF-4.
   - **Alternativa descartada**: `title` nativo; se descarta por accesibilidad e
     inconsistencia entre navegadores.

7. **Construcción del DOM con `createElement`**, igual que `actualizarLista`.
   - **Por qué**: consistencia con el estilo del proyecto y ausencia de riesgos de
     inyección al no usar HTML dinámico.
   - **Alternativa descartada**: plantillas con `innerHTML`; se descarta por
     coherencia y por evitar concatenar HTML.

8. **Lectura defensiva de campos y no migración de datos.**
   - **Por qué**: la constitución #5 prohíbe perder sesiones; el mapa solo lee y
     tolera variantes de nombre de campo.
   - **Alternativa descartada**: renombrar/ migrar las claves de las sesiones; se
     descarta por riesgo de pérdida y porque queda fuera del alcance de esta spec.

---

## 6. Estrategia de tests con `node --test`

- **Ubicación**: `test/heatmap.test.js`. Se ejecuta con `node --test` (sin
  `package.json` ni paquetes; constitución #1 y #4).
- **Cómo importa la lógica**: `const { … } = require("../heatmap.js")` (guardia
  CommonJS ya descrita).
- **Enfoque**: pruebas de tabla (entrada → esperado) sobre funciones puras, con
  "hoy" fijo inyectado; nada de DOM.
- **Cobertura por requisito**:

| Área | Casos | RF |
|---|---|---|
| Fronteras de intensidad | 0, 1, 30, 31, 60, 61, 120, 121 min → niveles 0,1,1,2,2,3,3,4 | RF-2 |
| Suma por día | 2–3 sesiones mismo día → minutos y nivel de la suma | RF-3 |
| Fechas futuras | sesión `> hoy` no influye en ningún día | RF-8 |
| Ventana de semanas | 12 semanas, 7 días, primera empieza en lunes, última contiene hoy | RF-1 |
| Día futuro | en la semana de hoy, `futuro = true`; resto `false` | RF-6 |
| Estado sin datos | sin sesiones → `tieneDatos = false` y mensaje; con datos → `true` y `mensaje = null` | RF-7 |
| Sesiones fuera de ventana | antiguas → `tieneDatos = false` | RF-7 |
| Datos inválidos | minutos negativos/`NaN`/ausentes → 0; fecha inválida → ignorada | RF-2 |
| Casos de calendario | hoy lunes, hoy domingo, cambio de mes, cambio de año, 29 feb | RF-1, RF-6 |

- **Puerta de calidad** (constitución #4): no se da la funcionalidad por terminada
  con tests en rojo.
- **Verificación manual complementaria** (AGENTS.md): abrir `index.html` con Chrome
  DevTools, registrar varias sesiones (incluida una futura), revisar consola y vista
  móvil de 375 px.

---

## 7. Trazabilidad RF → partes del plan

| RF | Cubierto por |
|---|---|
| RF-1 Ventana 12 semanas | `ventanaSemanas` (lógica), `buildHeatmap`, tests, rejilla |
| RF-2 Intensidad por franjas | `nivelIntensidad`, `minutosValidos`, celdas por nivel, tests |
| RF-3 Suma por día | `minutosPorDia`, tests |
| RF-4 Detalle del día | etiqueta `#mapa-etiqueta`, eventos de pintado, `aria-label` |
| RF-5 Leyenda | estructura `index.html`, estilos, siempre visible |
| RF-6 Días sin sesión/futuros | `ventanaSemanas` (`futuro`), pintado de huecos |
| RF-7 Estado sin datos | `buildHeatmap` (`tieneDatos`, `mensaje`), pintado del mensaje |
| RF-8 Ignorar futuro | `minutosPorDia`, tests |
| RNF-1 Español | textos de leyenda, mensaje y etiqueta |
| RNF-2 Móvil | estilos de rejilla y etiqueta |
| RNF-3 Simplicidad | sin dependencias/build; guardia CommonJS |
| RNF-4 Datos intactos | solo lectura; sin migración |
| RNF-5 Coherencia con la app | utilidades de fecha locales; reutiliza el patrón de hora local |
| RNF-6 Lógica pura | todo `heatmap.js` recibe "hoy"; sin DOM/almacenamiento |
| RNF-7 Tests como puerta | `test/heatmap.test.js` con `node --test` |
| RNF-8 Idiomas | nombres de función en inglés; textos en español |
| RNF-9 Almacenamiento corrupto | `obtenerSesiones` ya tolera ausencia; el mapa cae en "sin datos" |
