const test = require("node:test");
const assert = require("node:assert/strict");

const {
  findUsageAlerts,
  formatCurrency,
  formatDate,
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

test("findUsageAlerts compares each day with its preceding rolling window", () => {
  const items = [
    { date: "2026-11-01", kwh: 10 },
    { date: "2026-11-02", kwh: 10 },
    { date: "2026-11-03", kwh: 10 },
    { date: "2026-11-04", kwh: 12 },
    { date: "2026-11-05", kwh: 20 }
  ];
  const alerts = findUsageAlerts(items);

  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].reading.date, "2026-11-05");
  assert.equal(alerts[0].baseline, 32 / 3);
  assert.ok(alerts[0].change > 0.8);
});

test("findUsageAlerts supports a custom window and returns no premature signals", () => {
  assert.deepEqual(findUsageAlerts([{ kwh: 10 }, { kwh: 20 }]), []);
  assert.equal(findUsageAlerts(
    [{ kwh: 10 }, { kwh: 11 }, { kwh: 15 }],
    { windowSize: 2, threshold: 0.4 }
  ).length, 1);
});
