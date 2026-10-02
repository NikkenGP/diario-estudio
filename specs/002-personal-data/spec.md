# Spec 002 — Datos personales y perfil del usuario

## Contexto y objetivo

Hoy el Diario de Estudio permite registrar sesiones y ver estadísticas (racha,
semana, mes, mapa de calor), pero trata al usuario como anónimo: no hay forma de
identificarse, marcar un objetivo ni ajustar la experiencia.

El objetivo es añadir un **perfil personal** que permita **registrar, visualizar y
actualizar** los datos del usuario (nombre, avatar, meta semanal y una preferencia),
guardados **solo en su dispositivo**. El perfil da contexto y motivación (una meta
con progreso visible) y humaniza la app, sin comprometer su simplicidad ni la
privacidad de quien la usa.

Esta spec define el **qué** y el **por qué**. El cómo técnico se decidirá en el plan.

## Usuarios

- **Estudiante que quiere personalizar la app**: poner su nombre y reconocer la app
  como suya.
- **Estudiante con un objetivo**: fijar una meta semanal y ver cuánto le falta.
- **Usuario que valora su privacidad**: saber que sus datos no salen del dispositivo.
- **Usuario nuevo o que empieza de cero**: usar la app sin haber rellenado el perfil.

## Historias de usuario

- **HU-1**: Como estudiante, quiero poner mi nombre para que la app se sienta mía.
- **HU-2**: Como estudiante, quiero elegir cómo se ve mi avatar (inicial y color) para
  identificarme sin subir ninguna foto.
- **HU-3**: Como estudiante con un objetivo, quiero fijar una meta semanal de estudio
  y ver mi progreso para saber si voy por buen camino.
- **HU-4**: Como usuario que valora su privacidad, quiero que mis datos se queden
  solo en mi dispositivo.
- **HU-5**: Como estudiante, quiero actualizar mis datos cuando quiera sin perder mis
  sesiones.
- **HU-6**: Como usuario, quiero que la app siga funcionando aunque mis datos de
  perfil falten o estén dañados.
- **HU-7**: Como usuario, quiero poder borrar mi perfil y empezar de cero sin perder
  mis sesiones.

## Requisitos funcionales

### RF-1 — Vista de perfil
La app debe ofrecer una **vista de perfil** dedicada donde se vean y editen el
nombre, el avatar, la meta semanal y la preferencia actuales.

**Criterios de aceptación (EARS):**
- *Cuando* el usuario abre la app, el sistema **mostrará** los datos del perfil
  guardados (o su estado por defecto si no hay ninguno).
- *Cuando* el usuario accede a la vista de perfil, el sistema **mostrará** el nombre,
  el avatar, la meta semanal y la preferencia, y **permitirá** editarlos.

### RF-2 — Nombre
El perfil debe permitir registrar y actualizar un nombre, que es el único dato
**obligatorio** para que exista un perfil guardado.

**Criterios de aceptación (EARS):**
- *Cuando* el usuario guarda el perfil con un nombre válido (tras recortar espacios,
  entre 1 y 40 caracteres), el sistema **guardará** ese nombre y **lo mostrará**.
- *Cuando* el usuario intenta guardar sin nombre o solo con espacios, el sistema
  **rechazará** el guardado y **mostrará** un mensaje indicando que el nombre es
  obligatorio.
- *Cuando* el usuario introduce un nombre de más de 40 caracteres, el sistema
  **limitará** su longitud y **lo indicará**.
- *Cuando* el usuario cambia el nombre, el sistema **actualizará** el nombre guardado
  sin alterar el resto de campos ni las sesiones.

### RF-3 — Avatar (inicial y color)
El avatar debe representarse como la **inicial del nombre** sobre un **color elegido**
por el usuario de una **paleta fija y predefinida**. No se admiten imágenes.
La inicial será el **primer carácter alfanumérico** del nombre (tras recortar
espacios), en mayúscula; si no hay ninguno, se usará el símbolo `?`.

**Criterios de aceptación (EARS):**
- *Cuando* existe un nombre con al menos un carácter alfanumérico, el sistema
  **mostrará** un avatar con su primera letra o dígito en mayúscula.
- *Cuando* el usuario elige un color de la paleta, el sistema **guardará** esa
  elección y **la aplicará** al avatar.
- *Cuando* el usuario no elige color, el sistema **usará** un color por defecto de la
  paleta.
- *Mientras* no exista nombre (perfil por defecto o sin perfil), el sistema
  **mostrará** un avatar neutro con el símbolo `?` sobre el color por defecto.

### RF-4 — Meta semanal con progreso
El perfil debe permitir fijar una **meta semanal de minutos** (opcional) y mostrar el
progreso de la **semana actual** frente a esa meta. La semana se mide de lunes a
domingo (misma regla que el resto de la app).

**Criterios de aceptación (EARS):**
- *Cuando* el usuario introduce una meta entera entre 1 y 10080 minutos, el sistema
  **la guardará**.
- *Cuando* el usuario introduce una meta no numérica, negativa, decimal o mayor de
  10080, el sistema **la rechazará** sin romper la app.
- *Cuando* la meta es 0, el sistema **la tratará** como "sin meta".
- *Cuando* existe una meta y el usuario consulta el perfil, el sistema **mostrará**
  los minutos estudiados esta semana (lunes a hoy) frente a la meta.
- *Cuando* los minutos de la semana **alcanzan o superan** la meta, el sistema
  **indicará** que la meta está cumplida.
- *Cuando* el usuario no ha fijado meta (sin meta o 0), el sistema **omitirá** la barra
  de progreso sin mostrar error.
- *Cuando* el usuario cambia la meta a mitad de semana, el sistema **recalculará** el
  progreso con la meta nueva sobre los minutos ya estudiados esta semana.

### RF-5 — Preferencia: saludo personalizado
El perfil debe incluir **una preferencia** consistente en mostrar u ocultar un
**saludo personalizado** ("Hola, {nombre}") en la pantalla principal. No es un sistema
de temas. La preferencia está **activada por defecto**.

**Criterios de aceptación (EARS):**
- *Cuando* el usuario cambia la preferencia, el sistema **guardará** el nuevo valor y
  **lo aplicará** de inmediato en la interfaz.
- *Cuando* la preferencia está activada y existe nombre, el sistema **mostrará** el
  saludo personalizado en la pantalla principal.
- *Cuando* la preferencia está desactivada, el sistema **ocultará** el saludo.
- *Cuando* no hay preferencia guardada, el sistema **usará** el valor por defecto
  (activada).

### RF-6 — Persistencia local y privacidad
Los datos del perfil deben guardarse **solo en el dispositivo** del usuario y
mantenerse al cerrar y volver a abrir la app.

**Criterios de aceptación (EARS):**
- *Cuando* el usuario guarda el perfil, el sistema **lo conservará** en el dispositivo
  para futuras visitas.
- *Cuando* la app se cierra y se vuelve a abrir, el sistema **restaurará** los datos del
  perfil guardados.
- *Cuando* se guardan datos del perfil, el sistema **no los enviará** fuera del
  dispositivo.

### RF-7 — Independencia de las sesiones
El perfil y las sesiones de estudio son datos independientes.

**Criterios de aceptación (EARS):**
- *Cuando* el usuario guarda, actualiza o borra el perfil, el sistema **no modificará**
  las sesiones de estudio.
- *Cuando* existen sesiones guardadas y no existe perfil, el sistema **mantendrá**
  ambas cosas operativas por separado.

### RF-8 — Tolerancia a datos ausentes o corruptos
La app debe funcionar aunque el perfil no exista, y ante datos dañados debe avisar y
ofrecer reiniciar, sin borrar nada de forma automática.

**Criterios de aceptación (EARS):**
- *Cuando* no existe ningún perfil guardado, el sistema **mostrará** el perfil por
  defecto y **seguirá funcionando** con normalidad.
- *Cuando* los datos del perfil están presentes pero no se pueden leer (no son un JSON
  válido) o no tienen la forma esperada (no son un objeto), el sistema **seguirá
  funcionando** con el perfil por defecto y **mostrará** un aviso visible.
- *Mientras* el aviso por datos corruptos es visible, el sistema **no borrará** lo que
  haya guardado, y **ofrecerá** la acción explícita "Reiniciar perfil".
- *Cuando* el usuario confirma "Reiniciar perfil", el sistema **borrará** los datos del
  perfil y **restaurará** el perfil por defecto.

### RF-9 — Borrar el perfil
El usuario debe poder eliminar su perfil y volver al estado por defecto.

**Criterios de aceptación (EARS):**
- *Cuando* el usuario elige borrar el perfil y confirma la acción, el sistema
  **eliminará** los datos del perfil y **mostrará** el perfil por defecto.
- *Cuando* el usuario borra el perfil, el sistema **no borrará** las sesiones de
  estudio.

## Requisitos no funcionales

- **RNF-1 — Privacidad por diseño**: los datos personales se guardan **solo en el
  dispositivo**; nunca se envían a servidores ni a terceros.
- **RNF-2 — Datos mínimos y no sensibles**: el perfil se limita a nombre, avatar
  (inicial y color), meta y preferencia. **No** se piden ni almacenan contraseñas,
  tokens, correo, teléfono ni otros datos sensibles. (Ver dudas abiertas: conciliar con
  la regla global de `AGENTS.md`.)
- **RNF-3 — Español**: todos los textos del perfil (etiquetas, mensajes de error,
  avisos) están en español.
- **RNF-4 — Móvil**: la vista de perfil debe verse y usarse bien en pantalla de móvil,
  sin desbordes, con nombres largos incluidos.
- **RNF-5 — Simplicidad**: sin dependencias ni build; la app sigue funcionando al
  abrirla con doble clic.
- **RNF-6 — Datos del usuario protegidos**: guardar, borrar o reiniciar el perfil
  **nunca** pone en riesgo las sesiones ya guardadas.
- **RNF-7 — Lógica pura y comprobable**: el cálculo del progreso de la meta (minutos de
  la semana frente a la meta) debe ser una **función pura** que recibe "hoy" como
  parámetro, sin DOM ni almacenamiento, y debe poder probarse con `node --test` sin
  instalar paquetes. No se avanza con tests en rojo.
- **RNF-8 — Compatibilidad hacia atrás**: si en el futuro cambia la forma de los datos
  del perfil, debe mantenerse compatibilidad con lo ya guardado para no perder el
  perfil del usuario.
- **RNF-9 — Coherencia**: el perfil usa el mismo lenguaje visual y las mismas reglas de
  fecha local (semana empieza en lunes) que el resto de la app.
- **RNF-10 — Accesibilidad**: la vista de perfil debe poder recorrerse con teclado y el
  avatar debe exponer una descripción legible a las tecnologías de asistencia.

## Casos límite

- **Nombre solo con espacios**: se considera vacío y se rechaza (RF-2).
- **Nombre con espacios sobrantes** (" Ana "): se recortan y se guarda "Ana" (RF-2).
- **Nombre muy largo**: se limita a 40 caracteres y se indica (RF-2); debe verse sin
  romper el diseño (RNF-4).
- **Nombre con emojis o acentos**: se guarda tal cual. La inicial es el primer carácter
  alfanumérico; si no hay ninguno, se usa `?` (RF-3).
- **Nombre cuyo primer carácter es un emoji**: la inicial salta al primer
  alfanumérico; si no existe, `?` (RF-3).
- **Cambio de color de avatar con nombre válido**: se guarda el perfil completo (RF-2,
  RF-3). No existe "guardar color sin nombre" (un perfil sin nombre no se guarda).
- **Meta no numérica, negativa, decimal o > 10080**: se rechaza sin romper (RF-4).
- **Meta igual a 0**: equivale a "sin meta" (RF-4).
- **Minutos de la semana iguales a la meta**: se considera meta cumplida (RF-4).
- **Semana con 0 minutos y meta fijada**: se muestra el progreso en 0 sin error (RF-4).
- **Cambio de meta a mitad de semana**: el progreso se recalcula con la meta nueva
  (RF-4).
- **Sin perfil todavía** o **perfil por defecto**: la app funciona; avatar neutro `?`
  (RF-3, RF-8).
- **Perfil con forma inesperada** (no objeto) o **JSON inválido**: se avisa y se usa el
  perfil por defecto, sin borrar nada, con opción de reiniciar (RF-8).
- **Color de avatar guardado inválido o fuera de la paleta**: se usa el color por
  defecto (RF-3, RF-8).
- **Borrar o reiniciar el perfil**: no afecta a las sesiones (RF-7, RF-9).
- **Almacenamiento lleno o no disponible** (p. ej. navegación privada): guardar puede
  fallar; la app no debe romperse y debe mantener el estado en memoria hasta recargar
  (RF-6, RF-8).
- **Sesiones corruptas coexistiendo con un perfil válido**: no afecta al perfil; cada
  dato se degrada por separado (RF-7).
- **Cambio de preferencia con la app abierta**: se aplica al instante (RF-5).
- **Nombre y meta extremos**: deben verse bien en móvil (RNF-4).

## Fuera de alcance

- **Sin multiusuario**: una sola persona por dispositivo; no hay cambio de usuario.
- **Sin sincronización**: los datos no se comparten entre dispositivos ni con la nube.
- **Sin exportar/importar** el perfil a un archivo.
- **Sin imágenes de avatar**: solo inicial y color (decisión de esta versión; sustituye
  la "foto" de la idea inicial).
- **Sin temas visuales personalizables**: la preferencia es un único ajuste (saludo), no
  un sistema de temas.
- **Sin historial del perfil** ni fecha de última edición visible.
- **Sin edición multi-pestaña en vivo**: no se garantiza refresco entre pestañas.

## Criterios de finalización

1. Existe una vista de perfil donde se ven y editan nombre, avatar, meta y preferencia
   (RF-1).
2. El nombre es obligatorio (1–40 caracteres, recortado) y se puede actualizar sin
   perder otros datos (RF-2).
3. El avatar es la inicial alfanumérica sobre un color de la paleta, sin imágenes, con
   neutro `?` si no hay nombre (RF-3).
4. La meta semanal se guarda y muestra el progreso de la semana, con meta cumplida
   cuando corresponde y recálculo al cambiarla (RF-4).
5. La preferencia (saludo) se guarda y se aplica al instante (RF-5).
6. El perfil persiste entre sesiones y no sale del dispositivo (RF-6, RNF-1).
7. Guardar, borrar o reiniciar el perfil no altera las sesiones (RF-7, RF-9, RNF-6).
8. Sin perfil o con perfil corrupto la app funciona; en el segundo caso avisa, ofrece
   reiniciar y no borra nada automáticamente (RF-8).
9. Existe un RF de borrado del perfil con confirmación (RF-9).
10. Todo el texto está en español y el perfil se ve bien en móvil (RNF-3, RNF-4).
11. La app sigue funcionando con doble clic y sin instalar nada (RNF-5).
12. La lógica pura del progreso (minutos de la semana frente a la meta) está cubierta
    por tests en verde con `node --test` (RNF-7).
13. Verificación manual con Chrome DevTools: consola sin errores y vista móvil correcta
    (regla de `AGENTS.md`).
14. `MEMORY.md` actualizado al terminar (regla de `AGENTS.md`).

## Dudas abiertas

- **[NECESITA ACLARACIÓN]** Conciliación con `AGENTS.md`: la regla global dice "No
  guardes nunca datos sensibles (claves, tokens, **datos personales**)", mientras esta
  funcionalidad guarda, por diseño, datos personales no sensibles y solo locales
  (nombre, meta, preferencia). Hay que decidir si se matiza la regla global (p. ej.
  "no datos sensibles; los datos personales solo son aceptables si son mínimos, locales
  y controlados por el usuario") o si esta funcionalidad queda en pausa hasta
  aclararlo. Es una decisión de gobernanza del proyecto, no de interfaz.
