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
        // Comparamos si el día actual es consecutivo al anterior
        const fechaAnterior = new Date(diasUnicos[i - 1]);
        const fechaActual = new Date(diasUnicos[i]);
        const diffDias = (fechaActual - fechaAnterior) / (1000 * 60 * 60 * 24);
        
        if (diffDias === 1) {
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
