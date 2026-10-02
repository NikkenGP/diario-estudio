// Tests de la lógica pura del perfil de usuario.
// Se ejecutan con: node --test
// Sin paquetes: solo node:test y node:assert (constitución #1 y #4).

const test = require("node:test");
const assert = require("node:assert");

const profile = require("../profile.js");

const {
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
} = profile;

// ---------------------------------------------------------
// T1: el módulo existe, carga sin lanzar y exporta lo esperado
// (la guardia CommonJS permite usar el mismo archivo como <script> y en Node).
// ---------------------------------------------------------
test("profile.js se carga y exporta un objeto", () => {
  assert.strictEqual(typeof profile, "object");
  assert.notStrictEqual(profile, null);
});

test("profile.js expone las constantes del perfil", () => {
  assert.ok(Array.isArray(PALETA));
  assert.ok(PALETA.length > 0);
  assert.ok(PALETA.includes(COLOR_DEFECTO));
  assert.strictEqual(typeof PERFIL_POR_DEFECTO, "object");
  assert.notStrictEqual(PERFIL_POR_DEFECTO, null);
});

// ---------------------------------------------------------
// T3: validar y recortar el nombre (RF-2)
// ---------------------------------------------------------
test("recortarNombre recorta espacios y no trunca si cabe", () => {
  assert.deepStrictEqual(recortarNombre(" Ana "), { nombre: "Ana", truncado: false });
  assert.deepStrictEqual(recortarNombre("J"), { nombre: "J", truncado: false });
});

test("recortarNombre trunca a 40 caracteres y lo marca", () => {
  const largo = "x".repeat(45);
  const r = recortarNombre(largo);
  assert.strictEqual(r.nombre.length, 40);
  assert.strictEqual(r.truncado, true);
});

test("esNombreValido acepta nombres con letras y signos válidos", () => {
  assert.strictEqual(esNombreValido("Ana"), true);
  assert.strictEqual(esNombreValido("José María"), true);
  assert.strictEqual(esNombreValido("Jean-Luc"), true);
  assert.strictEqual(esNombreValido("O'Neill"), true);
});

test("esNombreValido rechaza vacíos, dígitos y otros símbolos", () => {
  assert.strictEqual(esNombreValido("   "), false);
  assert.strictEqual(esNombreValido(""), false);
  assert.strictEqual(esNombreValido(null), false);
  assert.strictEqual(esNombreValido(undefined), false);
  assert.strictEqual(esNombreValido("123"), false);
  assert.strictEqual(esNombreValido("Ana123"), false);
  assert.strictEqual(esNombreValido("Ana!"), false);
  assert.strictEqual(esNombreValido("💡ana"), false);
});

// ---------------------------------------------------------
// T4: inicial y color del avatar (RF-3)
// ---------------------------------------------------------
test("inicialAvatar toma la primera letra en mayúscula", () => {
  assert.strictEqual(inicialAvatar("ana"), "A");
  assert.strictEqual(inicialAvatar("él"), "É");
  assert.strictEqual(inicialAvatar("Jean-Luc"), "J");
  assert.strictEqual(inicialAvatar("O'Neill"), "O");
});

test("inicialAvatar usa ? cuando no hay letra", () => {
  assert.strictEqual(inicialAvatar(""), "?");
  assert.strictEqual(inicialAvatar("..."), "?");
  assert.strictEqual(inicialAvatar("123"), "?");
  assert.strictEqual(inicialAvatar(null), "?");
});

test("esColorValido y normalizarColor manejan la paleta", () => {
  assert.strictEqual(esColorValido(PALETA[1]), true);
  assert.strictEqual(esColorValido("#000000"), false);
  assert.strictEqual(normalizarColor(PALETA[2]), PALETA[2]);
  assert.strictEqual(normalizarColor("#000000"), COLOR_DEFECTO);
  assert.strictEqual(normalizarColor(undefined), COLOR_DEFECTO);
});

// ---------------------------------------------------------
// T5: validar y normalizar la meta (RF-4)
// ---------------------------------------------------------
test("esMetaValida acepta enteros entre 0 y 10080", () => {
  assert.strictEqual(esMetaValida(1), true);
  assert.strictEqual(esMetaValida(60), true);
  assert.strictEqual(esMetaValida(10080), true);
  assert.strictEqual(esMetaValida(0), true);
});

test("esMetaValida rechaza valores inválidos", () => {
  assert.strictEqual(esMetaValida(-5), false);
  assert.strictEqual(esMetaValida(1.5), false);
  assert.strictEqual(esMetaValida("abc"), false);
  assert.strictEqual(esMetaValida(10081), false);
  assert.strictEqual(esMetaValida(null), false);
});

test("normalizarMeta: 0 o vacío -> null; entero válido -> número", () => {
  assert.strictEqual(normalizarMeta(0), null);
  assert.strictEqual(normalizarMeta(null), null);
  assert.strictEqual(normalizarMeta(undefined), null);
  assert.strictEqual(normalizarMeta(""), null);
  assert.strictEqual(normalizarMeta(60), 60);
});

// ---------------------------------------------------------
// T6: minutos de la semana, con "hoy" (RF-4, RNF-7)
// ---------------------------------------------------------
test("minutosSemana suma solo de lunes a hoy", () => {
  // hoy = jueves 2026-10-01; lunes = 2026-09-28
  const sesiones = [
    { fecha: "2026-09-27", tema: "x", minutos: 999 }, // domingo anterior: fuera
    { fecha: "2026-09-28", tema: "x", minutos: 30 },
    { fecha: "2026-09-30", tema: "x", minutos: 45 },
    { fecha: "2026-10-01", tema: "x", minutos: 15 },
    { fecha: "2026-10-02", tema: "x", minutos: 500 }, // futuro: fuera
  ];
  assert.strictEqual(minutosSemana(sesiones, "2026-10-01"), 90);
});

test("minutosSemana ignora registros inválidos y cruza de mes", () => {
  const sesiones = [
    null,
    { minutos: 10 },
    { fecha: "malísima", minutos: 30 },
    { fecha: "2026-09-28", tema: "x", minutos: 20 },
    { fecha: "2026-10-01", tema: "x", minutos: 20 },
  ];
  assert.strictEqual(minutosSemana(sesiones, "2026-10-01"), 40);
});

// ---------------------------------------------------------
// T7: progreso de la meta (RF-4)
// ---------------------------------------------------------
test("progresoMeta sin meta devuelve tieneMeta=false", () => {
  assert.deepStrictEqual(progresoMeta(120, null), { tieneMeta: false });
});

test("progresoMeta calcula porcentaje, cumplida y restante", () => {
  const a = progresoMeta(30, 60);
  assert.strictEqual(a.tieneMeta, true);
  assert.strictEqual(a.porcentaje, 50);
  assert.strictEqual(a.cumplida, false);
  assert.strictEqual(a.restante, 30);

  const b = progresoMeta(60, 60);
  assert.strictEqual(b.porcentaje, 100);
  assert.strictEqual(b.cumplida, true);
  assert.strictEqual(b.restante, 0);
});

test("progresoMeta superado se limita al 100% y restante 0", () => {
  const r = progresoMeta(90, 60);
  assert.strictEqual(r.porcentaje, 100);
  assert.strictEqual(r.cumplida, true);
  assert.strictEqual(r.restante, 0);
});

// ---------------------------------------------------------
// T8: texto del saludo (RF-5)
// ---------------------------------------------------------
test("textoSaludo respeta preferencia y nombre", () => {
  assert.strictEqual(textoSaludo({ nombre: "Ana", saludo: true }), "Hola, Ana");
  assert.strictEqual(textoSaludo({ nombre: "Ana", saludo: false }), null);
  assert.strictEqual(textoSaludo({ nombre: "", saludo: true }), null);
});

// ---------------------------------------------------------
// T9: normalizar un perfil por campos (RF-3, RF-4, RF-5, RF-8)
// ---------------------------------------------------------
test("normalizarPerfil corrige cada campo por separado", () => {
  const r = normalizarPerfil({ nombre: "Ana", color: "#000000", meta: -3, saludo: "sí" });
  assert.strictEqual(r.nombre, "Ana");
  assert.strictEqual(r.color, COLOR_DEFECTO);
  assert.strictEqual(r.meta, null);
  assert.strictEqual(r.saludo, true);
  assert.strictEqual(r.version, 1);
});

// ---------------------------------------------------------
// T10: parseo tolerante del texto guardado (RF-8)
// ---------------------------------------------------------
test("parsearPerfil: vacío -> estado vacio", () => {
  assert.strictEqual(parsearPerfil(null).estado, "vacio");
  assert.strictEqual(parsearPerfil("").estado, "vacio");
  assert.deepStrictEqual(parsearPerfil(null).perfil, PERFIL_POR_DEFECTO);
});

test("parsearPerfil: JSON inválido o no-objeto -> corrupto", () => {
  assert.strictEqual(parsearPerfil("{roto").estado, "corrupto");
  assert.strictEqual(parsearPerfil("[]").estado, "corrupto");
  assert.strictEqual(parsearPerfil("42").estado, "corrupto");
  assert.strictEqual(parsearPerfil("null").estado, "corrupto");
});

test("parsearPerfil: objeto válido -> ok", () => {
  const r = parsearPerfil(JSON.stringify({ nombre: "Ana", color: PALETA[0], meta: 60, saludo: false }));
  assert.strictEqual(r.estado, "ok");
  assert.strictEqual(r.perfil.nombre, "Ana");
  assert.strictEqual(r.perfil.meta, 60);
});

// ---------------------------------------------------------
// T11: ensamblar el perfil desde el formulario (RF-2, RF-3, RF-4, RF-5)
// ---------------------------------------------------------
test("construirPerfil exige nombre", () => {
  const r = construirPerfil({ nombre: "   ", color: PALETA[0], meta: "", saludo: true });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error);
});

test("construirPerfil devuelve perfil válido con version", () => {
  const r = construirPerfil({ nombre: " Ana ", color: PALETA[1], meta: "60", saludo: false });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.perfil.nombre, "Ana");
  assert.strictEqual(r.perfil.color, PALETA[1]);
  assert.strictEqual(r.perfil.meta, 60);
  assert.strictEqual(r.perfil.saludo, false);
  assert.strictEqual(r.perfil.version, 1);
});

test("construirPerfil rechaza meta inválida sin perder el nombre", () => {
  const r = construirPerfil({ nombre: "Ana", color: PALETA[0], meta: "abc", saludo: true });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error);
});

test("construirPerfil rechaza nombres con dígitos", () => {
  const r = construirPerfil({ nombre: "Ana123", color: PALETA[0], meta: "", saludo: true });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error);
});

test("construirPerfil: meta vacía o 0 -> sin meta", () => {
  const vacia = construirPerfil({ nombre: "Ana", color: PALETA[0], meta: "", saludo: true });
  assert.strictEqual(vacia.ok, true);
  assert.strictEqual(vacia.perfil.meta, null);

  const cero = construirPerfil({ nombre: "Ana", color: PALETA[0], meta: "0", saludo: true });
  assert.strictEqual(cero.ok, true);
  assert.strictEqual(cero.perfil.meta, null);
});

// ---------------------------------------------------------
// T12: compatibilidad (RNF-8)
// ---------------------------------------------------------
test("normalizarPerfil tolera un objeto sin version", () => {
  const r = normalizarPerfil({ nombre: "Ana" });
  assert.strictEqual(r.nombre, "Ana");
  assert.strictEqual(r.color, COLOR_DEFECTO);
  assert.strictEqual(r.meta, null);
  assert.strictEqual(r.saludo, true);
  assert.strictEqual(r.version, 1);
});
