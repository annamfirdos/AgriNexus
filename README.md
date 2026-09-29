# AgriNexus

**One Platform. Your Entire Farm.**

AgriNexus is an AI-guided farm-planning platform for India's smallholder
farmers: a season planner that compares 40+ crops (including mixed
cropping), a stage-by-stage season journey, a photo-based crop doctor, an
AI assistant, a farmer-to-farmer network, and a research-team admin
console — in English, Tamil and Hindi.

This repo holds the three live sites as self-contained HTML files, plus an
earlier React/Vite design exploration.

## Live sites

| Site | File | What it's for |
|---|---|---|
| 🏠 Home / 3D story | [`sites/home.html`](sites/home.html) | A cinematic, WebGL scroll-story of the farming lifecycle, with a live "what-if" crop simulator. The front door — links out to the other two. |
| 🌾 Farmer App | [`sites/farmer-app.html`](sites/farmer-app.html) | The real product: farm profiler, crop planner with loss warnings, mixed-cropping planner, season journey, Crop Doctor (photo diagnosis), AI chat, farmer network, government-scheme reference, unit/loan tools, and a role-gated admin console. |
| 📊 Pitch | [`sites/pitch.html`](sites/pitch.html) | A presentation for judges, partners and investors, with a live "present as slides" mode and deep links straight into specific screens of the Farmer App. |

Each file is a single, dependency-free HTML document — open it directly in
a browser, no build step required. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
for how they're built and how the pieces fit together.

## `design-starter/`

An earlier React + Vite + TypeScript + Tailwind exploration of the visual
language (liquid-glass panels, cinematic type) that informed the final
site design. Has its own [README](design-starter/README.md) and run
instructions; it's a starting point, not one of the three live products.

## Running the sites locally

They're static HTML, so any static server works:

```bash
cd sites
python3 -m http.server 8080
# then open http://localhost:8080/home.html
```

Opening the files directly via `file://` also works for browsing, but a
local server is more representative of how they behave once hosted.

## Notes on portability

These files were built and published as Claude Artifacts, which provide a
managed backend (shared database, AI calls, user identity) through a
small `window.claude.use(...)` capability API. Outside that environment:

- **Data and AI calls will not work** (crop database edits, advisories,
  the farmer network, AI chat/photo diagnosis, admin) since there's no
  backend behind `window.claude` elsewhere. The UI still renders and
  degrades gracefully — most screens show a plain-language notice instead
  of throwing errors.
- **Cross-links between the three sites** are declared once per file in a
  `SITE_LINKS` (or equivalent) constant near the top of each `<script>`
  block — update those if you re-host the sites at new URLs.
- To make this a fully standalone product, the `window.claude` calls in
  each file would need to be replaced with real calls to your own backend
  (database + auth + an LLM API) implementing the same shape.

## License

No license has been chosen yet — all rights reserved by default. Add a
`LICENSE` file before treating this as open source.
