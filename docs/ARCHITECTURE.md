# Architecture

All three sites in `sites/` are single-file HTML documents: markup, CSS and
JavaScript in one file, no bundler, no external app code. External
dependencies are loaded from CDNs (`three.js`, `gsap`, `lenis`) or absent
entirely (the pitch and farmer-app pages use hand-written WebGL/CSS, no
Three.js).

## `sites/home.html` — 3D story

- **Rendering:** raw `three.js` r128, a hand-rolled scroll-driven camera
  (keyframed per `<section data-key="...">`), `EffectComposer` with
  `UnrealBloomPass` and a custom film-grade shader pass, and a
  `PMREMGenerator` environment map generated from the sky shader so
  metal/glass/water reflect it correctly.
- **Scene content:** procedural terrain, an instanced crop/grass field
  (custom blade geometry, wind animation via a shared vertex shader
  `onBeforeCompile` patch), a farmyard (barn, silos, solar array, pond),
  simple rigged vehicles (tractor + sprayer, two combines, a truck, a
  drone), and a domain-network visualisation (13 disconnected → connected
  nodes) built from `InstancedMesh` + `LineSegments`.
- **Data:** the embedded "what-if" simulator's `CROPS` array is
  hand-kept in sync with `sites/farmer-app.html`'s `DEFAULT_CROPS` for the
  three headline crops (paddy, groundnut, maize) — same prices, costs,
  yields — so the two never disagree. If you edit one, edit the other.
- **Performance:** a `LOW` flag (coarse pointer or narrow viewport) cuts
  particle/instance counts and disables shadows/post-processing.

## `sites/pitch.html` — pitch deck

- **Rendering:** a single full-screen WebGL fragment shader (procedural
  crop field, no geometry, no three.js) that shifts from golden hour to
  night as the scene index (`data-scene` per section) changes.
- **Pitch Mode:** `documentElement.classList('pitch')` triggers CSS scroll
  snap + a fixed HUD; keyboard shortcuts `1`–`6` jump straight into a
  named tab of the Farmer App via `SITE_LINKS.app + '#tab&from=pitch&...'`.
- **Round trip:** the Farmer App reads that hash on load, shows a
  "← Back to pitch" pill, and the pitch page restores the exact scroll
  position + Pitch Mode state on return (via `history.replaceState` +
  a small query-string protocol in the hash).

## `sites/farmer-app.html` — the product

This is the largest file and does the real work. Rough map, in the order
things appear in the `<script>`:

1. **Crop + reference data** — `DEFAULT_CROPS` (40+ crops with yield,
   cost, water need, temperature range, soil fit, pest/price risk, tips,
   companion-crop suggestions), `STATES` (climate normals), `SOILS`,
   `WATER_SRC`, `COST_SPLIT`, `COMPANIONS`.
2. **Runtime capabilities** — thin wrappers around `window.claude.use(...)`
   for `db` (shared/private document store), `user` (identity), `sample`
   (LLM calls, incl. image input), and `downloads`. Every write degrades
   to a plain-language toast if the capability is unavailable.
3. **Login / role system** (`ROLE`, `isAdminMode()`) — a device-local
   Farmer/Research-Team switch. Real edit access is still enforced by the
   artifact's own sharing permissions (`canEdit`); a passcode
   (`settings/app.adminPasscodeHash`, SHA-256 via WebCrypto) only gates
   the *UI*, letting trusted non-editors view Admin without write access.
4. **Planner** (`evaluate()`, `computeOptions()`) — scores every crop
   against the farmer's profile (water balance, soil/temperature fit,
   budget) and produces investment/profit/bad-year/warnings for each.
5. **Mixed cropping** (`computeMix()`) — layers 1+ companion crops onto a
   share of the same land and recomputes combined economics and risk.
6. **Season journey** (`STAGES`, `renderJourney()`) — a 9-stage timeline
   computed from the sowing date, with per-stage tasks, an expense
   ledger, and actual-vs-planned profit once harvest/sale are logged.
7. **Crop Doctor** — sends 1–3 photos to `sample()` with a strict JSON
   schema prompt; never returns chemical doses, only next-step guidance.
8. **AI chat**, **Farmer Network**, **Admin console** (crop editor, bulk
   prices, targeted/expiring advisories, moderation, CSV insights export,
   settings) and a **Tools tab** (government scheme reference, unit
   converter, loan calculator).
9. **Translation** — a single `t(template, vars)` function backed by one
   `DICT.ta` / `DICT.hi` object (~850 keys) covers all static UI text;
   a `MutationObserver`-driven `translateTree()` catches anything
   rendered dynamically. User-generated text (advisories, network posts)
   is translated on demand via `sample()` and cached in `localStorage`.

### Shared-database layout (`db` capability)

```
crops/<id>                        admin-writable crop overrides/additions
advisories/<id>                   admin-writable, optionally state/crop-targeted
community_plans/<id>              anonymous shared "what I planted" records
community_qa/<id>                 farmer network questions
community_qa/<id>/replies/<id>    farmer network replies
settings/app                      notice banner + admin passcode hash
data/users/{self}/profile         private per-farmer profile
data/users/{self}/profile/plans   private saved plans
data/users/{self}/profile/scans   private Crop Doctor history
data/users/{self}/profile/journeys/active   the current season journey
data/users/{self}/profile/journeys/<id>     completed past seasons
```

Write rules: everything defaults to `admin`-only (real editors of the
artifact); `community_plans`, `community_qa` (and its `replies`) are
opened to `interact`; each farmer's own `data/users/{self}` subtree is
opened to themself only. See the `Artifact` tool's `db` capability
documentation for the exact rule grammar if you need to change this.

## Known limitations

- **No automated tests ship in this repo.** The features were verified
  during development with headless-browser scripts (Playwright) against
  simulated `window.claude` capabilities; those scripts weren't part of
  the deliverable and aren't included here. Consider adding your own
  before making structural changes.
- **The 3D scene can only be checked in a browser with real internet
  access** (it loads three.js/gsap from a CDN) — it will not render in
  fully offline/sandboxed environments.
- All three files are large (tens of thousands of lines) because they're
  deliberately dependency-free single files. If this grows further,
  splitting `farmer-app.html` into modules with a real build step would
  be the natural next step.
