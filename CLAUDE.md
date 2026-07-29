# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server on port 8080 (see note below)
npm run build      # production build to dist/
npm run build:dev  # build with development mode (keeps lovable-tagger)
npm run preview    # serve the built dist/
npm run lint       # eslint over the repo
```

`bun.lockb` and `package-lock.json` are both committed; either package manager works.

There is no test setup in this repo — no test runner, no test files.

**Port 8080 is not arbitrary.** The FastAPI backend's CORS allowlist only contains
`http://localhost:8080` and `http://127.0.0.1:8080`, so changing `server.port` in
`vite.config.ts` breaks the chatbot in local dev.

## Architecture

Single-page portfolio site: Vite + React 18 + TypeScript + Tailwind + shadcn/ui.
`@/` resolves to `src/` (aliased in both `vite.config.ts` and `tsconfig.app.json`).
TypeScript `strict` is **off** (`tsconfig.app.json`), so untyped code compiles.

### Routes (`src/App.tsx`)

`/` → `Index` (the entire portfolio), `/resume` → PDF in an iframe,
`/neural_visual` → standalone 3D page, `*` → `NotFound`. New routes go above the
catch-all.

### Content lives in `src/pages/Index.tsx`

`Index.tsx` (~600 lines) is the whole site. Portfolio copy is hardcoded in
module-level arrays at the top of the file — `navItems`, `stats`,
`capabilityItems`, `techStack`, `projectItems`, `processSteps`. Editing portfolio
content means editing those arrays, not chasing a CMS or data file. `navItems`
doubles as the scroll-spy list, so each entry must match a section's `id`.

Cross-page navigation back to a section uses a hash: `/neural_visual` calls
`navigate({ pathname: "/", hash: "#projects" })`, and `Index` has a `location.hash`
effect that scrolls one animation frame later (sections aren't mounted yet at
route-transition time).

### Design system

All color is HSL CSS custom properties defined in `:root` in `src/index.css`
(a Notion-style monochrome palette: every token is `0%` saturation — pure white
background, pure black ink, neutral greys for hierarchy), surfaced to Tailwind via
`hsl(var(--x))` in `tailwind.config.ts`. Use the semantic Tailwind tokens
(`bg-card`, `text-primary`, `border-border`) rather than literal colors so the
palette stays swappable.

Two palette notes specific to the monochrome scheme: `--accent` is a **light**
surface (94%) because shadcn uses it for hover/selected rows, so it is useless for
decoration; the extra `--ink-soft` (45%) token is the "second colour" used by the
monochrome gradients (scroll progress bar, `gradient-text`, timeline) and by
`NeuralBackground`'s node fill.
`darkMode: ["class"]` is configured but **no dark palette exists** — there is only
one `:root` block, no `.dark` overrides.

Beyond Tailwind, `src/index.css` defines the site's custom component classes under
`@layer components`: `glass-panel`, `elevated-card`, `neon-nav-shell`/`neon-tab`,
`stat-card`, `capability-icon`, `marquee`/`marquee-chip`, `gradient-text`,
`section-eyebrow`, `timeline-line`/`timeline-dot`, `display-font`. Prefer reusing
these over inventing new one-off styles.

### Animation system

Three hooks in `src/hooks/use-scroll-reveal.ts` drive nearly all motion:

- `useScrollReveal()` — called **once** in `Index`; a single IntersectionObserver
  watches every `[data-reveal]` element on the page and adds `is-visible`. Sections
  opt in declaratively with `data-reveal` (`"left"`, `"right"`, `"scale"` variants)
  and stagger via a `--reveal-delay` inline CSS var. No per-component refs.
- `useCountUp(target)` — rAF easing for the stat counters.
- `useScrollProgress()` — rAF-throttled scroll ratio for the top progress bar.

Every animated path checks `prefers-reduced-motion` (the hooks bail to final state,
and `index.css` has a `@media (prefers-reduced-motion: reduce)` block). New motion
must honor the same contract.

`NeuralBackground.tsx` is a fixed full-viewport 2D canvas: drifting nodes linked to
nearby neighbours, with pointer attraction and scroll parallax. It reads `--primary`
and `--ink-soft` off `getComputedStyle(document.documentElement)`, so it follows the
theme automatically.

### `NeuralVisual.tsx` — three.js from CDN

This page loads three.js at runtime by injecting a `<script>` tag pointing at
jsDelivr, then reads `window.THREE`. three.js is **not** an npm dependency and
everything is typed `any`. It needs network access to render, and the imperative
setup/teardown all lives inside one `useEffect`.

### shadcn/ui

`src/components/ui/` is generated shadcn output (`components.json` config, "default"
style, slate base). Treat it as vendored: add components with the shadcn CLI rather
than hand-writing them. Most of the ~50 components there are unused by the pages.

## Backend integration

`ChatbotPanel.tsx` POSTs to `${VITE_API_BASE_URL ?? "http://localhost:8000"}/assistant/chat`
with `{ model: "gemini-2.0-flash", messages: [{role, content}, ...] }` and reads
`data.answer` (errors come back as `data.detail`). The system prompt is a constant
in that file. Set `VITE_API_BASE_URL` for deployed environments.

The FastAPI backend lives at `../backend` and is **outside this git repository**
(the repo root is `frontend/`). Note that `backend/main.py` as checked out only
registers `/`; the `/assistant/chat` router the frontend calls is not wired up
there, so the chatbot fails locally until the backend serves that route.

## Known breakage

`src/pages/Resume.tsx` iframes `/My Resume.pdf`, but `public/` only contains
`resume.pdf` — the `/resume` route 404s inside the iframe.
