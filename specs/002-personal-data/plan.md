# Plan 002 — Datos personales y perfil del usuario

> **Qué**: implementar `specs/002-personal-data/spec.md`.
> **Restricciones**: `docs/constitution.md` y `AGENTS.md` (sin dependencias, sin build,
> funciona con doble clic `file://`, sin `type="module"` ni `fetch` local; lógica pura
> separada de la interfaz que recibe "hoy"; tests con `node --test`; datos del usuario
> intactos; interfaz y documentación en español, código en inglés).
> **Decisión de gobernanza ya resuelta**: los datos personales mínimos, locales y
> controlados por el usuario están permitidos (regla de `AGENTS.md` matizada).

---

## 1. Archivos que se crean o se modifican

| Archivo | Acción | Responsabilidad | RF cubiertos |
|---|---|---|---|
| `profile.js` | **Crear** | Lógica **pura** del perfil: constantes (paleta, perfil por defecto), normalización/validación de cada campo, inicial del avatar, cálculo del progreso de la meta y minutos de la semana, y parseo del texto guardado. Sin DOM ni `localStorage`. Exporta con guardia CommonJS (como `heatmap.js`). | RF-2, RF-3, RF-4, RF-5, RF-8 |
| `test/profile.test.js` | **Crear** | Tests con `node:test` + `node:assert`, sin paquetes. | RNF-7 (verifica RF-2, RF-3, RF-4, RF-5, RF-8) |
| `index.html` | **Modificar** | Sección/vista de perfil (formulario + avatar + progreso + avisos), el saludo en la pantalla principal y la carga de `profile.js` **antes** de `app.js`. | RF-1, RF-5, RF-8, RF-9 |
| `styles.css` | **Modificar** | Estilos de la vista de perfil, avatar de inicial+color, barra de progreso, aviso de corrupción y saludo; móvil sin desbordes. | RF-3, RF-4, RNF-4, RNF-9, RNF-10 |
| `app.js` | **Modificar** | Capa de interfaz + almacenamiento: leer/guardar/borrar el perfil en `localStorage` (clave independiente), renderizado, eventos y aplicación de la preferencia. No toca la lógica de sesiones. | RF-1, RF-5, RF-6, RF-7, RF-8, RF-9 |
| `MEMORY.md` | **Modificar** | Registrar estado y decisiones al terminar. | — (proceso) |
| `README.md` | **Modificar** | Añadir la funcionalidad a "Qué hace" y su fila al historial. | — (proceso) |

> No se crean `package.json` ni dependencias. Se reutiliza el patrón de `heatmap.js`
> (guardia CommonJS) para que `profile.js` sirva como `<script>` y en `node --test`.

**Almacenamiento**: nueva clave `perfil` en `localStorage`, **independiente** de
`sesiones` (RF-7). Forma guardada:
`{ nombre: string, color: string, meta: number|null, saludo: boolean, version: 1 }`.

---

## 2. Funciones puras de lógica (con datos de entrada)

Todas en `profile.js`; no tocan DOM ni almacenamiento y son deterministas.

| Función (código en inglés) | Entrada | Salida | Responsabilidad | RF |
|---|---|---|---|---|
| `PALETA` (constante) | — | lista de colores válidos | Paleta fija de colores de avatar. | RF-3 |
| `COLOR_DEFECTO` (constante) | — | string | Color por defecto de la paleta. | RF-3 |
| `PERFIL_POR_DEFECTO` (constante) | — | objeto | Perfil por defecto (nombre vacío, color por defecto, sin meta, saludo activado). | RF-1, RF-8 |
| `recortarNombre(valor)` | valor cualquiera | `{ nombre, truncado }` | Recorta espacios y limita a 40 caracteres; marca si truncó. | RF-2 |
| `esNombreValido(valor)` | valor cualquiera | booleano | `true` si, tras recortar, hay entre 1 y 40 caracteres y solo contiene letras (con acentos), espacios, guiones o apóstrofes (sin dígitos ni otros símbolos). | RF-2 |
| `inicialAvatar(nombre)` | string | string (1 carácter) | Primera **letra** en mayúscula; `?` si no hay ninguna. | RF-3 |
| `esColorValido(color)` | string | booleano | `true` si el color pertenece a `PALETA`. | RF-3 |
| `normalizarColor(color)` | string | string | Devuelve el color si es válido; si no, `COLOR_DEFECTO`. | RF-3 |
| `esMetaValida(valor)` | valor cualquiera | booleano | `true` si es entero entre 0 y 10080 (0 = sin meta). | RF-4 |
| `normalizarMeta(valor)` | valor cualquiera | number\|null | Entero > 0, o `null` si 0/vacío; lanza/`null` si inválido (según uso). | RF-4 |
| `minutosSemana(sesiones, hoy)` | sesiones + hoy (`"AAAA-MM-DD"`) | number | Suma de minutos de lunes a hoy, ignorando futuras y datos inválidos. | RF-4, RNF-7 |
| `progresoMeta(minutosSemana, meta)` | number + number\|null | `{ tieneMeta, minutos, meta, porcentaje, cumplida, restante }` | Progreso respecto a la meta; `tieneMeta:false` si no hay meta. | RF-4 |
| `textoSaludo(perfil)` | perfil | string\|null | "Hola, {nombre}" si la preferencia está activa y hay nombre; si no, `null`. | RF-5 |
| `normalizarPerfil(datos)` | objeto | perfil válido | Rellena por defecto y corrige cada campo inválido por separado. | RF-3, RF-4, RF-5, RF-8 |
| `parsearPerfil(textoGuardado)` | string\|null | `{ perfil, estado }` | Interpreta el texto guardado: `"ok"`, `"vacio"` o `"corrupto"` (JSON inválido o forma no-objeto). | RF-8 |
| `construirPerfil(entrada)` | campos del formulario | `{ ok, perfil?, error? }` | Valida y ensambla un perfil listo para guardar (nombre obligatorio, campos normalizados). | RF-2, RF-3, RF-4, RF-5 |

**Decisiones de diseño de estas funciones**
- Ninguna lee el reloj: `hoy` y las sesiones entran como parámetros (constitución #3).
- `parsearPerfil` separa "leer/validar" (puro, testeable) de "acceder a
  `localStorage`" (impuro, en `app.js`).
- El modelo de salida es de datos, no de HTML: la interfaz no contiene reglas de negocio.

---

## 3. Algoritmo en pseudocódigo

### 3.1 Validación y construcción (guardado)
```
FUNCIÓN construirPerfil(entrada):
    { nombre, truncado } = recortarNombre(entrada.nombre)
    SI nombre vacío:
        DEVOLVER { ok:false, error:"El nombre es obligatorio" }

    color = normalizarColor(entrada.color)          // fuera de paleta -> defecto

    meta = entrada.meta
    SI meta vacío O meta == 0:
        meta = null                                  // sin meta
    SINO SI NO esMetaValida(meta):
        DEVOLVER { ok:false, error:"La meta debe ser un número entero entre 1 y 10080 de minutos" }
    // si esMetaValida pasa, meta ya es un entero válido

    saludo = Boolean(entrada.saludo)

    DEVOLVER { ok:true, perfil:{ nombre, color, meta, saludo, version:1 }, truncado }
```

### 3.2 Lectura (al abrir la app)
```
FUNCIÓN parsearPerfil(textoGuardado):
    SI textoGuardado vacío o nulo:
        DEVOLVER { perfil: PERFIL_POR_DEFECTO, estado:"vacio" }
    INTENTAR datos = JSON.parse(textoGuardado)
    SI falla, O datos no es objeto, O datos es null:
        DEVOLVER { perfil: PERFIL_POR_DEFECTO, estado:"corrupto" }
    DEVOLVER { perfil: normalizarPerfil(datos), estado:"ok" }

FUNCIÓN normalizarPerfil(datos):
    nombre = esNombreValido(datos.nombre) ? recortarNombre(datos.nombre).nombre : ""
    color  = normalizarColor(datos.color)
    meta   = (datos.meta !== null && datos.meta !== 0 && esMetaValida(datos.meta)) ? datos.meta : null
    saludo = (typeof datos.saludo === "boolean") ? datos.saludo : true
    DEVOLVER { nombre, color, meta, saludo, version:1 }
```

### 3.3 Guardado y borrado (impuro, en `app.js`)
```
FUNCIÓN guardarPerfilEnDispositivo(perfil):
    INTENTAR localStorage.setItem("perfil", JSON.stringify(perfil))
    SI falla (cuota/almacenamiento no disponible):   // RF-6, caso límite
        mostrarAviso("No se pudo guardar en este dispositivo")
        mantener perfil en memoria (estado de la sesión)

FUNCIÓN borrarPerfilDelDispositivo():
    localStorage.removeItem("perfil")                 // NO toca "sesiones" (RF-7, RF-9)
```

### 3.4 Progreso de la meta
```
FUNCIÓN minutosSemana(sesiones, hoy):
    lunes = startOfWeek(hoy)                    // reutiliza la lógica ya existente
    suma = 0
    PARA cada sesion EN sesiones:
        fecha = fecha válida de la sesión; SI no: continuar
        SI fecha > hoy O fecha < lunes: continuar
        suma += minutos válidos (>=0)
    DEVOLVER suma

FUNCIÓN progresoMeta(minutosSemana, meta):
    SI meta es null O meta <= 0:
        DEVOLVER { tieneMeta:false }
    porcentaje = min(100, floor(minutosSemana / meta * 100))
    DEVOLVER {
        tieneMeta:true, minutos:minutosSemana, meta,
        porcentaje, cumplida: minutosSemana >= meta,
        restante: max(0, meta - minutosSemana)
    }
```

---

## 4. Renderización e interacción en la interfaz

La interfaz **no calcula reglas**: consume `profile.js` y pinta.

**Estructura añadida en `index.html`** (RF-1, RF-5, RF-8, RF-9):
- **Saludo** en la cabecera de la pantalla principal: `#saludo` (vacío si no aplica).
- **Botón/avatar** para abrir la vista de perfil.
- **Vista de perfil** (`.perfil`, mostrable/ocultable):
  - Avatar de previsualización (`#perfil-avatar`).
  - Campo **nombre** (`#perfil-nombre`).
  - Selector de **color** de la paleta (botones/radios).
  - Campo **meta semanal** en minutos (`#perfil-meta`).
  - Interruptor **"Mostrar saludo"** (checkbox).
  - **Barra de progreso** de la meta (minutos de la semana vs. meta; oculta si no hay
    meta).
  - Botones **Guardar** y **Borrar perfil** (con confirmación).
  - Zona de **mensajes** (errores de validación y éxito).
  - **Aviso de corrupción** con botón **"Reiniciar perfil"** (solo si `estado === "corrupto"`).

**Flujo en `app.js`**:
1. Al arrancar: `parsearPerfil(localStorage.getItem("perfil"))`.
   - `"ok"`/`"vacio"` → usar el perfil y pintar.
   - `"corrupto"` → usar `PERFIL_POR_DEFECTO`, **mostrar el aviso** y **no borrar nada**
     (RF-8).
2. `renderPerfil(perfil, estado)`: pinta campos, avatar (inicial + color), progreso y
   saludo; conmuta el aviso de corrupción.
3. `onGuardar`: llamar a `construirPerfil(entrada)`; si `ok`, guardar y repintar; si no,
   mostrar el error (RF-2, RF-4).
4. `onBorrarPerfil` / `Reiniciar perfil`: pedir confirmación, borrar la clave `perfil`,
   repintar con el perfil por defecto. **Nunca** se toca `sesiones` (RF-7, RF-9).
5. La preferencia del saludo se aplica de inmediato al conmutarla (RF-5).

**Estilos (`styles.css`)**: avatar circular con inicial y color; barra de progreso
accesible; vista que se apila bien en móvil; estado de meta cumplida destacado; nombre
largo con recorte visual sin romper el diseño (RNF-4).

**Accesibilidad (RNF-10)**: campos con `label`; avatar con descripción (`aria-label` o
texto alternativo); barra de progreso con su valor anunciado; navegación con teclado.

---

## 5. Decisiones técnicas justificadas (con alternativa descartada)

1. **Lógica pura en `profile.js` aparte, cargada antes de `app.js`** — *RF: RF-2 a RF-5, RF-8; RNF-7.*
   - **Por qué**: constitución #3 (lógica separada, "hoy" como parámetro) y posibilidad
     de probarla con `node --test` sin navegador.
   - **Alternativa descartada**: ponerlo todo en `app.js` mezclando DOM y
     `localStorage`. No es testeable y viola #3.

2. **Guardia CommonJS** (`if (typeof module !== "undefined" && module.exports)`) al final de `profile.js`.
   - **Por qué**: el mismo archivo sirve de `<script>` clásico y de `require()` en Node,
     sin build ni módulos ES (prohibidos por `AGENTS.md` y rotos en `file://`).
   - **Alternativa descartada**: módulos ES, o duplicar la lógica en el test (doble
     mantenimiento y tests que no prueban el código real).

3. **Clave `localStorage` nueva `perfil`, separada de `sesiones`** — *RF-7.*
   - **Por qué**: cumple la independencia exigida y evita cualquier riesgo sobre las
     sesiones (constitución #5, RNF-6).
   - **Alternativa descartada**: guardar el perfil dentro del registro de sesiones.
     Mezclaría dominios y pondría en riesgo los datos existentes.

4. **`parsearPerfil` pura + acceso a `localStorage` en `app.js`** — *RF-8.*
   - **Por qué**: separa la validación (testeable) del efecto lateral (impuro).
   - **Alternativa descartada**: que `profile.js` lea `localStorage` directamente; haría
     la lógica impura e intesteable.

5. **Campo `version` en el perfil guardado** — *RNF-8.*
   - **Por qué**: compatibilidad hacia atrás (constitución #5); permite migrar sin
     perder el perfil.
   - **Alternativa descartada**: guardar sin versión; imposibilita migraciones limpias.

6. **Avatar como inicial + color de paleta fija (sin imágenes)** — *RF-3.*
   - **Por qué**: privacidad, simplicidad y límites de `localStorage`; decisión de la
     spec.
   - **Alternativa descartada**: guardar imágenes en `localStorage` (ocupan mucho, se
     suben sin querer); o URL externa (dependencia de red y privacidad).

7. **Preferencia única (saludo), no sistema de temas** — *RF-5.*
   - **Por qué**: acotado por la spec ("no es un sistema de temas") y por simplicidad.
   - **Alternativa descartada**: sistema de temas completo (fuera de alcance).

8. **Reutilizar el patrón de `heatmap.js` (guardia + lógica de fecha local mínima) en lugar de refactorizar funciones de `app.js`**.
   - **Por qué**: `AGENTS.md` pide cambios pequeños y enfocados y no reescribir lo que
     funciona; además, `calcularTotalSemana` de `app.js` usa `new Date()` interno (no
     recibe "hoy"), así que no cumple la constitución #3 para testear.
   - **Alternativa descartada**: extraer un `dates.js` compartido y refactorizar
     `app.js`. Más limpio a largo plazo, pero amplía el alcance y toca lógica crítica.
     **Deuda registrada**: proponer esa extracción como tarea aparte si se acumulan más
     funciones de fecha.

9. **Validación que bloquea el guardado si la meta es inválida** — *RF-4.*
   - **Por qué**: "la rechazará" se interpreta como impedir guardar ese valor, avisando
     con un mensaje claro; el usuario corrige sin perder los demás campos.
   - **Alternativa descartada**: ignorar la meta inválida y guardar el resto en
     silencio; confuso para el usuario, que no sabría por qué no se guardó su meta.

10. **Corrupción = JSON inválido o forma no-objeto; resto de campos se normaliza por separado** — *RF-8.*
    - **Por qué**: coincide con la spec; un campo suelto raro (p. ej. color fuera de
      paleta) no debe considerarse "perfil corrupto" ni borrar nada.
    - **Alternativa descartada**: tratar cualquier campo inválido como corrupción;
      provocaría avisos innecesarios.

---

## 6. Estrategia de tests con `node --test`

- **Ubicación**: `test/profile.test.js`. Se ejecuta con `node --test`, sin
  `package.json` ni paquetes (constitución #1 y #4).
- **Importación**: `const { … } = require("../profile.js")`.
- **Enfoque**: pruebas de tabla (entrada → esperado) sobre funciones puras; sin DOM.

| Área | Casos | RF |
|---|---|---|
| Nombre válido | "Ana", "J", 40 caracteres → ok; recorte de espacios " Ana " → "Ana"; "José María", "Jean-Luc", "O'Neill" → válidos | RF-2 |
| Nombre inválido | "", "   " → rechazado (error "obligatorio"); "Ana123", "123", "Ana!" → rechazado (solo letras) | RF-2 |
| Nombre largo | 41+ caracteres → truncado a 40 y marcado `truncado` | RF-2 |
| Inicial del avatar | "ana"→"A"; "él"→"É"; "Jean-Luc"→"J"; "O'Neill"→"O"; ""→"?"; "..."→"?" | RF-3 |
| Color | color de paleta válido; fuera de paleta → defecto | RF-3 |
| Meta | 1, 60, 10080 válidos; 0 → null; -5, 1.5, "abc", 10081 → inválidos | RF-4 |
| Progreso | sin meta → `tieneMeta:false`; 30/60 → 50%; 60/60 → `cumplida:true`; 90/60 → 100% y `restante:0` | RF-4 |
| Minutos de semana | varias sesiones lunes-hoy suman; futuras y anteriores al lunes se ignoran; cruces de mes | RF-4, RNF-7 |
| Saludo | activado+nombre → "Hola, Ana"; desactivado → null; sin nombre → null | RF-5 |
| Parseo | `null`/"" → `"vacio"`; `"{roto"` → `"corrupto"`; `"[]"`/"42" → `"corrupto"`; objeto válido → `"ok"` | RF-8 |
| Normalización | objeto con campos raros → cada campo corregido por separado (color y meta a por defecto, saludo a `true`) | RF-3, RF-4, RF-5, RF-8 |
| Compatibilidad | objeto sin `version` → se normaliza igual (no pierde el perfil) | RNF-8 |

- **Puerta de calidad** (constitución #4): no se da la funcionalidad por terminada con
  tests en rojo.
- **Integración / verificación manual** (AGENTS.md, criterio 13): con Chrome DevTools —
  abrir `index.html`, crear/editar/borrar perfil, probar meta y saludo, forzar un
  `perfil` corrupto en `localStorage` (aviso + reinicio), comprobar consola sin errores
  y vista móvil a 375 px.

---

## 7. Trazabilidad RF → partes del plan

| RF | Cubierto por |
|---|---|
| RF-1 Vista de perfil | sección `.perfil` en `index.html`, `renderPerfil`, estilos |
| RF-2 Nombre | `recortarNombre`, `esNombreValido`, `construirPerfil`, campo nombre, tests |
| RF-3 Avatar | `inicialAvatar`, `normalizarColor`, `PALETA`, avatar en UI, tests |
| RF-4 Meta + progreso | `esMetaValida`, `normalizarMeta`, `minutosSemana`, `progresoMeta`, barra, tests |
| RF-5 Preferencia (saludo) | `textoSaludo`, interruptor, `#saludo`, aplicación inmediata, tests |
| RF-6 Persistencia local | `guardarPerfilEnDispositivo`, `parsearPerfil`, clave `perfil` |
| RF-7 Independencia | clave `perfil` separada; borrado que no toca `sesiones` |
| RF-8 Tolerancia a corrupción | `parsearPerfil` (`estado:"corrupto"`), aviso + "Reiniciar perfil", tests |
| RF-9 Borrar perfil | botón borrar con confirmación, `borrarPerfilDelDispositivo`, tests indirectos |
| RNF-1 Privacidad | solo `localStorage`; sin red |
| RNF-2 Datos mínimos | modelo de perfil acotado; sin secretos |
| RNF-3 Español | textos de la UI, errores y avisos |
| RNF-4 Móvil | estilos de vista/avatar/progreso; prueba a 375 px |
| RNF-5 Simplicidad | guardia CommonJS; sin dependencias/build |
| RNF-6 Datos protegidos | clave separada; borrado no afecta a `sesiones` |
| RNF-7 Lógica pura y tests | `profile.js` recibe "hoy"; `test/profile.test.js` |
| RNF-8 Compatibilidad | campo `version`; normalización tolerante; test |
| RNF-9 Coherencia | mismas reglas de fecha local y lenguaje visual |
| RNF-10 Accesibilidad | `label`s, `aria-label` del avatar, progreso anunciado, teclado |
