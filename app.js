const readings = [
  { date: "2026-11-09", appliance: "Whole home", kwh: 11.8, cost: 3.42 },
  { date: "2026-11-10", appliance: "Whole home", kwh: 13.2, cost: 3.83 },
  { date: "2026-11-11", appliance: "Whole home", kwh: 12.4, cost: 3.60 },
  { date: "2026-11-12", appliance: "Whole home", kwh: 15.7, cost: 4.55 },
  { date: "2026-11-13", appliance: "Whole home", kwh: 14.1, cost: 4.09 },
  { date: "2026-11-14", appliance: "Whole home", kwh: 18.3, cost: 5.31 },
  { date: "2026-11-15", appliance: "Whole home", kwh: 12.9, cost: 3.74 }
];

function parseLocalDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(value, options = { weekday: "short", day: "numeric", month: "short" }) {
  return new Intl.DateTimeFormat("en-SG", options).format(parseLocalDate(value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2
  }).format(value);
}

function summarizeReadings(items) {
  if (items.length === 0) {
    return { totalKwh: 0, totalCost: 0, dailyAverage: 0, peak: null };
  }

  const totalKwh = items.reduce((sum, reading) => sum + reading.kwh, 0);
  const totalCost = items.reduce((sum, reading) => sum + reading.cost, 0);
  const peak = items.reduce((highest, reading) => reading.kwh > highest.kwh ? reading : highest);

  return {
    totalKwh,
    totalCost,
    dailyAverage: totalKwh / items.length,
    peak
  };
}

function buildTrendPoints(items) {
  const highest = Math.max(...items.map((reading) => reading.kwh), 1);
  return items.map((reading) => ({
    date: reading.date,
    kwh: reading.kwh,
    percentage: Math.round((reading.kwh / highest) * 100)
  }));
}

function calculateTrendChange(items) {
  if (items.length < 2) {
    return 0;
  }

  const periodSize = Math.floor(items.length / 2);
  const average = (period) => period.reduce((sum, reading) => sum + reading.kwh, 0) / period.length;
  const earlierAverage = average(items.slice(0, periodSize));
  const recentAverage = average(items.slice(-periodSize));

  return earlierAverage === 0 ? 0 : ((recentAverage - earlierAverage) / earlierAverage) * 100;
}

function renderTrend(items) {
  const chart = document.querySelector("#usage-trend");
  const points = buildTrendPoints(items);
  const change = calculateTrendChange(items);

  chart.replaceChildren(...points.map((point) => {
    const column = document.createElement("div");
    column.className = "trend-column";

    const value = document.createElement("strong");
    value.textContent = point.kwh.toFixed(1);

    const track = document.createElement("div");
    track.className = "trend-track";
    const bar = document.createElement("span");
    bar.style.height = `${point.percentage}%`;
    track.append(bar);

    const label = document.createElement("span");
    label.textContent = formatDate(point.date, { weekday: "short" });

    column.append(value, track, label);
    return column;
  }));

  const direction = change > 0 ? "higher" : change < 0 ? "lower" : "unchanged";
  document.querySelector("#trend-summary").textContent = direction === "unchanged"
    ? "Recent average is unchanged"
    : `Recent average is ${Math.abs(change).toFixed(0)}% ${direction}`;
}

function renderSummary(items) {
  const summary = summarizeReadings(items);
  document.querySelector("#total-kwh").textContent = `${summary.totalKwh.toFixed(1)} kWh`;
  document.querySelector("#total-cost").textContent = formatCurrency(summary.totalCost);
  document.querySelector("#daily-average").textContent = `${summary.dailyAverage.toFixed(1)} kWh`;

  if (!summary.peak) {
    document.querySelector("#peak-day").textContent = "No data";
    document.querySelector("#peak-detail").textContent = "Add a reading to begin";
    return;
  }

  document.querySelector("#peak-day").textContent = formatDate(summary.peak.date, {
    weekday: "long"
  });
  document.querySelector("#peak-detail").textContent = `${summary.peak.kwh.toFixed(1)} kWh used`;
  document.querySelector("#insight-copy").textContent =
    `${formatDate(summary.peak.date)} reached ${summary.peak.kwh.toFixed(1)} kWh, ` +
    `${(summary.peak.kwh - summary.dailyAverage).toFixed(1)} kWh above the daily average.`;
}

function renderReadings(items) {
  const list = document.querySelector("#readings-list");
  const peakUsage = Math.max(...items.map((reading) => reading.kwh), 1);

  list.replaceChildren(...items.map((reading) => {
    const row = document.createElement("article");
    row.className = "reading-row";

    const date = document.createElement("div");
    date.className = "reading-date";
    date.innerHTML = `<strong>${formatDate(reading.date, { weekday: "short" })}</strong>` +
      `<span>${formatDate(reading.date, { day: "numeric", month: "short" })}</span>`;

    const usage = document.createElement("div");
    usage.className = "reading-usage";
    const meter = document.createElement("div");
    meter.className = "usage-meter";
    meter.setAttribute("aria-hidden", "true");
    const fill = document.createElement("span");
    fill.style.width = `${Math.round((reading.kwh / peakUsage) * 100)}%`;
    meter.append(fill);
    const label = document.createElement("span");
    label.textContent = reading.appliance;
    usage.append(meter, label);

    const values = document.createElement("div");
    values.className = "reading-values";
    values.innerHTML = `<strong>${reading.kwh.toFixed(1)} kWh</strong>` +
      `<span>${formatCurrency(reading.cost)}</span>`;

    row.append(date, usage, values);
    return row;
  }));

  document.querySelector("#reading-count").textContent =
    `${items.length} ${items.length === 1 ? "day" : "days"}`;
}

function init() {
  renderSummary(readings);
  renderReadings(readings);
  renderTrend(readings);
}

if (typeof document !== "undefined") {
  init();
}

if (typeof module !== "undefined") {
  module.exports = {
    buildTrendPoints,
    calculateTrendChange,
    formatCurrency,
    formatDate,
    parseLocalDate,
    readings,
    summarizeReadings
  };
}

