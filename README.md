# Fakea Vangchhia — AI Engineer portfolio

Source for [fakeavangchhia.online](https://www.fakeavangchhia.online): a
single-page portfolio with a live LLM assistant and two in-browser 3D scenes.

Built with Vite, React 18, TypeScript, Tailwind, and shadcn/ui.

## What is interesting here

**The assistant is real.** The chat panel talks to a FastAPI service that calls
Gemini with a profile assembled server-side. The prompt and API key never reach
the browser, and the server discards any system message the client sends —
otherwise anyone could rewrite the assistant's instructions from devtools.

**The 3D projection is real.** `/neural_visual` does not scatter random points.
It featurizes this site's own technologies and projects into character-bigram
vectors, then runs PCA — centering, covariance, power iteration with deflation —
in the browser, from a fixed seed so the layout is reproducible. A technology's
vector blends its own name with the centroid of the projects that list it, so
genuine co-occurrence becomes genuine proximity. Some of the resulting closeness
is plain string overlap, which is honest behaviour for a character-level
representation rather than a bug.

The scroll-driven network on the home page is the exception, and says so on the
page: it is a generic feed-forward diagram plotting nothing.

## Running it

```bash
npm install
npm run dev      # port 8080 — not arbitrary, see below
npm run build    # production bundle to dist/
npm run lint
```

**Port 8080 matters.** The backend's CORS allowlist contains
`http://localhost:8080`, so changing `server.port` in `vite.config.ts` breaks
the chat panel in local dev.

The site works without the backend; only the chat panel needs it, and it
degrades to an explanatory message when the API is unreachable.

### The assistant backend

Lives in `../backend` (FastAPI). See [`../DEPLOYMENT.md`](../DEPLOYMENT.md).

```bash
cd ../backend
python -m venv venv && venv/Scripts/pip install -r requirements.txt
cp .env.example .env      # then add your GEMINI_API_KEY
venv/Scripts/python -m uvicorn main:app --reload
venv/Scripts/python test_assistant.py    # 14 checks, no API calls spent
```

Set `VITE_API_BASE_URL` to point the frontend at a deployed API. Vite inlines it
at build time, so changing it needs a rebuild.

## Layout

| Path                          | What                                             |
| ----------------------------- | ------------------------------------------------ |
| `src/pages/Index.tsx`         | The entire portfolio page                        |
| `src/data/portfolio.ts`       | Content shared between the page and the 3D view  |
| `src/lib/featurize.ts`        | Character-bigram featurizer                      |
| `src/lib/three-loader.ts`     | Loads three.js from a CDN, once                  |
| `src/hooks/use-scroll-reveal.ts` | The three hooks driving nearly all motion     |
| `src/components/ui/`          | Vendored shadcn output — add via the CLI         |

Every animated path checks `prefers-reduced-motion` and settles to its final
state. New motion has to honour the same contract.

`CLAUDE.md` carries the fuller architectural notes.
