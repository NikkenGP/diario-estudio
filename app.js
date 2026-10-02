/* ============================================
   DIARIO DE ESTUDIO - LÓGICA DE LA APP
   ============================================ */

/* --------------------------------------------
   PASO 1: Obtener elementos del HTML
   -------------------------------------------- */
const formSesion = document.getElementById('form-sesion');
const inputFecha = document.getElementById('fecha');
const inputTema = document.getElementById('tema');
const inputHoras = document.getElementById('horas');
const inputMinutos = document.getElementById('minutos');
const elementoRacha = document.getElementById('racha');
const elementoMejorRacha = document.getElementById('mejor-racha');
const elementoTotalSemana = document.getElementById('total-semana');
const elementoDiasMes = document.getElementById('dias-mes');
const elementoMensaje = document.getElementById('mensaje');
const listaSesiones = document.getElementById('lista-sesiones');
const contenedorMapa = document.getElementById('mapa-calor');
const elementoEtiquetaMapa = document.getElementById('mapa-etiqueta');
const elementoMensajeMapa = document.getElementById('mapa-mensaje');
// Perfil
const elementoSaludo = document.getElementById('saludo');
const botonAbrirPerfil = document.getElementById('abrir-perfil');
const vistaPerfil = document.getElementById('perfil');
const avatarMini = document.getElementById('perfil-avatar-mini');
const avatarGrande = document.getElementById('perfil-avatar');
const inputPerfilNombre = document.getElementById('perfil-nombre');
const contenedorPaleta = document.getElementById('perfil-paleta');
const inputPerfilMeta = document.getElementById('perfil-meta');
const inputPerfilSaludo = document.getElementById('perfil-saludo');
const contenedorProgreso = document.getElementById('perfil-progreso');
const barraProgreso = document.getElementById('progreso-barra');
const rellenoProgreso = document.getElementById('progreso-relleno');
const textoProgreso = document.getElementById('progreso-texto');
const avisoPerfil = document.getElementById('perfil-aviso');
const botonReiniciarPerfil = document.getElementById('perfil-reiniciar');
const botonGuardarPerfil = document.getElementById('perfil-guardar');
const botonBorrarPerfil = document.getElementById('perfil-borrar');
const mensajePerfil = document.getElementById('perfil-mensaje');


/* --------------------------------------------
   PASO 2: Funciones auxiliares
   -------------------------------------------- */

/**
 * Convierte una Date a texto "YYYY-MM-DD" en hora local
 */
function fechaAtexto(fecha) {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

/**
 * Obtiene todas las sesiones guardadas
 */
function obtenerSesiones() {
    const datos = localStorage.getItem('sesiones');
    if (!datos) return [];
    try {
        return JSON.parse(datos);
    } catch (e) {
        // Datos corruptos: no rompemos la app; se comporta como "sin datos".
        // No borramos la clave para no destruir lo que el usuario tenga guardado.
        return [];
    }
}

/**
 * Guarda la lista de sesiones
 */
function guardarSesiones(sesiones) {
    localStorage.setItem('sesiones', JSON.stringify(sesiones));
}

/**
 * Filtra las sesiones para quedarse solo con las que tienen fecha <= hoy
 * Las fechas futuras no cuentan para ninguna racha
 */
function filtrarSesionesValidas(sesiones) {
    const hoyTexto = fechaAtexto(new Date());
    return sesiones.filter(s => s.fecha <= hoyTexto);
}

/**
 * Calcula la racha actual de días consecutivos con sesión
 * La racha termina hoy (o ayer si hoy aún no hay sesión)
 * Solo cuenta fechas que ya han pasado (<= hoy)
 */
function calcularRacha(sesiones) {
    // Filtramos fechas futuras
    const sesionesValidas = filtrarSesionesValidas(sesiones);
    const diasConSesion = new Set(sesionesValidas.map(s => s.fecha));
    
    const hoy = new Date();
    
    // Si hoy no hay sesión, empezamos desde ayer (la racha sigue viva)
    if (!diasConSesion.has(fechaAtexto(hoy))) {
        hoy.setDate(hoy.getDate() - 1);
    }
    
    let racha = 0;
    while (diasConSesion.has(fechaAtexto(hoy))) {
        racha++;
        hoy.setDate(hoy.getDate() - 1);
    }
    
    return racha;
}

/**
 * Calcula la mejor racha histórica
 * Devuelve { dias, inicio, fin } donde inicio y fin son textos "YYYY-MM-DD"
 * Solo cuenta fechas que ya han pasado (<= hoy)
 */
function calcularMejorRacha(sesiones) {
    // Filtramos fechas futuras
    const sesionesValidas = filtrarSesionesValidas(sesiones);
    
    // Obtenemos fechas únicas y las ordenamos
    const diasUnicos = [...new Set(sesionesValidas.map(s => s.fecha))].sort();
    
    if (diasUnicos.length === 0) {
        return { dias: 0, inicio: null, fin: null };
    }
    
    let mejorDias = 1;
    let mejorInicio = diasUnicos[0];
    let mejorFin = diasUnicos[0];
    
    let rachaActual = 1;
    let inicioActual = diasUnicos[0];
    
    for (let i = 1; i < diasUnicos.length; i++) {
        // Comparamos si el día actual es consecutivo al anterior.
        // Comparamos texto con addDays (nunca new Date("AAAA-MM-DD") ni
        // milisegundos): evita el corrimiento UTC y los cambios de hora.
        const esConsecutivo = addDays(diasUnicos[i - 1], 1) === diasUnicos[i];
        
        if (esConsecutivo) {
            // Día consecutivo, seguimos contando
            rachaActual++;
        } else {
            // Se rompió la racha, empezamos una nueva
            rachaActual = 1;
            inicioActual = diasUnicos[i];
        }
        
        // Actualizamos la mejor racha si es necesario
        if (rachaActual > mejorDias) {
            mejorDias = rachaActual;
            mejorInicio = inicioActual;
            mejorFin = diasUnicos[i];
        }
    }
    
    return { dias: mejorDias, inicio: mejorInicio, fin: mejorFin };
}

/**
 * Formatea una fecha "YYYY-MM-DD" a texto legible en español
 */
function formatearFecha(fechaTexto) {
    const [año, mes, dia] = fechaTexto.split('-').map(Number);
    const fecha = new Date(año, mes - 1, dia);
    return fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
}

/**
 * Formatea una fecha "YYYY-MM-DD" a formato corto "D mes"
 * Ejemplo: "2026-10-01" -> "1 oct"
 */
function formatearFechaCorta(fechaTexto) {
    const [año, mes, dia] = fechaTexto.split('-').map(Number);
    const fecha = new Date(año, mes - 1, dia);
    return fecha.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
    });
}

/**
 * Formatea minutos totales a texto "Xh Ymin"
 */
function formatearTiempo(minutosTotales) {
    const h = Math.floor(minutosTotales / 60);
    const m = minutosTotales % 60;
    
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

/**
 * Obtiene el lunes de la semana de una fecha "YYYY-MM-DD"
 * Devuelve el lunes en formato "YYYY-MM-DD"
 */
function obtenerInicioSemana(fechaTexto) {
    const [año, mes, dia] = fechaTexto.split('-').map(Number);
    const fecha = new Date(año, mes - 1, dia);
    const diaSemana = fecha.getDay(); // 0=domingo, 1=lunes, ...
    const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    fecha.setDate(fecha.getDate() - diasDesdeLunes);
    return fechaAtexto(fecha);
}

/**
 * Calcula el total de minutos estudiados esta semana (lunes a hoy)
 */
function calcularTotalSemana(sesiones) {
    const sesionesValidas = filtrarSesionesValidas(sesiones);
    const hoyTexto = fechaAtexto(new Date());
    const inicioSemana = obtenerInicioSemana(hoyTexto);
    
    return sesionesValidas
        .filter(s => s.fecha >= inicioSemana && s.fecha <= hoyTexto)
        .reduce((total, s) => total + s.minutos, 0);
}

/**
 * Calcula cuántos días distintos del mes actual tienen al menos una sesión
 * Varias sesiones el mismo día cuentan como un solo día
 */
function calcularDiasMes(sesiones) {
    const sesionesValidas = filtrarSesionesValidas(sesiones);
    const mesActual = fechaAtexto(new Date()).slice(0, 7); // "YYYY-MM"
    const dias = new Set(
        sesionesValidas
            .filter(s => s.fecha.startsWith(mesActual))
            .map(s => s.fecha)
    );
    return dias.size;
}


/* --------------------------------------------
   PASO 3: Actualizar la interfaz
   -------------------------------------------- */

/**
 * Actualiza el número de racha actual en pantalla
 */
function actualizarRacha() {
    const sesiones = obtenerSesiones();
    const racha = calcularRacha(sesiones);
    elementoRacha.textContent = racha;
}

/**
 * Actualiza la mejor racha en pantalla
 */
function actualizarMejorRacha() {
    const sesiones = obtenerSesiones();
    const mejor = calcularMejorRacha(sesiones);
    
    if (mejor.dias === 0) {
        elementoMejorRacha.textContent = '🏆 Mejor racha: 0 días';
    } else if (mejor.dias === 1) {
        elementoMejorRacha.textContent = `🏆 Mejor racha: 1 día (${formatearFechaCorta(mejor.inicio)} - ${formatearFechaCorta(mejor.fin)})`;
    } else {
        elementoMejorRacha.textContent = `🏆 Mejor racha: ${mejor.dias} días (${formatearFechaCorta(mejor.inicio)} - ${formatearFechaCorta(mejor.fin)})`;
    }
}

/**
 * Actualiza el total de la semana en pantalla
 */
function actualizarTotalSemana() {
    const sesiones = obtenerSesiones();
    const minutos = calcularTotalSemana(sesiones);
    elementoTotalSemana.textContent = `Esta semana: ${formatearTiempo(minutos)}`;
}

/**
 * Actualiza los días estudiados este mes en pantalla
 */
function actualizarDiasMes() {
    const sesiones = obtenerSesiones();
    const dias = calcularDiasMes(sesiones);
    elementoDiasMes.textContent = `Este mes: ${dias} ${dias === 1 ? 'día' : 'días'}`;
}

/**
 * Muestra la lista de sesiones (más reciente primero)
 */
function actualizarLista() {
    const sesiones = obtenerSesiones();
    
    // Ordenamos por fecha descendente
    sesiones.sort((a, b) => b.fecha.localeCompare(a.fecha));
    
    // Limpiamos la lista
    listaSesiones.innerHTML = '';
    
    // Si no hay sesiones, mostramos un mensaje
    if (sesiones.length === 0) {
        const li = document.createElement('li');
        li.className = 'sin-sesiones';
        li.textContent = 'Aún no hay sesiones registradas';
        listaSesiones.appendChild(li);
        return;
    }
    
    // Creamos un elemento por cada sesión
    sesiones.forEach(sesion => {
        const li = document.createElement('li');
        
        const divFecha = document.createElement('div');
        divFecha.className = 'sesion-fecha';
        divFecha.textContent = formatearFecha(sesion.fecha);
        
        const divTema = document.createElement('div');
        divTema.className = 'sesion-tema';
        divTema.textContent = sesion.tema;
        
        const divMinutos = document.createElement('div');
        divMinutos.className = 'sesion-minutos';
        divMinutos.textContent = formatearTiempo(sesion.minutos);
        
        li.appendChild(divFecha);
        li.appendChild(divTema);
        li.appendChild(divMinutos);
        
        listaSesiones.appendChild(li);
    });
}


/* --------------------------------------------
   PASO 3b: Mapa de calor (lógica en heatmap.js)
   -------------------------------------------- */

/**
 * Formatea una fecha "AAAA-MM-DD" a "D mes" en español
 * Ejemplo: "2026-09-30" -> "30 sept"
 */
function formatearFechaMapa(fechaTexto) {
    const [año, mes, dia] = fechaTexto.split('-').map(Number);
    const fecha = new Date(año, mes - 1, dia);
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/**
 * Texto de la etiqueta de un día del mapa
 * Formato fijo por RF-4: "D mes — N min" o "D mes — sin sesión"
 */
function textoEtiquetaDia(dia) {
    const fecha = formatearFechaMapa(dia.fecha);
    if (dia.minutos > 0) {
        return `${fecha} — ${dia.minutos} min`;
    }
    return `${fecha} — sin sesión`;
}

/**
 * Muestra/oculta la etiqueta del día del mapa
 */
function mostrarEtiquetaMapa(texto) {
    elementoEtiquetaMapa.textContent = texto;
    elementoEtiquetaMapa.classList.remove('oculto');
}

function ocultarEtiquetaMapa() {
    elementoEtiquetaMapa.textContent = '';
    elementoEtiquetaMapa.classList.add('oculto');
}

/**
 * Pinta el mapa de calor a partir del modelo de heatmap.js
 */
function actualizarMapaCalor() {
    const sesiones = obtenerSesiones();
    const hoy = fechaAtexto(new Date());
    const modelo = buildHeatmap(sesiones, hoy, 12);

    contenedorMapa.innerHTML = '';
    ocultarEtiquetaMapa();

    modelo.semanas.forEach(semana => {
        const columna = document.createElement('div');
        columna.className = 'mapa-semana';

        semana.forEach(dia => {
            if (dia.futuro) {
                // Día futuro: hueco no interactivo
                const hueco = document.createElement('div');
                hueco.className = 'mapa-dia mapa-dia-futuro';
                columna.appendChild(hueco);
                return;
            }

            const celda = document.createElement('div');
            celda.className = `mapa-dia nivel-${dia.nivel}`;
            celda.tabIndex = 0;
            celda.setAttribute('aria-label', textoEtiquetaDia(dia));

            const etiqueta = textoEtiquetaDia(dia);
            celda.addEventListener('mouseenter', () => mostrarEtiquetaMapa(etiqueta));
            celda.addEventListener('focus', () => mostrarEtiquetaMapa(etiqueta));
            celda.addEventListener('mouseleave', ocultarEtiquetaMapa);
            celda.addEventListener('blur', ocultarEtiquetaMapa);
            celda.addEventListener('touchstart', () => mostrarEtiquetaMapa(etiqueta), { passive: true });

            columna.appendChild(celda);
        });

        contenedorMapa.appendChild(columna);
    });

    // Mensaje de estado sin datos (la rejilla sigue pintada)
    if (modelo.mensaje) {
        elementoMensajeMapa.textContent = modelo.mensaje;
        elementoMensajeMapa.classList.remove('oculto');
    } else {
        elementoMensajeMapa.textContent = '';
        elementoMensajeMapa.classList.add('oculto');
    }
}

// RF-4: al tocar fuera de la rejilla se oculta la etiqueta del día.
// (En ratón y teclado ya se oculta con mouseleave/blur de cada celda.)
document.addEventListener('touchstart', (evento) => {
    if (!contenedorMapa.contains(evento.target)) {
        ocultarEtiquetaMapa();
    }
}, { passive: true });


/* --------------------------------------------
   PASO 3c: Perfil del usuario (lógica en profile.js)
   -------------------------------------------- */

// Perfil en memoria (se rellena al arrancar)
let estadoPerfil = { perfil: { ...PERFIL_POR_DEFECTO }, estado: 'vacio' };
let colorSeleccionado = COLOR_DEFECTO;

/**
 * Lee el perfil del dispositivo usando la lógica pura de profile.js
 */
function leerPerfilGuardado() {
    return parsearPerfil(localStorage.getItem('perfil'));
}

/**
 * Guarda el perfil SOLO en la clave 'perfil' (nunca toca 'sesiones')
 */
function guardarPerfilEnDispositivo(perfil) {
    try {
        localStorage.setItem('perfil', JSON.stringify(perfil));
        return true;
    } catch (e) {
        mostrarMensajePerfil('No se pudo guardar en este dispositivo');
        return false;
    }
}

/**
 * Borra el perfil del dispositivo (nunca toca 'sesiones')
 */
function borrarPerfilDelDispositivo() {
    localStorage.removeItem('perfil');
}

/**
 * Muestra un mensaje bajo la vista de perfil
 */
function mostrarMensajePerfil(texto) {
    mensajePerfil.textContent = texto;
    mensajePerfil.classList.remove('oculto');
    setTimeout(() => mensajePerfil.classList.add('oculto'), 3000);
}

/**
 * Pinta la paleta de colores como botones seleccionables
 */
function pintarPaleta() {
    contenedorPaleta.innerHTML = '';
    PALETA.forEach(color => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'color-swatch';
        boton.style.backgroundColor = color;
        boton.setAttribute('aria-label', `Color ${color}`);
        boton.setAttribute('aria-pressed', color === colorSeleccionado ? 'true' : 'false');
        if (color === colorSeleccionado) boton.classList.add('seleccionado');
        boton.addEventListener('click', () => {
            colorSeleccionado = color;
            avatarGrande.style.backgroundColor = color;
            pintarPaleta();
        });
        contenedorPaleta.appendChild(boton);
    });
}

/**
 * Pinta el avatar (grande y mini) con la inicial y el color
 */
function pintarAvatares(perfil) {
    const inicial = inicialAvatar(perfil.nombre);
    [avatarGrande, avatarMini].forEach(a => {
        a.textContent = inicial;
        a.style.backgroundColor = perfil.color;
    });
}

/**
 * Pinta el saludo personalizado según la preferencia
 */
function pintarSaludo(perfil) {
    const texto = textoSaludo(perfil);
    if (texto) {
        elementoSaludo.textContent = texto;
        elementoSaludo.classList.remove('oculto');
    } else {
        elementoSaludo.textContent = '';
        elementoSaludo.classList.add('oculto');
    }
}

/**
 * Pinta la barra de progreso de la meta
 */
function pintarProgreso(perfil) {
    const minutos = minutosSemana(obtenerSesiones(), fechaAtexto(new Date()));
    const progreso = progresoMeta(minutos, perfil.meta);

    if (!progreso.tieneMeta) {
        contenedorProgreso.classList.add('oculto');
        return;
    }

    contenedorProgreso.classList.remove('oculto');
    rellenoProgreso.style.width = `${progreso.porcentaje}%`;
    barraProgreso.setAttribute('aria-valuemax', String(progreso.meta));
    barraProgreso.setAttribute('aria-valuenow', String(progreso.minutos));
    if (progreso.cumplida) {
        textoProgreso.textContent = `¡Meta cumplida! ${progreso.minutos} de ${progreso.meta} min`;
        contenedorProgreso.classList.add('cumplida');
    } else {
        textoProgreso.textContent = `${progreso.minutos} de ${progreso.meta} min (faltan ${progreso.restante})`;
        contenedorProgreso.classList.remove('cumplida');
    }
}

/**
 * Renderiza toda la vista de perfil y el saludo
 */
function renderPerfil() {
    const perfil = estadoPerfil.perfil;
    colorSeleccionado = perfil.color;

    inputPerfilNombre.value = perfil.nombre;
    inputPerfilMeta.value = perfil.meta === null ? '' : perfil.meta;
    inputPerfilSaludo.checked = perfil.saludo;

    pintarAvatares(perfil);
    pintarPaleta();
    pintarSaludo(perfil);
    pintarProgreso(perfil);

    // Aviso de corrupción
    if (estadoPerfil.estado === 'corrupto') {
        avisoPerfil.classList.remove('oculto');
    } else {
        avisoPerfil.classList.add('oculto');
    }
}

/* Eventos del perfil */
botonAbrirPerfil.addEventListener('click', () => {
    vistaPerfil.classList.toggle('oculto');
});

botonGuardarPerfil.addEventListener('click', () => {
    const resultado = construirPerfil({
        nombre: inputPerfilNombre.value,
        color: colorSeleccionado,
        meta: inputPerfilMeta.value,
        saludo: inputPerfilSaludo.checked,
    });

    if (!resultado.ok) {
        mostrarMensajePerfil(resultado.error);
        return;
    }

    if (guardarPerfilEnDispositivo(resultado.perfil)) {
        estadoPerfil = { perfil: resultado.perfil, estado: 'ok' };
        renderPerfil();
        mostrarMensajePerfil(resultado.truncado ? 'Perfil guardado (nombre recortado a 40)' : 'Perfil guardado');
    }
});

botonBorrarPerfil.addEventListener('click', () => {
    if (!window.confirm('¿Borrar tu perfil? Tus sesiones no se tocarán.')) return;
    borrarPerfilDelDispositivo();
    estadoPerfil = { perfil: { ...PERFIL_POR_DEFECTO }, estado: 'vacio' };
    renderPerfil();
    mostrarMensajePerfil('Perfil borrado');
});

botonReiniciarPerfil.addEventListener('click', () => {
    if (!window.confirm('¿Reiniciar tu perfil? Se borrarán solo los datos de perfil.')) return;
    borrarPerfilDelDispositivo();
    estadoPerfil = { perfil: { ...PERFIL_POR_DEFECTO }, estado: 'vacio' };
    renderPerfil();
    mostrarMensajePerfil('Perfil reiniciado');
});

// La preferencia del saludo se aplica al instante (y se guarda si hay perfil)
inputPerfilSaludo.addEventListener('change', () => {
    const perfil = { ...estadoPerfil.perfil, saludo: inputPerfilSaludo.checked };
    pintarSaludo(perfil);
    if (estadoPerfil.estado !== 'vacio' && esNombreValido(perfil.nombre)) {
        guardarPerfilEnDispositivo(perfil);
        estadoPerfil = { perfil, estado: 'ok' };
    }
});


/* --------------------------------------------
   PASO 4: Mostrar mensaje temporal
   -------------------------------------------- */
function mostrarMensaje(texto) {
    elementoMensaje.textContent = texto;
    elementoMensaje.classList.remove('oculto');
    
    setTimeout(() => {
        elementoMensaje.classList.add('oculto');
    }, 3000);
}


/* --------------------------------------------
   PASO 5: Manejar el envío del formulario
   -------------------------------------------- */
formSesion.addEventListener('submit', function(e) {
    // Evitamos que la página se recargue
    e.preventDefault();
    
    // Obtenemos los valores del formulario
    const fecha = inputFecha.value;
    const tema = inputTema.value.trim();
    const horas = parseInt(inputHoras.value, 10) || 0;
    const minutos = parseInt(inputMinutos.value, 10) || 0;
    
    // Validación: al menos un minuto en total
    if (!fecha || !tema || (horas === 0 && minutos === 0)) {
        mostrarMensaje('Por favor, completa todos los campos');
        return;
    }
    
    // Convertimos todo a minutos para guardar
    const minutosTotales = horas * 60 + minutos;
    
    // Creamos la sesión
    const nuevaSesion = { fecha, tema, minutos: minutosTotales };
    
    // La guardamos
    const sesiones = obtenerSesiones();
    sesiones.push(nuevaSesion);
    guardarSesiones(sesiones);
    
    // Actualizamos la interfaz
    actualizarRacha();
    actualizarMejorRacha();
    actualizarTotalSemana();
    actualizarDiasMes();
    actualizarLista();
    actualizarMapaCalor();
    pintarProgreso(estadoPerfil.perfil);
    
    // Limpiamos el formulario y ponemos la fecha de hoy
    inputTema.value = '';
    inputHoras.value = '0';
    inputMinutos.value = '0';
    inputFecha.value = fechaAtexto(new Date());
    
    // Mensaje de confirmación
    mostrarMensaje('¡Sesión guardada! 💪');
});


/* --------------------------------------------
   PASO 6: Inicializar la app
   -------------------------------------------- */
// Ponemos la fecha de hoy por defecto
inputFecha.value = fechaAtexto(new Date());

// Mostramos los datos guardados
actualizarRacha();
actualizarMejorRacha();
actualizarTotalSemana();
actualizarDiasMes();
actualizarLista();
actualizarMapaCalor();

// Cargamos el perfil (o el perfil por defecto) y lo pintamos
estadoPerfil = leerPerfilGuardado();
renderPerfil();
