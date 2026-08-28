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

`Index.tsx` is the whole site. Portfolio copy is hardcoded in module-level
arrays at the top of the file — `navItems`, `stats`, `capabilityItems`,
`processSteps`, `suggestedQuestions`. Editing portfolio content means editing
those arrays, not chasing a CMS. `navItems` doubles as the scroll-spy list, so
each entry must match a section's `id`, **and `NeuralVisual.tsx` keeps its own
copy of `navItems`** to link back — change one, change both.

The rest lives in `src/data/portfolio.ts`, because `NeuralVisual` also consumes
some of it: `techStack`, `projectItems`, `experience`, `education`, and
`publication`. Edit them there — a second copy would silently desynchronise the
3D page from the site it claims to describe.

`experience` / `education` / `publication` mirror `public/resume.pdf`, and
`backend/knowledge.py` restates the same facts for the assistant. The PDF is the
authority: three places now assert Fakea's work history, and a recruiter reading
the resume next to the site will notice if they disagree.

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

### three.js comes from a CDN

`src/lib/three-loader.ts` owns loading it: one script tag, one module-scoped
promise, shared by both consumers. three.js is **not** an npm dependency, so
there are no types — the loader exports `Three` (an aliased `any`) as the single
documented escape hatch, and callers import that rather than spelling `any`.

Two consequences that every three.js change has to respect:

- **It can fail.** No network, blocked CDN, no WebGL context. Both consumers
  render a message instead of an empty box; keep that path working.
- **Colour tokens need converting.** Tailwind stores HSL channels
  space-separated (`0 0% 45%`). three.js's colour parser only accepts the legacy
  comma form and, on a miss, silently leaves the colour **white** — invisible on
  this white page. `ScrollNeuralScene`'s `readInk` does the conversion.

`NeuralVisual.tsx` is the full 3D page: imperative setup/teardown in one
`useEffect`, everything typed `any`.

`ScrollNeuralScene.tsx` is the scroll-driven scene on the home page. It only
loads three.js once an IntersectionObserver says the section is near, so a
visitor who never scrolls that far never pays the ~600KB. Under
`prefers-reduced-motion` it draws exactly one settled frame and starts no loop.
Unlike `NeuralVisual`, **it plots nothing real** — it is a generic MLP diagram,
and the copy beside it says so on purpose.

**Everything it plots is real.** The scene used to scatter 240 random Gaussian
vectors labelled `animals_0`/`tech_57`; it now projects the actual portfolio:

- `src/lib/featurize.ts` — character-bigram bag-of-n-grams with an L2 norm and a
  `min_df` cutoff. Pure and deterministic.
- `src/data/embedding-corpus.ts` — `buildFeatureSpace()` turns `techStack` and
  `projectItems` into 19 labelled vectors. A technology's vector is a 50/50
  blend (`IDENTITY_WEIGHT`) of its own name and the centroid of the projects
  listing it, so real co-occurrence becomes real proximity. Weight it toward
  context and the points collapse onto their project; toward identity and the
  plot degenerates into string similarity.
- The PCA in the page (centering → covariance → power iteration with deflation)
  was always real and is unchanged, except the start vector is now a fixed-seed
  LCG so the layout is reproducible between loads.

Because the featurizer is character-level, some proximity is plain string
overlap rather than semantics — `OpenAI`/`OpenCV` sit at 0.52 cosine mostly on
the shared `open`. That is honest behaviour for this representation, not a bug.
If you add a technology used by no listed project, it keeps its bare name vector
and lands in the sparse outer region.

### shadcn/ui

`src/components/ui/` is generated shadcn output (`components.json` config, "default"
style, slate base). Treat it as vendored: add components with the shadcn CLI rather
than hand-writing them. Most of the ~50 components there are unused by the pages.

## Backend integration

`ChatbotPanel.tsx` POSTs to `${VITE_API_BASE_URL ?? "http://localhost:8000"}/assistant/chat`
with `{ model, messages: [{role, content}, ...] }` and reads `data.answer`
(errors come back as `data.detail`). Set `VITE_API_BASE_URL` for deployed
environments — Vite inlines it **at build time**, so changing it needs a rebuild.

The prompt and the API key are deliberately **not** in the frontend. The server
owns `knowledge.SYSTEM_PROMPT`, and `routers/assistant.py` discards any `system`
turn the browser sends — a prompt shipped to the client is a prompt anyone can
rewrite in devtools.

The FastAPI backend lives at `../backend` and is **outside this git repository**
(the repo root is `frontend/`), which also means it is not deployable as-is. See
`../DEPLOYMENT.md`.

## Deployment artefacts

- `vercel.json` and `public/_redirects` are the SPA fallback for Vercel and
  Netlify/Cloudflare. Without them `/resume` and `/neural_visual` 404 on a hard
  refresh, because only in-app navigation ever creates those routes.
- `index.html` hardcodes `https://www.fakeavangchhia.online/` in the canonical
  tag, `og:url`, `og:image`, and the JSON-LD `Person` block; `public/sitemap.xml`
  repeats it. A domain change means editing both.
- `public/og-image.png` is the 1200x630 social card.
