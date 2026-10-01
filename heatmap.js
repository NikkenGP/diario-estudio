/* ============================================
   DIARIO DE ESTUDIO - MAPA DE CALOR (LÓGICA PURA)
   ============================================
   Funciones puras sin DOM ni localStorage: reciben
   "hoy" como parámetro (constitución #3).

   El mismo archivo sirve como <script> clásico en el
   navegador y como módulo en Node (node --test), sin
   build ni módulos ES (constitución #1, AGENTS.md).

   Fechas: siempre texto "AAAA-MM-DD" en hora local.
   Nunca toISOString() ni new Date("AAAA-MM-DD").
   ============================================ */

/* --------------------------------------------
   Utilidades de fecha locales (T3)
   -------------------------------------------- */

/**
 * Convierte una Date a texto "AAAA-MM-DD" en hora local
 */
function localDateToText(fecha) {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
}

/**
 * Suma (o resta) días a una fecha "AAAA-MM-DD"
 * Usa setDate, nunca milisegundos (los cambios de hora rompen 24h)
 */
function addDays(fechaTexto, dias) {
    const [año, mes, dia] = fechaTexto.split("-").map(Number);
    const fecha = new Date(año, mes - 1, dia);
    fecha.setDate(fecha.getDate() + dias);
    return localDateToText(fecha);
}

/**
 * Devuelve el lunes de la semana de una fecha "AAAA-MM-DD"
 */
function startOfWeek(fechaTexto) {
    const [año, mes, dia] = fechaTexto.split("-").map(Number);
    const fecha = new Date(año, mes - 1, dia);
    const diaSemana = fecha.getDay(); // 0=domingo, 1=lunes...
    const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    fecha.setDate(fecha.getDate() - diasDesdeLunes);
    return localDateToText(fecha);
}

/* --------------------------------------------
   Normalización defensiva de sesiones (T4)
   -------------------------------------------- */

/**
 * Devuelve la fecha válida "AAAA-MM-DD" de una sesión o null.
 * Acepta `fecha` o `date` para no romper si se alinean los nombres.
 */
function fechaValida(sesion) {
    if (!sesion) return null;
    const fecha = sesion.fecha || sesion.date;
    if (typeof fecha !== "string") return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null;
    return fecha;
}

/**
 * Devuelve los minutos válidos (>= 0) de una sesión, o 0.
 * Acepta `minutos` o `minutes`; no numérico/negativo/ausente -> 0.
 */
function minutosValidos(sesion) {
    if (!sesion) return 0;
    const valor = sesion.minutos !== undefined ? sesion.minutos : sesion.minutes;
    const minutos = Number(valor);
    if (!Number.isFinite(minutos) || minutos < 0) return 0;
    return minutos;
}

/* --------------------------------------------
   Cálculos del mapa (T5-T8)
   -------------------------------------------- */

/**
 * Agrupa minutos por fecha, ignorando fechas futuras y registros inválidos.
 * Devuelve un objeto { "AAAA-MM-DD": minutos }
 */
function minutosPorDia(sesiones, hoy) {
    const acumulado = {};
    (sesiones || []).forEach((sesion) => {
        const fecha = fechaValida(sesion);
        if (!fecha) return;
        if (fecha > hoy) return; // las fechas futuras no cuentan
        const minutos = minutosValidos(sesion);
        acumulado[fecha] = (acumulado[fecha] || 0) + minutos;
    });
    return acumulado;
}

/**
 * Traduce minutos acumulados a un nivel de intensidad 0..4
 * 0 | 1-30 | 31-60 | 61-120 | >120
 */
function nivelIntensidad(minutos) {
    if (!Number.isFinite(minutos) || minutos <= 0) return 0;
    if (minutos <= 30) return 1;
    if (minutos <= 60) return 2;
    if (minutos <= 120) return 3;
    return 4;
}

/**
 * Construye la rejilla de `numSemanas` semanas alineadas a lunes.
 * Cada día: { fecha, futuro } donde futuro = fecha > hoy
 */
function ventanaSemanas(hoy, numSemanas) {
    const lunesActual = startOfWeek(hoy);
    const lunesInicial = addDays(lunesActual, -7 * (numSemanas - 1));
    const semanas = [];

    for (let i = 0; i < numSemanas; i++) {
        const lunes = addDays(lunesInicial, 7 * i);
        const dias = [];
        for (let d = 0; d < 7; d++) {
            const fecha = addDays(lunes, d);
            dias.push({ fecha, futuro: fecha > hoy });
        }
        semanas.push(dias);
    }
    return semanas;
}

/**
 * Ensambla el modelo del mapa de calor.
 * Devuelve { semanas, tieneDatos, mensaje }.
 * Cada día incluye { fecha, futuro, minutos, nivel }.
 */
function buildHeatmap(sesiones, hoy, numSemanas) {
    const semanas = ventanaSemanas(hoy, numSemanas || 12);
    const acumulado = minutosPorDia(sesiones, hoy);
    let tieneDatos = false;

    semanas.forEach((semana) => {
        semana.forEach((dia) => {
            dia.minutos = acumulado[dia.fecha] || 0;
            dia.nivel = nivelIntensidad(dia.minutos);
            if (dia.minutos > 0) tieneDatos = true;
        });
    });

    const mensaje = tieneDatos ? null : "Aún no hay datos en las últimas 12 semanas";
    return { semanas, tieneDatos, mensaje };
}

/* --------------------------------------------
   Exportación (guardia CommonJS)
   -------------------------------------------- */
// En el navegador `module` no existe y este bloque se ignora.
// En Node, expone las funciones para los tests.
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        localDateToText,
        addDays,
        startOfWeek,
        fechaValida,
        minutosValidos,
        minutosPorDia,
        nivelIntensidad,
        ventanaSemanas,
        buildHeatmap,
    };
}
