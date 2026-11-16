const test = require("node:test");
const assert = require("node:assert/strict");

const {
  BUDGET_STORAGE_KEY,
  calculateBudgetProgress,
  formatCurrency,
  formatDate,
  normalizeBudget,
  parseLocalDate,
  readings,
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

test("normalizeBudget accepts positive numbers and falls back for invalid values", () => {
  assert.equal(normalizeBudget("125"), 125);
  assert.equal(normalizeBudget(0), 100);
  assert.equal(normalizeBudget("not-a-number", 80), 80);
  assert.equal(BUDGET_STORAGE_KEY, "watt-watch-monthly-budget");
});

test("calculateBudgetProgress clamps spending to the progressbar range", () => {
  assert.equal(calculateBudgetProgress(25, 100), 25);
  assert.equal(calculateBudgetProgress(120, 100), 100);
  assert.equal(calculateBudgetProgress(-5, 100), 0);
});
