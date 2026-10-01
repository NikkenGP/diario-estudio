# Spec 001 — Mapa de calor de días estudiados

## Contexto y objetivo

El Diario de Estudio ya muestra la racha actual, la mejor racha, el tiempo de la
semana y los días estudiados del mes. Estas cifras resumen el presente, pero no
dejan ver de un vistazo el **ritmo de estudio a lo largo del tiempo**: ¿estudio de
forma constante? ¿qué semanas fueron flojas?

El objetivo es añadir un **mapa de calor tipo GitHub** que muestre los días
estudiados de las últimas 12 semanas, donde la intensidad del color de cada día
refleja cuántos minutos se estudiaron ese día. Debe permitir detectar patrones
(rachas, huecos, picos) de forma inmediata, sin leer cifras.

Esta spec define el **qué** y el **por qué**. El cómo técnico se decidirá en el plan.

## Usuarios

- **Estudiante que usa la app a diario**: quiere ver su constancia y sentirse
  motivado al comprobar que no rompe la cadena.
- **Estudiante que retoma el hábito tras días sin estudiar**: quiere ver el hueco
  pasado con claridad y retomar sin sentirse juzgado.
- **Usuario nuevo (sin sesiones)**: necesita entender que aún no hay datos y cómo
  empezar a generarlos.

## Historias de usuario

- **HU-1**: Como estudiante, quiero ver de un vistazo mis últimas 12 semanas de
  estudio para saber si mantengo un ritmo constante.
- **HU-2**: Como estudiante, quiero que los días con más minutos se vean más
  intensos para comparar mi esfuerzo de forma inmediata.
- **HU-3**: Como estudiante, quiero consultar cuántos minutos estudié un día
  concreto para recordar qué hice ese día.
- **HU-4**: Como estudiante que vuelve tras un parón, quiero ver los días sin
  sesión de forma neutral (no como un error) para retomar sin frustración.
- **HU-5**: Como usuario nuevo, quiero un mensaje claro cuando aún no hay datos,
  en vez de un mapa vacío que parezca roto.

## Requisitos funcionales

### RF-1 — Ventana temporal
El mapa debe mostrar **exactamente 12 semanas**, contando la semana actual como la
más reciente (es decir, 11 semanas anteriores completas más la semana en curso).
Las semanas empiezan en **lunes** y terminan en domingo.

**Criterios de aceptación (EARS):**
- *Cuando* el usuario abre la app, el sistema **mostrará** un mapa de 12 semanas,
  alineadas a lunes, cuya semana más reciente es la actual.
- *Cuando* la semana actual esté incompleta (hoy no es domingo), el sistema
  **mostrará** la semana actual en el extremo más reciente, con los días
  posteriores a hoy sin dibujar (RF-6).

### RF-2 — Intensidad por umbrales fijos
La intensidad de cada día debe determinarse con **franjas fijas de minutos**, no
relativas al máximo del periodo, para que sea comparable entre semanas. Se
distinguen **cuatro niveles de intensidad creciente**, visualmente distinguibles
entre sí.

**Franjas (minutos enteros acumulados en el día):**
- 0 min → sin intensidad (día vacío, ver RF-6 y RF-7).
- 1–30 min → nivel suave.
- 31–60 min → nivel medio.
- 61–120 min → nivel alto.
- Más de 120 min → nivel máximo.

**Criterios de aceptación (EARS):**
- *Cuando* un día acumula entre 1 y 30 minutos, el sistema **mostrará** ese día con
  el nivel suave.
- *Cuando* un día acumula exactamente 30 minutos, el sistema **mostrará** ese día
  con el nivel suave (el límite superior pertenece a su franja).
- *Cuando* un día acumula exactamente 31 minutos, el sistema **mostrará** ese día
  con el nivel medio.
- *Cuando* un día acumula más de 120 minutos, el sistema **mostrará** ese día con
  el nivel máximo.
- *Cuando* un día no tiene ninguna sesión válida, el sistema **mostrará** ese día
  como recuadro vacío.
- *Cuando* el total de minutos de un día no sea un número válido (no numérico o
  negativo), el sistema **lo tratará** como 0 minutos.

### RF-3 — Agregación de varios registros en un mismo día
La intensidad de un día debe basarse en la **suma de minutos** de todas las
sesiones válidas de esa fecha, no en un único registro.

**Criterios de aceptación (EARS):**
- *Cuando* existen varias sesiones en el mismo día, el sistema **sumará** sus
  minutos y **asignará** la intensidad correspondiente a esa suma.

### RF-4 — Consulta del detalle de un día
Al interactuar con un día (ratón, toque o teclado), debe mostrarse la fecha y los
minutos estudiados ese día. Esta consulta **solo muestra información**: no navega,
no filtra ni abre otra vista.

**Criterios de aceptación (EARS):**
- *Cuando* el usuario pasa el ratón, toca o enfoca con el teclado un día con
  sesiones, el sistema **mostrará** la fecha y los minutos acumulados con el
  formato fijo "D mes — N min" (p. ej. "30 sept — 45 min"), usando el mes
  abreviado en español.
- *Cuando* el usuario interactúa con un día sin sesiones, el sistema **mostrará**
  esa fecha seguida de "sin sesión" (p. ej. "28 sept — sin sesión").
- *Cuando* el usuario deja de interactuar (retira el ratón, toca fuera o cambia el
  foco), el sistema **ocultará** la etiqueta del día.
- *Mientras* el usuario navegue con el teclado, el sistema **permitirá** alcanzar
  cada día y **expondrá** la misma información a las tecnologías de asistencia.

### RF-5 — Leyenda de la escala
El mapa debe incluir una **leyenda** que explique la correspondencia entre color e
intensidad, con el texto fijo "Menos" a un extremo y "Más" al otro, pasando por
los niveles intermedios.

**Criterios de aceptación (EARS):**
- *Cuando* el mapa se muestra, el sistema **mostrará** la leyenda con los niveles de
  intensidad de menor a mayor.
- *Cuando* no haya datos que mostrar (RF-7), el sistema **seguirá mostrando** la
  leyenda junto al mapa.

### RF-6 — Días sin sesión y días futuros
Un día sin sesión (pasado o anterior a hoy) se muestra como **recuadro vacío
dibujado** (celda visible, sin intensidad). Un día posterior a hoy dentro de la
semana en curso **no se dibuja**: queda como espacio en blanco, sin celda.

**Criterios de aceptación (EARS):**
- *Cuando* un día no tiene sesiones y no es futuro, el sistema **mostrará** una
  celda vacía dibujada.
- *Mientras* un día de la semana actual sea posterior a hoy, el sistema **no
  dibujará** celda para ese día (espacio en blanco).
- *Cuando* el usuario interactúe con el espacio en blanco de un día futuro, el
  sistema **no mostrará** ninguna etiqueta.

### RF-7 — Estado sin datos
Si no existen sesiones en toda la ventana temporal, el mapa se muestra igualmente
(todas las celdas vacías) acompañado de un mensaje.

**Criterios de aceptación (EARS):**
- *Cuando* el usuario no tiene ninguna sesión dentro de las 12 semanas mostradas, el
  sistema **mostrará** el mapa con todas sus celdas vacías y el mensaje
  "Aún no hay datos en las últimas 12 semanas".
- *Cuando* el usuario sí tenga sesiones, aunque sean más antiguas que la ventana, el
  sistema **mostrará** el mismo mensaje que en el caso sin datos.

### RF-8 — Ignorar fechas futuras en el cálculo
El cálculo de minutos por día no debe tener en cuenta sesiones con fecha posterior
a hoy.

**Criterios de aceptación (EARS):**
- *Cuando* existen sesiones con fecha posterior a hoy, el sistema **las ignorará**
  al calcular la intensidad de cualquier día del mapa.
- *Cuando* una sesión con fecha futura pertenezca a la semana actual, el sistema
  **no dibujará** su celda (prevalece RF-6 sobre RF-8: la celda futura no existe).

## Requisitos no funcionales

- **RNF-1 — Español**: todos los textos visibles (leyenda, mensajes, etiquetas)
  estarán en español.
- **RNF-2 — Móvil**: el mapa debe verse y usarse bien en pantalla de móvil, sin
  desbordes ni solapamientos, y sin provocar desplazamiento horizontal de la
  página.
- **RNF-3 — Simplicidad**: sin dependencias, frameworks ni build; la app debe seguir
  funcionando al abrir `index.html` con doble clic (`file://`). Prohibido usar
  librerías externas para el mapa.
- **RNF-4 — Datos intactos**: la funcionalidad no debe modificar, migrar ni poner en
  riesgo las sesiones ya guardadas del usuario. Solo debe leerlas.
- **RNF-5 — Coherencia con la app**: el lenguaje visual y las reglas de fechas
  (hora local, semana empieza en lunes) deben ser los mismos que ya usa el Diario.
- **RNF-6 — Lógica pura**: el cálculo del mapa (minutos por día, nivel de intensidad
  y generación de la rejilla de semanas) debe ser funciones puras sin DOM ni
  almacenamiento, que reciben "hoy" como parámetro.
- **RNF-7 — Tests como puerta**: la lógica pura de RNF-6 debe cubrirse con
  `node --test` sin instalar paquetes; no se da la funcionalidad por terminada con
  tests en rojo.
- **RNF-8 — Idiomas del código**: el código se escribe en inglés; la interfaz y la
  documentación, en español.
- **RNF-9 — Sin datos configurados**: si el almacenamiento no puede leerse o su
  contenido no es JSON válido, el mapa debe comportarse como "sin datos" (RF-7) sin
  romperse ni mostrar errores.

## Casos límite

- **Varias sesiones en un mismo día**: se suman los minutos (RF-3).
- **Día con exactamente 30, 60 o 120 minutos**: cae en la franja superior de su
  rango (RF-2).
- **Minutos no válidos** (no numéricos, negativos o ausentes): se tratan como 0
  (RF-2).
- **Sesiones con fecha futura**: se ignoran (RF-8).
- **Semana actual incompleta**: los días futuros no se dibujan (RF-6).
- **Hoy es lunes**: la semana actual solo muestra el lunes; el resto en blanco.
- **Hoy es domingo**: la semana actual se muestra completa.
- **Usuario sin ninguna sesión en 12 semanas**: mensaje informativo (RF-7).
- **Sesiones más antiguas que la ventana**: no se muestran, no se borran y producen
  el mensaje de RF-7.
- **Primera semana de la ventana**: siempre empieza en un lunes completo, porque la
  ventana son 12 semanas alineadas a lunes.
- **Cambio de mes o de año**: la ventana cruza meses y años sin alterar la
  orientación.
- **Año bisiesto**: el 29 de febrero se trata como un día más.
- **Cambio de hora (marzo/octubre)**: no debe provocar días duplicados ni saltados.
- **Sesión a las 00:30**: cuenta en el día local correcto.
- **Almacenamiento ilegible o corrupto**: se comporta como "sin datos" (RNF-9).
- **Interacción táctil sin hover**: el toque muestra la etiqueta; un toque fuera la
  oculta (RF-4).
- **Navegación por teclado**: cada día es alcanzable y anuncia su información
  (RF-4).
- **Pantallas muy estrechas**: el mapa se ajusta sin provocar scroll horizontal
  (RNF-2).
- **Datos modificados en otra pestaña**: no se requiere refresco en vivo; el mapa se
  recalcula al cargar la página.

## Fuera de alcance

- El mapa **no navega ni filtra**: interactuar solo muestra la etiqueta del día; no
  abre ni filtra el historial.
- **Sin opciones configurables**: no se puede cambiar el rango de semanas ni elegir
  entre minutos y sesiones.
- **Sin exportar ni compartir** la imagen del mapa.
- **Solo minutos**: no se visualizan rachas, temas ni horas por tema en el mapa.
- **Sin series históricas agregadas** (medias mensuales, tendencias, etc.).
- **Sin comparación entre usuarios**.
- **Sin distinción de festivos o descansos**: todos los días cuentan igual.

## Criterios de finalización

1. El mapa aparece con 12 semanas alineadas a lunes, incluida la actual (RF-1).
2. La intensidad respeta las cuatro franjas fijas de minutos (RF-2).
3. Los minutos de un mismo día se suman correctamente (RF-3).
4. Al interactuar con un día se ve fecha y minutos, con ratón, toque y teclado
   (RF-4).
5. Existe la leyenda de intensidad, también en estado sin datos (RF-5).
6. Los días sin sesión se dibujan vacíos; los futuros no se dibujan y son inertes
   (RF-6).
7. Con el usuario sin datos aparece el mensaje correspondiente y el mapa vacío
   (RF-7).
8. Las fechas futuras no afectan al cálculo (RF-8).
9. Se ve bien en móvil, sin scroll horizontal, y todo el texto está en español
   (RNF-1, RNF-2).
10. La app sigue funcionando con doble clic y sin instalar nada (RNF-3).
11. Los datos guardados no se modifican ni se migran (RNF-4).
12. La lógica pura recibe "hoy" como parámetro y no toca DOM ni almacenamiento
    (RNF-6).
13. Los tests de la lógica están en verde con `node --test` (RNF-7).
14. El almacenamiento ilegible o corrupto no rompe el mapa (RNF-9).

## Dudas abiertas

- **[NECESITA ACLARACIÓN]** Modelo de datos: `AGENTS.md` describe las sesiones como
  clave `diario-estudio-sesiones` con forma `{date, topic, minutes, createdAt}`,
  pero el código actual usa la clave `sesiones` y `{fecha, tema, minutos}` (sin
  `createdAt`). Esta spec no cambia el formato (RNF-4) y trabaja con el concepto
  "fecha local + minutos por día", pero hay que decidir cuál es la fuente de verdad
  antes del plan. La constitución prohíbe perder sesiones, así que cualquier
  alineación de nombres debe preservar los datos existentes.
