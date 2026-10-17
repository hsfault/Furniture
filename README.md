# TAAQ — Furniture that stays

A mockup storefront for TAAQ, a solid-wood furniture maker (carved in Chiniot, finished in Lahore). Built to `PRD.md`: smooth scroll, deep parallax, WebGL "living pictures", real-time 3D furniture, a chest-of-drawers menu, wardrobe-door page transitions, a catalogue shelf of books, and "Play the House", a guided film of the homepage.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve dist/
npm run images     # generate missing photos/textures with Pollinations
```

Pages: `/`, `/shop`, `/product/:slug`, `/checkout`, `/order/:id`.

## Images

Photos and textures are generated with Pollinations (`scripts/pollinations.py`, manifest in `scripts/image-manifest.json`). If a file is missing the site still works: photos show a plaster placeholder and 3D materials use procedural textures. See `CLAUDE.md`.
