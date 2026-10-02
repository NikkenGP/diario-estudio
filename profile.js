/* ============================================
   DIARIO DE ESTUDIO - PERFIL DEL USUARIO (LÓGICA PURA)
   ============================================
   Funciones puras sin DOM ni localStorage: reciben
   sus datos por parámetro (constitución #3).

   El mismo archivo sirve como <script> clásico en el
   navegador y como módulo en Node (node --test), sin
   build ni módulos ES (constitución #1, AGENTS.md).

   Fechas: siempre texto "AAAA-MM-DD" en hora local.
   Nunca toISOString() ni new Date("AAAA-MM-DD").
   ============================================ */

/* --------------------------------------------
   Constantes
   -------------------------------------------- */

/**
 * Paleta fija de colores admitidos para el avatar
 */
const PALETA = ["#2547c9", "#1e7a57", "#c0392b", "#8e44ad", "#d97706", "#0e7490"];

/**
 * Color por defecto (debe pertenecer a PALETA)
 */
const COLOR_DEFECTO = "#2547c9";

/**
 * Perfil por defecto: sin nombre, color por defecto, sin meta y saludo activado
 */
const PERFIL_POR_DEFECTO = {
    nombre: "",
    color: COLOR_DEFECTO,
    meta: null,
    saludo: true,
    version: 1,
};

const MAX_NOMBRE = 40;
const MAX_META = 10080;

/* --------------------------------------------
   Utilidades de fecha (locales)
   -------------------------------------------- */

/**
 * Convierte una Date a texto "AAAA-MM-DD" en hora local
 */
function fechaAtexto(fecha) {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
}

/**
 * Suma (o resta) días a una fecha "AAAA-MM-DD" (usa setDate, no milisegundos)
 */
function addDays(fechaTexto, dias) {
    const [año, mes, dia] = fechaTexto.split("-").map(Number);
    const fecha = new Date(año, mes - 1, dia);
    fecha.setDate(fecha.getDate() + dias);
    return fechaAtexto(fecha);
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
    return fechaAtexto(fecha);
}

/* --------------------------------------------
   T3 - Nombre (RF-2)
   -------------------------------------------- */

/**
 * Recorta espacios y limita a MAX_NOMBRE caracteres.
 * Devuelve { nombre, truncado }
 */
function recortarNombre(valor) {
    const texto = (valor === null || valor === undefined) ? "" : String(valor);
    const limpio = texto.trim();
    if (limpio.length > MAX_NOMBRE) {
        return { nombre: limpio.slice(0, MAX_NOMBRE), truncado: true };
    }
    return { nombre: limpio, truncado: false };
}

/**
 * true si, tras recortar, hay entre 1 y MAX_NOMBRE caracteres
 */
function esNombreValido(valor) {
    const { nombre } = recortarNombre(valor);
    return nombre.length >= 1 && nombre.length <= MAX_NOMBRE;
}

/* --------------------------------------------
   T4 - Avatar (RF-3)
   -------------------------------------------- */

/**
 * Primer carácter alfanumérico del nombre, en mayúscula; "?" si no hay.
 */
function inicialAvatar(nombre) {
    const texto = (nombre === null || nombre === undefined) ? "" : String(nombre);
    for (const caracter of texto) {
        if (/[\p{L}\p{N}]/u.test(caracter)) {
            return caracter.toUpperCase();
        }
    }
    return "?";
}

/**
 * true si el color pertenece a la paleta
 */
function esColorValido(color) {
    return PALETA.includes(color);
}

/**
 * Devuelve el color si es válido; si no, el color por defecto
 */
function normalizarColor(color) {
    return esColorValido(color) ? color : COLOR_DEFECTO;
}

/* --------------------------------------------
   T5 - Meta (RF-4)
   -------------------------------------------- */

/**
 * true si es un entero entre 0 y MAX_META
 */
function esMetaValida(valor) {
    if (valor === null || valor === undefined || valor === "") return false;
    const numero = Number(valor);
    return Number.isInteger(numero) && numero >= 0 && numero <= MAX_META;
}

/**
 * Entero > 0, o null si 0/vacío (sin meta)
 */
function normalizarMeta(valor) {
    if (valor === null || valor === undefined || valor === "") return null;
    const numero = Number(valor);
    if (!Number.isInteger(numero)) return null;
    if (numero <= 0) return null;
    if (numero > MAX_META) return null;
    return numero;
}

/* --------------------------------------------
   T6 - Minutos de la semana (RF-4, RNF-7)
   -------------------------------------------- */

/**
 * Convierte "AAAA-MM-DD" en Date local (evita el parseo UTC)
 */
function textoAfecha(fechaTexto) {
    const [año, mes, dia] = fechaTexto.split("-").map(Number);
    return new Date(año, mes - 1, dia);
}

/**
 * Suma de minutos de lunes a hoy, ignorando futuras, anteriores al lunes
 * e inválidas. Recibe "hoy" como parámetro.
 */
function minutosSemana(sesiones, hoy) {
    const lunes = startOfWeek(hoy);
    let suma = 0;
    (sesiones || []).forEach((sesion) => {
        if (!sesion) return;
        const fecha = sesion.fecha;
        if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return;
        if (fecha > hoy) return;
        if (fecha < lunes) return;
        const minutos = Number(sesion.minutos);
        if (!Number.isFinite(minutos) || minutos < 0) return;
        suma += minutos;
    });
    return suma;
}

/* --------------------------------------------
   T7 - Progreso de la meta (RF-4)
   -------------------------------------------- */

/**
 * Progreso respecto a la meta.
 * Devuelve { tieneMeta } o { tieneMeta, minutos, meta, porcentaje, cumplida, restante }
 */
function progresoMeta(minutosSemana, meta) {
    if (meta === null || meta === undefined || meta <= 0) {
        return { tieneMeta: false };
    }
    const minutos = Number(minutosSemana) || 0;
    const porcentaje = Math.min(100, Math.floor((minutos / meta) * 100));
    return {
        tieneMeta: true,
        minutos,
        meta,
        porcentaje,
        cumplida: minutos >= meta,
        restante: Math.max(0, meta - minutos),
    };
}

/* --------------------------------------------
   T8 - Saludo (RF-5)
   -------------------------------------------- */

/**
 * "Hola, {nombre}" si la preferencia está activa y hay nombre; si no, null
 */
function textoSaludo(perfil) {
    if (!perfil) return null;
    if (!perfil.saludo) return null;
    const { nombre } = recortarNombre(perfil.nombre);
    if (!nombre) return null;
    return `Hola, ${nombre}`;
}

/* --------------------------------------------
   T9 - Normalización del perfil (RF-3, RF-4, RF-5, RF-8, RNF-8)
   -------------------------------------------- */

/**
 * Corrige cada campo por separado y completa valores por defecto.
 */
function normalizarPerfil(datos) {
    const fuente = (datos && typeof datos === "object" && !Array.isArray(datos)) ? datos : {};
    const nombre = esNombreValido(fuente.nombre) ? recortarNombre(fuente.nombre).nombre : "";
    const color = normalizarColor(fuente.color);
    const meta = (esMetaValida(fuente.meta) && Number(fuente.meta) > 0) ? Number(fuente.meta) : null;
    const saludo = (typeof fuente.saludo === "boolean") ? fuente.saludo : true;
    return { nombre, color, meta, saludo, version: 1 };
}

/* --------------------------------------------
   T10 - Parseo tolerante (RF-8)
   -------------------------------------------- */

/**
 * Interpreta el texto guardado.
 * Devuelve { perfil, estado } con estado "ok" | "vacio" | "corrupto".
 */
function parsearPerfil(textoGuardado) {
    if (textoGuardado === null || textoGuardado === undefined || textoGuardado === "") {
        return { perfil: { ...PERFIL_POR_DEFECTO }, estado: "vacio" };
    }
    let datos;
    try {
        datos = JSON.parse(textoGuardado);
    } catch (e) {
        return { perfil: { ...PERFIL_POR_DEFECTO }, estado: "corrupto" };
    }
    if (datos === null || typeof datos !== "object" || Array.isArray(datos)) {
        return { perfil: { ...PERFIL_POR_DEFECTO }, estado: "corrupto" };
    }
    return { perfil: normalizarPerfil(datos), estado: "ok" };
}

/* --------------------------------------------
   T11 - Construir el perfil desde el formulario (RF-2, RF-3, RF-4, RF-5)
   -------------------------------------------- */

/**
 * Valida y ensambla un perfil listo para guardar.
 * Devuelve { ok, perfil?, error?, truncado? }
 */
function construirPerfil(entrada) {
    const datos = entrada || {};

    const { nombre, truncado } = recortarNombre(datos.nombre);
    if (!nombre) {
        return { ok: false, error: "El nombre es obligatorio" };
    }

    const color = normalizarColor(datos.color);

    let meta = null;
    if (!(datos.meta === null || datos.meta === undefined || datos.meta === "" || Number(datos.meta) === 0)) {
        if (!esMetaValida(datos.meta) || Number(datos.meta) <= 0) {
            return { ok: false, error: "La meta debe ser un número entero entre 1 y 10080 minutos" };
        }
        meta = Number(datos.meta);
    }

    const saludo = Boolean(datos.saludo);

    return {
        ok: true,
        perfil: { nombre, color, meta, saludo, version: 1 },
        truncado,
    };
}

/* --------------------------------------------
   Exportación (guardia CommonJS)
   -------------------------------------------- */
// En el navegador `module` no existe y este bloque se ignora.
// En Node, expone las constantes y funciones para los tests.
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        PALETA,
        COLOR_DEFECTO,
        PERFIL_POR_DEFECTO,
        recortarNombre,
        esNombreValido,
        inicialAvatar,
        esColorValido,
        normalizarColor,
        esMetaValida,
        normalizarMeta,
        minutosSemana,
        progresoMeta,
        textoSaludo,
        normalizarPerfil,
        parsearPerfil,
        construirPerfil,
    };
}
