# Watt Watch Dashboard

Watt Watch is a small, dependency-free dashboard for reviewing household electricity use and cost. It turns a sample set of daily meter readings into a weekly summary and an easy-to-scan activity list.

## Run locally

Open `index.html` in a modern browser. No build step or package installation is required.

The seven-day usage chart compares the latest daily average with the opening days so changes are visible without reading every row.

## Validate changes

```sh
npm test
npm run check
```

The test suite uses Node's built-in test runner and has no third-party dependencies.

