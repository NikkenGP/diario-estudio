# Tasks 002 — Datos personales y perfil del usuario

> Descompone `specs/002-personal-data/spec.md` según `specs/002-personal-data/plan.md`.
> Tareas pequeñas (20–30 min), en orden estricto de dependencia. Cada una indica los
> RF que cubre y una línea **"Hecho cuando:"** verificable.
> Respeta `docs/constitution.md` y `AGENTS.md` (sin dependencias, sin build, lógica pura
> con "hoy", tests con `node --test`, datos del usuario intactos, textos en español).

---

## Fase 0 — Preparación del módulo de lógica

- [x] **T1. Crear el esqueleto de `profile.js` con guardia CommonJS**
  - **RF:** RNF-5
  - Crear el archivo con el patrón `if (typeof module !== "undefined" && module.exports)`
    (igual que `heatmap.js`), las constantes (`PALETA`, `COLOR_DEFECTO`,
    `PERFIL_POR_DEFECTO`) exportadas y las funciones declaradas (vacías o mínimas). Sin
    DOM ni `localStorage`.
  - **Hecho cuando:** `node -e "require('./profile.js')"` no lanza error y el archivo
    puede cargarse también como `<script>` clásico.

- [x] **T2. Crear `test/profile.test.js` y verificar que se ejecuta**
  - **RF:** RNF-7
  - Crear el archivo con `node:test` y `node:assert`, importando desde
    `../profile.js`. Añadir un test trivial que pase.
  - **Hecho cuando:** `node --test` termina en verde (0 fallos) sin instalar nada.

---

## Fase 1 — Lógica pura: nombre y avatar

- [x] **T3. Validar y recortar el nombre**
  - **RF:** RF-2
  - Implementar `recortarNombre(valor)` y `esNombreValido(valor)`: recortan espacios y
    limitan a 40 caracteres (marcando `truncado`); vacío o solo espacios → inválido.
  - **Hecho cuando:** los tests confirman que " Ana " → "Ana", 41+ caracteres → 40 y
    `truncado:true`, y "" / "   " → inválido.

- [x] **T4. Inicial y color del avatar**
  - **RF:** RF-3
  - Implementar `inicialAvatar(nombre)`, `esColorValido(color)` y
    `normalizarColor(color)` sobre `PALETA` y `COLOR_DEFECTO`.
  - **Hecho cuando:** los tests confirman "ana"→"A", "123"→"1", "💡ana"→"A", ""/"..."→"?",
    y que un color fuera de la paleta se normaliza al color por defecto.

---

## Fase 2 — Lógica pura: meta, progreso y preferencia

- [x] **T5. Validar y normalizar la meta**
  - **RF:** RF-4
  - Implementar `esMetaValida(valor)` y `normalizarMeta(valor)`: entero entre 0 y 10080;
    0 o vacío → `null` (sin meta); no numérico, decimal, negativo o > 10080 → inválido.
  - **Hecho cuando:** los tests confirman válidos 1, 60 y 10080; 0 → null; inválidos
    -5, 1.5, "abc" y 10081.

- [x] **T6. Minutos de la semana (con "hoy")**
  - **RF:** RF-4, RNF-7
  - Implementar `minutosSemana(sesiones, hoy)`: suma de minutos de lunes a hoy,
    ignorando fechas futuras, anteriores al lunes o inválidas.
  - **Hecho cuando:** los tests confirman que suma lo que cae en la semana, ignora
    futuras y anteriores al lunes, y funciona al cruzar de mes.

- [x] **T7. Cálculo del progreso de la meta**
  - **RF:** RF-4
  - Implementar `progresoMeta(minutosSemana, meta)` → `{ tieneMeta, minutos, meta,
    porcentaje, cumplida, restante }`.
  - **Hecho cuando:** los tests confirman `tieneMeta:false` sin meta; 30/60 → 50%;
    60/60 → `cumplida:true`; 90/60 → 100% y `restante:0`.

- [x] **T8. Texto del saludo según la preferencia**
  - **RF:** RF-5
  - Implementar `textoSaludo(perfil)`: "Hola, {nombre}" si la preferencia está activa y
    hay nombre; en otro caso, `null`.
  - **Hecho cuando:** los tests confirman saludo con preferencia activa + nombre,
    `null` con preferencia desactivada y `null` sin nombre.

---

## Fase 3 — Lógica pura: lectura, tolerancia y ensamblado

- [x] **T9. Normalizar un perfil por campos**
  - **RF:** RF-3, RF-4, RF-5, RF-8
  - Implementar `normalizarPerfil(datos)`: completa por defecto y corrige cada campo
    inválido por separado (nombre, color, meta, saludo), añadiendo `version`.
  - **Hecho cuando:** los tests confirman que un objeto con campos raros se corrige campo
    a campo (color fuera de paleta → defecto, meta inválida → null, saludo no booleano →
    `true`) sin descartar el perfil entero.

- [x] **T10. Parseo tolerante del texto guardado**
  - **RF:** RF-8
  - Implementar `parsearPerfil(textoGuardado)` → `{ perfil, estado }` con estados
    `"ok"`, `"vacio"` y `"corrupto"` (JSON inválido o forma no-objeto).
  - **Hecho cuando:** los tests confirman `null`/""→"vacio", `"{roto"`/`"[]"`/`"42"`→
    "corrupto", y un objeto válido→"ok".

- [x] **T11. Ensamblar el perfil desde el formulario**
  - **RF:** RF-2, RF-3, RF-4, RF-5
  - Implementar `construirPerfil(entrada)` → `{ ok, perfil?, error?, truncado? }`,
    aplicando validación de nombre (obligatorio) y de meta, y normalizando color/saludo.
  - **Hecho cuando:** los tests confirman que sin nombre devuelve `ok:false` con error;
    con nombre y meta válidos devuelve `ok:true` y un perfil con `version:1`; con meta
    inválida devuelve `ok:false` sin perder los demás campos.

- [x] **T12. Completar la matriz de tests de la lógica**
  - **RF:** RF-2, RF-3, RF-4, RF-5, RF-8, RNF-7, RNF-8
  - Cubrir todos los casos de la tabla del plan §6, incluida la compatibilidad (objeto
    sin `version`).
  - **Hecho cuando:** `node --test` pasa en verde con todos los casos anteriores.

---

## Fase 4 — Interfaz: estructura y estilos

- [x] **T13. Estructura de la vista de perfil y el saludo en `index.html`**
  - **RF:** RF-1, RF-5, RF-8, RF-9
  - Añadir el saludo `#saludo`, el acceso a la vista, la sección `.perfil` (avatar,
    nombre, selector de color, meta, interruptor de saludo, barra de progreso, botones
    Guardar/Borrar, zona de mensajes y aviso de corrupción con "Reiniciar perfil"), y
    cargar `profile.js` **antes** de `app.js`.
  - **Hecho cuando:** al abrir `index.html` con doble clic los elementos existen en el
    DOM y la consola no muestra errores.

- [x] **T14. Estilos del perfil, avatar y progreso**
  - **RF:** RF-3, RF-4, RNF-4, RNF-9, RNF-10
  - En `styles.css`: avatar circular (inicial + color), barra de progreso, estado de meta
    cumplida, aviso de corrupción y saludo; apilado correcto en móvil sin desbordes.
  - **Hecho cuando:** en 375 px la vista de perfil se ve completa y usable, sin desborde
    horizontal, con nombres largos incluidos.

---

## Fase 5 — Interfaz: comportamiento

- [x] **T15. Leer, renderizar y aplicar el perfil al arrancar**
  - **RF:** RF-1, RF-3, RF-4, RF-5, RF-6, RF-8
  - En `app.js`: `parsearPerfil(localStorage.getItem("perfil"))`, `renderPerfil(perfil,
    estado)` (campos, avatar, progreso y saludo) y conmutar el aviso de corrupción sin
    borrar nada.
  - **Hecho cuando:** con un perfil guardado, al recargar se restaura todo; sin perfil se
    ve el perfil por defecto; con `perfil` corrupto se ve el aviso y la app sigue viva.

- [x] **T16. Guardar, borrar y reiniciar el perfil**
  - **RF:** RF-2, RF-4, RF-6, RF-7, RF-9
  - Implementar `onGuardar` (usando `construirPerfil`), el borrado con confirmación y el
    "Reiniciar perfil", escribiendo/borrando solo la clave `perfil`.
  - **Hecho cuando:** guardar persiste entre recargas; borrar/reiniciar deja el perfil por
    defecto; y en ningún caso se altera la clave `sesiones`.

- [x] **T17. Aplicar la preferencia del saludo al instante**
  - **RF:** RF-5
  - Conectar el interruptor para guardar y aplicar la preferencia de inmediato (mostrar u
    ocultar `#saludo`) usando `textoSaludo`.
  - **Hecho cuando:** al conmutar el interruptor, el saludo aparece o desaparece sin
    recargar y el cambio persiste tras recargar.

---

## Fase 6 — Verificación y cierre

- [x] **T18. Verificación manual con Chrome DevTools**
  - **RF:** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RNF-3, RNF-4
  - Abrir `index.html`, crear/editar/borrar perfil, probar meta y saludo, forzar un
    `perfil` corrupto en `localStorage` (aviso + reinicio), comprobar consola y vista
    móvil de 375 px.
  - **Hecho cuando:** no hay errores en consola, todos los RF se observan cumplidos y la
    vista se ve bien en móvil.

- [x] **T19. Cerrar la tarea: memoria, README y commit**
  - **RF:** — (proceso)
  - Actualizar `MEMORY.md`, añadir la funcionalidad a "Qué hace" y su fila al historial
    del `README.md`, y hacer commit/push con el token efímero de siempre.
  - **Hecho cuando:** `MEMORY.md` y `README.md` reflejan la funcionalidad terminada y el
    commit está subido a `origin/main`.

---

## Resumen de trazabilidad RF → tareas

| RF | Tareas |
|---|---|
| RF-1 Vista de perfil | T13, T15, T18 |
| RF-2 Nombre | T3, T11, T12, T16, T18 |
| RF-3 Avatar | T4, T9, T11, T12, T14, T15 |
| RF-4 Meta + progreso | T5, T6, T7, T9, T11, T12, T14, T15, T16 |
| RF-5 Preferencia (saludo) | T8, T9, T11, T12, T13, T15, T17 |
| RF-6 Persistencia local | T15, T16 |
| RF-7 Independencia | T16 (clave `perfil` separada) |
| RF-8 Tolerancia a corrupción | T9, T10, T12, T13, T15 |
| RF-9 Borrar perfil | T13, T16, T18 |
| RNF-4 Móvil | T14, T18 |
| RNF-5 Simplicidad | T1 |
| RNF-7 Lógica pura y tests | T2, T6, T12 |
| RNF-8 Compatibilidad | T9, T12 |
