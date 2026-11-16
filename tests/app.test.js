const test = require("node:test");
const assert = require("node:assert/strict");

const {
  escapeCsvCell,
  formatCurrency,
  formatDate,
  parseLocalDate,
  readings,
  readingsToCsv,
  summarizeReadings
} = require("../app.js");

test("starter dataset covers seven daily readings", () => {
  assert.equal(readings.length, 7);
  assert.deepEqual(readings.map((reading) => reading.date), [
    "2026-11-09",
    "2026-11-10",
    "2026-11-11",
    "2026-11-12",
    "2026-11-13",
    "2026-11-14",
    "2026-11-15"
  ]);
});

test("summarizeReadings calculates totals, average, and peak", () => {
  const summary = summarizeReadings([
    { date: "2026-11-01", kwh: 8, cost: 2.4 },
    { date: "2026-11-02", kwh: 12, cost: 3.6 }
  ]);

  assert.equal(summary.totalKwh, 20);
  assert.equal(summary.totalCost, 6);
  assert.equal(summary.dailyAverage, 10);
  assert.equal(summary.peak.date, "2026-11-02");
});

test("summarizeReadings returns an empty-state summary", () => {
  assert.deepEqual(summarizeReadings([]), {
    totalKwh: 0,
    totalCost: 0,
    dailyAverage: 0,
    peak: null
  });
});

test("parseLocalDate keeps the supplied calendar date", () => {
  const date = parseLocalDate("2026-11-09");
  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 10);
  assert.equal(date.getDate(), 9);
  assert.match(formatDate("2026-11-09"), /9 Nov/);
});

test("formatCurrency returns a Singapore-dollar amount", () => {
  const formatted = formatCurrency(12.5);
  assert.match(formatted, /12\.50/);
  assert.match(formatted, /\$/);
});

test("escapeCsvCell quotes content and neutralizes spreadsheet formulas", () => {
  assert.equal(escapeCsvCell('Kitchen "A"'), '"Kitchen ""A"""');
  assert.equal(escapeCsvCell("=1+1"), '"\'=1+1"');
  assert.equal(escapeCsvCell("  @SUM(A1:A2)"), '"\'  @SUM(A1:A2)"');
});

test("readingsToCsv exports a stable header and one row per reading", () => {
  const csv = readingsToCsv([
    { date: "2026-11-09", appliance: "Cooling", kwh: 11.8, cost: 3.42 }
  ]);
  const lines = csv.split("\r\n");

  assert.equal(lines.length, 2);
  assert.equal(lines[0], '"Date","Primary load","Energy (kWh)","Estimated cost (SGD)"');
  assert.equal(lines[1], '"2026-11-09","Cooling","11.8","3.42"');
});
