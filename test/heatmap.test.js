// Tests de la lógica pura del mapa de calor.
// Se ejecutan con: node --test
// Sin paquetes: solo node:test y node:assert (constitución #1 y #4).

const test = require("node:test");
const assert = require("node:assert");

const heatmap = require("../heatmap.js");

const {
  addDays,
  startOfWeek,
  fechaValida,
  minutosValidos,
  minutosPorDia,
  nivelIntensidad,
  ventanaSemanas,
  buildHeatmap,
  NIVELES_LEYENDA,
  formatearFechaMapa,
  textoEtiquetaDia,
} = heatmap;

// ---------------------------------------------------------
// T1: el módulo existe, carga sin lanzar y exporta un objeto
// ---------------------------------------------------------
test("heatmap.js se carga y exporta un objeto", () => {
  assert.strictEqual(typeof heatmap, "object");
  assert.notStrictEqual(heatmap, null);
});

// ---------------------------------------------------------
// T3: utilidades de fecha locales (RF-1, RNF-5)
// ---------------------------------------------------------
test("addDays cruza fin de mes y de año", () => {
  assert.strictEqual(addDays("2026-10-01", 1), "2026-10-02");
  assert.strictEqual(addDays("2026-10-01", -1), "2026-09-30");
  assert.strictEqual(addDays("2026-12-31", 1), "2027-01-01");
  assert.strictEqual(addDays("2026-01-01", -1), "2025-12-31");
});

test("addDays respeta febrero y los años bisiestos", () => {
  assert.strictEqual(addDays("2026-03-01", -1), "2026-02-28");
  assert.strictEqual(addDays("2028-02-28", 1), "2028-02-29"); // 2028 bisiesto
  assert.strictEqual(addDays("2028-02-29", 1), "2028-03-01");
});

test("startOfWeek devuelve el lunes de la semana", () => {
  // 2026-10-01 es jueves; su lunes es 2026-09-28
  assert.strictEqual(startOfWeek("2026-10-01"), "2026-09-28");
  // 2026-10-04 es domingo; su lunes es 2026-09-28
  assert.strictEqual(startOfWeek("2026-10-04"), "2026-09-28");
  // un lunes es su propio inicio de semana
  assert.strictEqual(startOfWeek("2026-09-28"), "2026-09-28");
});

// ---------------------------------------------------------
// T4: normalización defensiva de sesiones (RF-2, RF-3, RF-8)
// ---------------------------------------------------------
test("fechaValida acepta fecha/date y rechaza lo inválido", () => {
  assert.strictEqual(fechaValida({ fecha: "2026-10-01" }), "2026-10-01");
  assert.strictEqual(fechaValida({ date: "2026-10-01" }), "2026-10-01");
  assert.strictEqual(fechaValida({ fecha: "no-es-fecha" }), null);
  assert.strictEqual(fechaValida({}), null);
  assert.strictEqual(fechaValida(null), null);
});

test("minutosValidos acepta minutos/minutes y normaliza lo inválido a 0", () => {
  assert.strictEqual(minutosValidos({ minutos: 45 }), 45);
  assert.strictEqual(minutosValidos({ minutes: 30 }), 30);
  assert.strictEqual(minutosValidos({ minutos: -5 }), 0);
  assert.strictEqual(minutosValidos({ minutos: "abc" }), 0);
  assert.strictEqual(minutosValidos({}), 0);
  assert.strictEqual(minutosValidos(null), 0);
});

// ---------------------------------------------------------
// T5: minutos por día, excluyendo el futuro (RF-3, RF-8)
// ---------------------------------------------------------
test("minutosPorDia suma varias sesiones del mismo día", () => {
  const sesiones = [
    { fecha: "2026-10-01", tema: "A", minutos: 30 },
    { fecha: "2026-10-01", tema: "B", minutos: 15 },
    { fecha: "2026-09-30", tema: "C", minutos: 60 },
  ];
  const acumulado = minutosPorDia(sesiones, "2026-10-01");
  assert.strictEqual(acumulado["2026-10-01"], 45);
  assert.strictEqual(acumulado["2026-09-30"], 60);
});

test("minutosPorDia ignora fechas futuras", () => {
  const sesiones = [
    { fecha: "2026-10-01", minutos: 30 },
    { fecha: "2026-10-02", minutos: 90 }, // futuro respecto a hoy
  ];
  const acumulado = minutosPorDia(sesiones, "2026-10-01");
  assert.strictEqual(acumulado["2026-10-02"], undefined);
  assert.strictEqual(acumulado["2026-10-01"], 30);
});

test("minutosPorDia ignora registros inválidos sin romperse", () => {
  const sesiones = [
    { fecha: "malísima", minutos: 30 },
    { fecha: "2026-10-01", minutos: 20 },
    null,
    { minutos: 10 },
  ];
  const acumulado = minutosPorDia(sesiones, "2026-10-01");
  assert.strictEqual(acumulado["2026-10-01"], 20);
  assert.strictEqual(Object.keys(acumulado).length, 1);
});

// ---------------------------------------------------------
// T6: nivel de intensidad por franjas fijas (RF-2)
// ---------------------------------------------------------
test("nivelIntensidad respeta las fronteras de las franjas", () => {
  assert.strictEqual(nivelIntensidad(0), 0);
  assert.strictEqual(nivelIntensidad(1), 1);
  assert.strictEqual(nivelIntensidad(30), 1);
  assert.strictEqual(nivelIntensidad(31), 2);
  assert.strictEqual(nivelIntensidad(60), 2);
  assert.strictEqual(nivelIntensidad(61), 3);
  assert.strictEqual(nivelIntensidad(120), 3);
  assert.strictEqual(nivelIntensidad(121), 4);
});

test("nivelIntensidad trata valores no válidos como 0", () => {
  assert.strictEqual(nivelIntensidad(NaN), 0);
  assert.strictEqual(nivelIntensidad(-10), 0);
});

// ---------------------------------------------------------
// T7: ventana de 12 semanas alineada a lunes (RF-1, RF-6)
// ---------------------------------------------------------
test("ventanaSemanas genera 12 semanas de 7 días", () => {
  const semanas = ventanaSemanas("2026-10-01", 12);
  assert.strictEqual(semanas.length, 12);
  semanas.forEach((semana) => assert.strictEqual(semana.length, 7));
});

test("la primera semana empieza en lunes y la última contiene hoy", () => {
  const hoy = "2026-10-01";
  const semanas = ventanaSemanas(hoy, 12);
  // La primera semana empieza en lunes (11 semanas antes de la actual).
  assert.strictEqual(startOfWeek(semanas[0][0].fecha), semanas[0][0].fecha);
  assert.strictEqual(semanas[0][0].fecha, "2026-07-13");
  const ultima = semanas[11].map((d) => d.fecha);
  assert.ok(ultima.includes(hoy));
});

test("los días posteriores a hoy se marcan como futuro", () => {
  const hoy = "2026-10-01"; // jueves
  const semanas = ventanaSemanas(hoy, 12);
  semanas.forEach((semana) => {
    semana.forEach((dia) => {
      assert.strictEqual(dia.futuro, dia.fecha > hoy);
    });
  });
});

test("casos de calendario: hoy lunes y hoy domingo", () => {
  const lunes = ventanaSemanas("2026-10-05", 12); // lunes
  const semanaLunes = lunes[11];
  assert.strictEqual(semanaLunes.filter((d) => d.futuro).length, 6);

  const domingo = ventanaSemanas("2026-10-04", 12); // domingo
  const semanaDomingo = domingo[11];
  assert.strictEqual(semanaDomingo.filter((d) => d.futuro).length, 0);
});

test("la ventana cruza el cambio de año sin descuadrarse", () => {
  const semanas = ventanaSemanas("2026-01-05", 12);
  assert.strictEqual(semanas.length, 12);
  assert.strictEqual(startOfWeek(semanas[0][0].fecha), semanas[0][0].fecha);
  assert.ok(semanas[11].map((d) => d.fecha).includes("2026-01-05"));
});

// ---------------------------------------------------------
// T8: ensamblado buildHeatmap (RF-1, RF-2, RF-3, RF-6, RF-7, RF-8)
// ---------------------------------------------------------
test("buildHeatmap con datos: tieneDatos=true y sin mensaje", () => {
  const sesiones = [{ fecha: "2026-10-01", minutos: 45 }];
  const modelo = buildHeatmap(sesiones, "2026-10-01", 12);
  assert.strictEqual(modelo.semanas.length, 12);
  assert.strictEqual(modelo.tieneDatos, true);
  assert.strictEqual(modelo.mensaje, null);

  const dia = modelo.semanas.flat().find((d) => d.fecha === "2026-10-01");
  assert.strictEqual(dia.minutos, 45);
  assert.strictEqual(dia.nivel, 2);
  assert.strictEqual(dia.futuro, false);
});

test("buildHeatmap sin datos: tieneDatos=false y mensaje", () => {
  const modelo = buildHeatmap([], "2026-10-01", 12);
  assert.strictEqual(modelo.tieneDatos, false);
  assert.strictEqual(modelo.mensaje, "Aún no hay datos en las últimas 12 semanas");
});

test("buildHeatmap con sesiones fuera de la ventana: mensaje", () => {
  const sesiones = [{ fecha: "2020-01-01", minutos: 120 }];
  const modelo = buildHeatmap(sesiones, "2026-10-01", 12);
  assert.strictEqual(modelo.tieneDatos, false);
  assert.strictEqual(modelo.mensaje, "Aún no hay datos en las últimas 12 semanas");
});

test("buildHeatmap ignora sesiones futuras al calcular", () => {
  const sesiones = [{ fecha: "2026-10-03", minutos: 200 }];
  const modelo = buildHeatmap(sesiones, "2026-10-01", 12);
  assert.strictEqual(modelo.tieneDatos, false);
});

// ---------------------------------------------------------
// RF-4: texto de la etiqueta del día (antes solo interfaz)
// ---------------------------------------------------------
test("textoEtiquetaDia con minutos usa el formato 'D mes — N min'", () => {
  assert.strictEqual(textoEtiquetaDia("2026-09-30", 45), "30 sept — 45 min");
  assert.strictEqual(textoEtiquetaDia("2026-10-02", 121), "2 oct — 121 min");
});

test("textoEtiquetaDia sin minutos indica 'sin sesión'", () => {
  assert.strictEqual(textoEtiquetaDia("2026-09-28", 0), "28 sept — sin sesión");
  assert.strictEqual(textoEtiquetaDia("2026-09-28", null), "28 sept — sin sesión");
});

test("formatearFechaMapa usa el mes abreviado en español", () => {
  assert.strictEqual(formatearFechaMapa("2026-01-05"), "5 ene");
  assert.strictEqual(formatearFechaMapa("2026-07-13"), "13 jul");
});

// ---------------------------------------------------------
// RF-5: leyenda de la escala (antes solo interfaz)
// ---------------------------------------------------------
test("NIVELES_LEYENDA cubre de 0 a 4, de menor a mayor", () => {
  assert.deepStrictEqual(NIVELES_LEYENDA, [0, 1, 2, 3, 4]);
});
