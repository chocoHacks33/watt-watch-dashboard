# Watt Watch Dashboard

Watt Watch is a small, dependency-free dashboard for reviewing household electricity use and cost. It turns a sample set of daily meter readings into a weekly summary and an easy-to-scan activity list.

## Run locally

Open `index.html` in a modern browser. No build step or package installation is required.

Use the dominant-load filter to focus the summary and meter log on days led by cooling, kitchen, laundry, or home-office use.

## Validate changes

```sh
npm test
npm run check
```

The test suite uses Node's built-in test runner and has no third-party dependencies.

