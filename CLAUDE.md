# Furniture — TAAQ

Furniture store mockup (React 18 + Vite + Tailwind 3 + GSAP + Lenis + react-three-fiber). The build spec is `PRD.md`; read it before changing a section.

## Commands

- `npm install`, then `npm run dev` (http://localhost:5173) or `npm run build` + `npm run preview`.
- `npm run images` generates any missing photos and textures (see below).

## Image generation (Pollinations)

Generate images with `scripts/pollinations.py` (Python stdlib, no install needed). Don't use stock-photo placeholders or hotlink Pollinations URLs in pages; generate the file and reference it locally (`/images/...`, `/textures/...`).

- Needs `POLLINATIONS_API_KEY` in the environment or in `.env` (see `.env.example`), unless a network proxy injects it (the cloud environment does).
- Every image the site uses is listed in `scripts/image-manifest.json`, built by `scripts/build-manifest.py` (edit prompts there, then re-run it). Each job has a fixed seed.
- `npm run images` = `python3 scripts/pollinations.py --batch scripts/image-manifest.json --skip-existing`: safe to re-run, only fetches what is missing, retries a failed job once with a new seed, and stops at once on HTTP 402 (out of pollen).
- Single image: `python3 scripts/pollinations.py "<prompt>" -o images/<name>.jpg -W 1600 -H 900 --seed 1`. Output paths are relative to `public/`.
- Cheapest decent model: `POLLINATIONS_MODEL=flux` (~0.002 pollen per image). `--list-models` shows the rest.
- Missing images degrade gracefully: photos show a plaster placeholder with their caption, and every 3D texture has a procedural canvas twin in `src/three/materials.js`.

## Conventions

- All copy lives in `src/data/*.js`. Voice: calm, warm, precise. Banned words: elevate, curated experience, timeless elegance, unleash, seamless, transform your space, dream home.
- Colours and fonts are Tailwind tokens (`tailwind.config.js`) mirrored as CSS vars in `src/index.css`.
- Every ScrollTrigger lives inside a `useGSAP` scope so it dies with its component.
- Don't use IntersectionObserver to decide whether a canvas inside a ScrollTrigger pin is visible: it misreports `position: fixed` pins. Use `LazyMount` (rect-based) or a ScrollTrigger.
- The footer never gets a large wordmark or logo.
