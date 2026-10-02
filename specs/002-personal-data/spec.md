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

## Requisitos funcionales

### RF-1 — Visualizar el perfil
La app debe ofrecer una vista del perfil donde se vean el nombre, el avatar, la meta
semanal y la preferencia actuales.

**Criterios de aceptación (EARS):**
- *Cuando* el usuario abre la app, el sistema **mostrará** los datos del perfil
  guardados (o su estado por defecto si no hay ninguno).
- *Cuando* el usuario accede a la vista de perfil, el sistema **mostrará** el nombre,
  el avatar, la meta semanal y la preferencia.

### RF-2 — Nombre
El perfil debe permitir registrar y actualizar un nombre, que es el único dato
obligatorio.

**Criterios de aceptación (EARS):**
- *Cuando* el usuario guarda el perfil con un nombre válido, el sistema **guardará**
  ese nombre y **lo mostrará** en el perfil.
- *Cuando* el usuario intenta guardar sin nombre o solo con espacios, el sistema
  **rechazará** el guardado y **mostrará** un mensaje indicando que el nombre es
  obligatorio.
- *Cuando* el usuario cambia el nombre, el sistema **actualizará** el nombre
  guardado sin alterar el resto de campos ni las sesiones.

### RF-3 — Avatar (inicial y color)
El avatar debe representarse como la **inicial del nombre** sobre un **color elegido**
por el usuario. No se admiten imágenes.

**Criterios de aceptación (EARS):**
- *Cuando* existe un nombre, el sistema **mostrará** un avatar con su inicial.
- *Cuando* el usuario elige un color de avatar, el sistema **guardará** esa elección y
  **la aplicará** al avatar.
- *Cuando* el usuario no elige color, el sistema **usará** un color por defecto.
- *Mientras* el nombre esté vacío o no exista perfil, el sistema **mostrará** un avatar
  neutro (sin inicial o con un símbolo por defecto).

### RF-4 — Meta semanal con progreso
El perfil debe permitir fijar una **meta semanal de minutos** (opcional) y mostrar el
progreso de la semana actual frente a esa meta.

**Criterios de aceptación (EARS):**
- *Cuando* el usuario fija una meta semanal (número de minutos mayor que cero), el
  sistema **la guardará**.
- *Cuando* existe una meta y el usuario consulta el progreso, el sistema **mostrará**
  los minutos estudiados esta semana frente a la meta.
- *Cuando* los minutos de la semana alcanzan o superan la meta, el sistema **indicará**
  que la meta está cumplida.
- *Cuando* el usuario no ha fijado meta, el sistema **omitirá** la barra de progreso
  sin mostrar error.

### RF-5 — Preferencia aplicada
El perfil debe incluir **una preferencia simple** que la app respete al mostrarse.

**Criterios de aceptación (EARS):**
- *Cuando* el usuario cambia la preferencia, el sistema **guardará** el nuevo valor.
- *Cuando* la app se muestra, el sistema **aplicará** la preferencia guardada en la
  interfaz.
- *Cuando* no hay preferencia guardada, el sistema **usará** el valor por defecto.

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
- *Cuando* el usuario guarda o actualiza el perfil, el sistema **no modificará** las
  sesiones de estudio.
- *Cuando* el usuario borra o reinicia el perfil, el sistema **no borrará** las
  sesiones.

### RF-8 — Tolerancia a datos ausentes o corruptos
La app debe funcionar aunque el perfil no exista o esté dañado, avisando al usuario
en el segundo caso.

**Criterios de aceptación (EARS):**
- *Cuando* no existe ningún perfil guardado, el sistema **mostrará** el perfil vacío o
  por defecto y **seguirá funcionando** con normalidad.
- *Cuando* los datos del perfil están corruptos o no se pueden leer, el sistema **seguirá
  funcionando** con el perfil por defecto y **mostrará** un aviso visible al usuario.
- *Cuando* el aviso por datos corruptos es visible, el sistema **no borrará**
  automáticamente lo que haya guardado.

## Requisitos no funcionales

- **RNF-1 — Privacidad por diseño**: los datos personales se guardan **solo en el
  dispositivo**; nunca se envían a servidores ni a terceros.
- **RNF-2 — Seguridad local**: no se almacenan secretos (contraseñas, tokens). El
  perfil no incluye datos sensibles más allá de lo que el usuario decida escribir.
- **RNF-3 — Español**: todos los textos del perfil (etiquetas, mensajes de error,
  avisos) están en español.
- **RNF-4 — Móvil**: la vista de perfil debe verse y usarse bien en pantalla de móvil.
- **RNF-5 — Simplicidad**: sin dependencias ni build; la app sigue funcionando al
  abrirla con doble clic.
- **RNF-6 — Datos del usuario protegidos**: guardar o borrar el perfil **nunca** pone
  en riesgo las sesiones ya guardadas.
- **RNF-7 — Lógica comprobable**: las reglas del perfil que puedan expresarse como
  cálculos (p. ej. el progreso de la meta) deben poder probarse sin navegador.
- **RNF-8 — Coherencia**: el perfil usa el mismo lenguaje visual y las mismas reglas
  de fecha local (semana empieza en lunes) que el resto de la app.

## Casos límite

- **Nombre solo con espacios**: se considera vacío y se rechaza (RF-2).
- **Nombre muy largo**: debe mostrarse sin romper el diseño (RNF-4).
- **Nombre con emojis o acentos**: se guarda y se muestra tal cual; la inicial del
  avatar debe calcularse de forma razonable.
- **Meta semanal con valor no numérico o negativo**: se rechaza o se ignora, sin
  romper la app.
- **Meta semanal igual a 0**: equivale a "sin meta" (no se muestra progreso).
- **Minutos de la semana iguales a la meta**: se considera meta cumplida (RF-4).
- **Sin perfil todavía**: la app funciona con el perfil por defecto (RF-8).
- **Perfil corrupto**: se avisa y se usa el perfil por defecto, sin borrar nada (RF-8).
- **Borrar el perfil**: no afecta a las sesiones (RF-7).
- **Cambio de color de avatar sin nombre**: se guarda el color, pero el avatar se
  muestra neutro hasta que haya nombre (RF-3).
- **Varias pestañas abiertas**: no se garantiza que los cambios se reflejen en vivo
  (ver fuera de alcance).

## Fuera de alcance

- **Sin multiusuario**: una sola persona por dispositivo; no hay cambio de usuario.
- **Sin sincronización**: los datos no se comparten entre dispositivos ni con la nube.
- **Sin exportar/importar** el perfil a un archivo.
- **Sin imágenes de avatar**: solo inicial y color (decisión de esta versión).
- **Sin temas visuales personalizables**: la preferencia es un único ajuste simple, no
  un sistema de temas.
- **Sin historial del perfil** ni fecha de última edición visible.
- **Sin edición multi-pestaña en vivo**: no se garantiza refresco entre pestañas.

## Criterios de finalización

1. Existe una vista de perfil donde se ven nombre, avatar, meta y preferencia (RF-1).
2. El nombre es obligatorio y se puede actualizar sin perder otros datos (RF-2).
3. El avatar es la inicial del nombre sobre un color elegible, sin imágenes (RF-3).
4. La meta semanal se guarda y muestra el progreso de la semana, con meta cumplida
   cuando corresponde (RF-4).
5. La preferencia se guarda y se aplica en la interfaz (RF-5).
6. El perfil persiste entre sesiones y no sale del dispositivo (RF-6, RNF-1).
7. Guardar o borrar el perfil no altera las sesiones (RF-7, RNF-6).
8. Sin perfil o con perfil corrupto la app funciona; en el segundo caso avisa y no
   borra nada (RF-8).
9. Todo el texto está en español y el perfil se ve bien en móvil (RNF-3, RNF-4).
10. La app sigue funcionando con doble clic y sin instalar nada (RNF-5).
11. La lógica comprobable del perfil (progreso de la meta) está cubierta por tests en
    verde con `node --test` (RNF-7).

## Dudas abiertas

- **[NECESITA ACLARACIÓN]** ¿Cuál es la preferencia concreta de esta versión (qué
  ajuste simple se puede activar o desactivar)? Se asumió "un único interruptor simple"
  que la interfaz respeta.
- **[NECESITA ACLARACIÓN]** ¿El aviso por perfil corrupto debe ofrecer una acción
  (p. ej. "reiniciar perfil") o solo informar? En esta spec solo informa.
- **[NECESITA ACLARACIÓN]** Límite máximo del nombre (número de caracteres) para
  garantizar que se ve bien en móvil.
- **[NECESITA ACLARACIÓN]** ¿La meta semanal se mide en minutos o debe permitirse en
  horas? Se asumió minutos, coherente con el resto de la app.
- **[NECESITA ACLARACIÓN]** ¿Se admite la edición multi-pestaña en vivo, o se confirma
  fuera de alcance como se ha asumido?
