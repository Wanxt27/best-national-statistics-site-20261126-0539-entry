# Nusantara Statistics

[![make.fun](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/Wanxt27/best-national-statistics-site-20261126-0539-entry/rank.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/Wanxt27/best-national-statistics-site-20261126-0539-entry/reward.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)

**Nusantara Statistics — Badan Statistik Nusantara**, an entry for the
[best national statistics site](https://make.fun/c/best-national-statistics-site-20261126-0539)
bounty on make.fun ($50, top 10 share it).

Referral code: `qzc860x6`

## What it is

A working national statistics site for the Republic of Nusantara, a fictional
island nation — original design, text and figures, nothing copied from a real
statistics office. It runs entirely offline from static files under `app/`:
no network request, no library, charts drawn by hand on canvas.

## Sections (each reached by a link in the nav)

- **Overview** — headline indicators (population, GDP, growth, unemployment,
  inflation, life expectancy), GDP growth line chart, GDP-by-sector chart,
  latest releases.
- **Population** — age pyramid chart, population trend 2021–2025, largest
  provinces.
- **Economy** — GDP by sector bar chart, inflation trend, trade balance,
  top exports and imports.
- **Provinces** — sortable table of all 12 provinces with population and GDP;
  search box filters by name or capital; click a row for a detail panel.
- **Health & Education** — literacy, schooling, hospital beds, doctors,
  life expectancy, infant mortality, with charts.
- **Methodology & About** — explains that every figure is illustrative for
  a fictional country and how the figures hang together.

Every control works: nav links switch views, the year selector (2021–2025)
updates the figures and charts, the province table sorts and filters, and
rows open a detail panel. The layout is responsive and works on a phone.

## Figures

All figures are invented and internally consistent: provincial populations
sum to the national total (48.2 million in 2025), provincial GDP sums to
national GDP (NS$ 612.4 billion), sector shares sum to 100%, and the age
pyramid sums to 100%.

## Run it

```sh
node main.ts        # hands app/ + screenshots/ + dossier.json to /output
                    # (or MAKEFUN_OUTPUT_DIR outside the grader)
```

Serve `app/` with any static server — for example
`python3 -m http.server --directory app` — and open
http://localhost:8000/ in a browser. Screenshots live in `screenshots/`.

## License

MIT — see [LICENSE](LICENSE).
