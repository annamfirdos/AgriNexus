# AgriNexus — landing page

A dark, cinematic two-section landing page (Hero + Capabilities) for AgriNexus,
built the way the original agency template was specified: React + Vite +
TypeScript + Tailwind, "liquid glass" morphism panels, Framer Motion
blur-in reveals, and full-bleed background video with cross-fades.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a static
`dist/` folder you can host anywhere.

## Adding your own footage

`FadingVideo` (in `src/components/FadingVideo.tsx`) accepts a single video
URL or an array to cycle through, and handles the fade-in/fade-out and
looping described in the brief. No stock farm cinematography ships with
this project — until you add clips, both sections fall back to an animated
ambient gradient (`.ambient-field` in `src/index.css`) so the page still
looks intentional out of the box.

To wire in real footage, set the constants at the top of
`src/components/Hero.tsx` and `src/components/Capabilities.tsx`:

```ts
const HERO_VIDEO = 'https://your-cdn.example.com/drone-over-fields.mp4';
const CAPABILITIES_VIDEO = ['https://your-cdn.example.com/clip-1.mp4', '...'];
```

Good source footage for this look: a slow drone pass over rows at low sun
angle for the hero, and a closer, hands-on shot (soil, sensors, a tablet in
the field) for Capabilities.

## What was reskinned from the original brief

The original brief was a generic design-agency template (Work/Studio/
Services nav, "Design / Engineering / Growth" capability cards, agency
stats). Everything structural — the liquid-glass system, the two-section
layout, the motion timing and the exact component behaviour — is kept
as specified. The content is rewritten for AgriNexus:

- Nav: Platform / Method / Impact / Stories / Contact
- Headline, subtext, stats and trust-bar logos rewritten for a farming
  AI platform rather than a web studio
- Capabilities are the three-stage loop the platform runs on every farm:
  **Sense** (soil, water, weather signal) → **Decide** (the crop/yield/
  risk model) → **Grow** (market, logistics, storage)
- The three Material-style icons (image / movie / lightbulb) are replaced
  with custom leaf-drop, chip and sprout-cart glyphs to match

## Notes

- Tailwind's play-CDN isn't used here — this is a real build with the
  Tailwind CLI/PostCSS pipeline, exactly as `npm run build` expects.
- Respect for `prefers-reduced-motion` is built into `index.css`.
- The liquid-glass panels rely on `backdrop-filter`; they degrade to a
  faint flat fill on browsers without support rather than breaking.
