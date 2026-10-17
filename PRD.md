# TAAQ — Build Spec (PRD)

A mockup storefront for **TAAQ**, a solid-wood furniture maker ("taaq" is Urdu for an alcove in a wall, a place where precious things are kept). Carved in Chiniot, finished in Lahore. Tagline: **Furniture that stays.** It should read like an Awwwards Site of the Day: deep parallax, smooth scroll, pictures that move, real-time 3D furniture. Everything is hand-tuned; nothing should look templated.

## 1. Purpose

- Show the brand's craft (joinery, grain, weight, time) through motion and 3D, not through stock layouts.
- Let a visitor browse collections, configure a chair, add to a persisted cart and run a mock checkout.
- Act as a film: "Play the House" turns the homepage into a ~70 s guided tour.

## 2. Stack

| Concern | Choice |
|---|---|
| App | React 18 + Vite 6, React Router v6 |
| Styling | Tailwind CSS v3 with brand tokens, CSS variables in `index.css` |
| State | Zustand (`cart` persisted to localStorage, `ui` for menu/film/sound/intro) |
| Motion | GSAP 3.13+ (ScrollTrigger, SplitText, Flip, Draggable, InertiaPlugin) via `@gsap/react` `useGSAP` |
| Scroll | Lenis synced to the GSAP ticker (`lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t*1000))`, `lagSmoothing(0)`) |
| 3D | three + @react-three/fiber 8 + drei 9. The lamp's "bloom" is an additive halo sprite: an EffectComposer pass rendered the hero blank under software GL, so postprocessing is not used |
| Icons | lucide-react, sparingly |
| Images | Pollinations via `scripts/pollinations.py` → `public/images`, `public/textures`; never hotlinked |

No UI kits.

## 3. Brand and voice

- Showroom: 7-B Main Boulevard, DHA Phase 6, Lahore. Workshop: Chiniot. Tel +92 42 3712 0000. Mon–Sat 11am–8pm.
- Woods: sheesham, walnut, white oak, ebonised ash. Also cane, bouclé, linen, aged brass.
- Prices in PKR as `Rs 186,000` (`lib/format.js`).
- Voice: calm, warm, precise, a little poetic. Banned: elevate, curated experience, timeless elegance, unleash, seamless, transform your space, dream home.

## 4. Design system — "Plaster & Walnut"

| Token | Hex | Use |
|---|---|---|
| plaster | #EFE9E1 | page background |
| linen | #F7F3EE | raised surfaces, book pages |
| espresso | #2A1D15 | primary text |
| walnut | #5A3A25 | secondary dark, buttons, shelf |
| taupe | #8F8073 | secondary text |
| sage | #8C9A7E | tags, small states |
| clay | #C2693E | the one strong accent: CTAs, active, play button, cart badge, focus ring |
| brass | #B8935A | hairlines, foil, dimension lines |
| night | #1B1612 | night chapter, film overlay |

- Fonts: Bodoni Moda (display, regular; italic for the emotional word), Hanken Grotesk 400/500/600 (UI), IBM Plex Mono (specs: 11–12 px, uppercase, tracking .14em), Caveat (Polaroid captions only).
- Fluid type: hero `clamp(3.4rem,9vw,10rem)` / lh .92 / tracking -.03em; section titles `clamp(2.4rem,6vw,6.5rem)`.
- Asymmetric 12-col grid, 1 px brass hairlines at 40 %. Brand shape: the arch (`border-radius:999px 999px 0 0`) and the recessed niche (inset shadow).
- Fixed SVG feTurbulence grain overlay, 5 %, multiply.
- Forbidden: boxy card grids, 3-equal feature rows, rounded-2xl shadow cards, centered title+2 buttons hero, gradient text, purple/blue gradients, emoji, glassmorphism everywhere, a big footer wordmark.

## 5. Motion language

| Effect | Spec | File |
|---|---|---|
| Headline flip | SplitText chars, `rotateX:-90 → 0`, origin `50% 50% -0.4em`, opacity 0→1, stagger .025, 1.1 s, expo.out, parent perspective 800 | `lib/splitReveal.js` |
| Ink fill | words opacity .15 → 1 scrubbed to scroll | `lib/splitReveal.js` |
| Unfold | frame scaleY 0→1 from top with a shadow line, 1.2 s power4.inOut, inner image 1.3→1 | `lib/unfold.js`, `GLImage` |
| Parallax | every `[data-speed]` (0.5–1.6) moved by one utility; framed images get inner parallax (120 % tall, −10 % → 10 %) | `lib/parallax.js` |
| Eases | expo.out entrances, power4.inOut transitions, springs for 3D | — |

Only transform/opacity/clip-path are animated. All ScrollTriggers live in `useGSAP` scopes and die on route change.
Reduced motion: no WebGL distortion, no scrub, no film player, simple fades, 3D renders one frame.

## 6. Living pictures — global WebGL image layer

- One fixed transparent R3F canvas (`gl/GLImageLayer.jsx`) behind the DOM, orthographic camera in CSS pixels, dpr [1, 1.5], paused when the tab is hidden.
- `<GLImage>` renders a real `<img>` (keeps alt text and layout), registers a plane in `gl/registry.js`; once the texture is uploaded the `<img>` goes to opacity 0.
- Every frame each plane copies its element's rect (center from `getBoundingClientRect`, size from `offsetWidth/Height`, optional `rotate`). Planes more than one viewport away are not drawn.
- Shader (`gl/shaders/imageBend.vert/.frag`): velocity bend `sin(uv.x·π)·v·0.0025` (springy), hover ripple from mouse UV + 0.002 RGB shift + 1.04 zoom, `uProgress` diagonal noise wipe for reveals, object-fit cover maths, arch/pill/rounded masks via SDF, optional clip rect.
- Fallback (touch < 768 px, no WebGL2, reduced motion): plain `<img>` with CSS inner parallax and DOM unfold.
- Missing image (generation failed) → styled plaster gradient placeholder with the caption in mono.

## 7. Global components

| Component | Notes |
|---|---|
| `Preloader` | once per session; ~40-path blueprint lounge chair draws in carpenter order (legs → seat frame → back → cushions) 1.6 s; brass dimension lines `W 78 · D 84 · H 72 cm`; mono counter 00→100; walnut fills the chair (clip-path); the sheet splits on a vertical crease, halves rotateY ±90° outward |
| `Nav` | TAAQ left (Bodoni 22 px, .2em), Shop · Collections · Atelier · Visit · Cart (n) · sound · Menu; rolling-label hover; transparent over hero, plaster+blur after 100 px; hides on scroll down |
| `DrawerMenu` | full-screen chest of 5 walnut drawers with brass pulls, labels Bodoni ~7vw, slide in from alternating sides; hover pulls a drawer out (translateZ, scale 1.03, shadow) and a page preview slides out of its top edge; click → wooden thunk + all drawers close → navigate |
| `DoorTransition` | two plaster wardrobe doors (walnut edge, brass knob) meet in 0.7 s power4.inOut; destination in Bodoni italic on the seam; scroll resets while closed; doors open, the new headline flips in |
| `Cursor` | pointer:fine only; 12 px ring + 3 px dot lerped; on `[data-cursor]` it becomes a brass measuring crosshair spanning the element with live px→cm readouts and a label (VIEW, DRAG, OPEN, ROTATE); optional caption chip (`data-cursor-caption`) |
| `FilmPlayer` | "Play the House": 56 px clay button that expands to a 420 px plaster bar (play/pause, chapter title, scrubbable progress with ticks, timecode, chapter popover, sound); one GSAP master timeline drives Lenis through 10 chapters; three.js door cuts with sawdust between chapters; letterbox, title card, grain; any input pauses, Space toggles, Esc stops; hides near footer; not rendered for reduced motion |
| `FilmCutScene.js` | plain three.js, own canvas, rendered only during cuts: bevelled walnut doors with brass handles swing in from depth and close, instanced sawdust, night tint, next chapter title flies in, doors reopen |
| `Footer` | brass top hairline; "Some things are made to be *kept*." + newsletter (underline input, clay arrow → check, "See you in your inbox."); 4 columns (Shop, Studio, Care & Delivery, Visit); small bottom bar only |
| `CartDrawer` | desktop: walnut drawer front with brass pull slides up to 70vh, linen interior; mobile full screen; qty stepper, remove collapses, subtotal, Checkout |
| `Lightbox`, `ProductSheet` | Flip from the source image; focus trapped, Esc closes |
| `RollingNumber` | per-digit rolling strips for prices |
| `SoundToggle` | 3-bar equaliser; Web Audio only (`lib/sound.js`): room tone, wood click, paper rustle, soft thud. Off by default |

## 8. Home page — chapters

Each homepage section is a `<section data-chapter="NN">`; titles, captions and durations come from `data/film.js`.

| # | Section | Key build notes | Mobile |
|---|---|---|---|
| 01 | Arrival (`Hero` + `DioramaScene`) | L of plaster walls, terrazzo floor, extruded arch window with light shafts + dust; Dune chair, Arc table, Halo lamp, cane bench, vase dropped in with springs + dust puffs, lamp flickers on last; sun angle from the visitor's local time + mono label; cursor orbit ±4°; pinned 150vh scrub: dolly in, walls fade, chair turns 25°, text exits | simpler scene, dpr 1, no pin, auto-rotate |
| 02 | Manifesto | Bodoni paragraph with ink fill; inline arch-ended image pills (GL) that spring to 3× on hover; left/right halves drift at 1.1/0.9 | same, no hover |
| 03 | Rooms | 220vh, sticky centered title, 9 GL images at speeds 0.5→1.6 with tilt; hover caption chip; click → Flip lightbox with pulsing brass hotspots → tag (name, price, View) | 2 staggered columns |
| 04 | A Day at Home | pinned horizontal 5 panels; bg dawn → plaster → amber → dusk rose → night with text inversion; mono clock 07:00→23:00; sun/moon on an arc; inner parallax opposite to travel | vertical stack, same colours |
| 05 | Make It Yours (`ConfiguratorScene`) | Dune chair on rotating plinth; OrbitControls polar 60–85°, damped; wood swatches crossfade texture in a 0.6 s shader blend; fabric swap with puff; Single/Wide width spring; 3D brass dimension lines with Html labels; rolling price; canvas snapshot flies to cart | canvas 60vh on top, swipe rows |
| 06 | The Library (`CatalogueShelf`, `Book`, `BookPage`) | walnut case, 8 cloth books + ghost, bookend, plant, tilted workshop photo; books rise in; hover lifts 12 px; click: dim, fly to center turning cover (rotY 90→0), slide right, cover opens (−178°); 7 pages turned with Next/Back/←→ (leaf −176°, moving shade); add to cart from pages; close reverses at 1.6× | horizontal shelf scroll, single-page book |
| 07 | Log to Living Room (`LogStoryScene`) | pinned 300vh; log → 6 planks fan → stool with brass joint outlines → oiled finish (roughness .8→.35, sheen sweep) + cane seat weave by weave; sawdust during cut; step list with brass progress | canvas + tappable step list, no pin |
| 08 | The Collection (`CollectionCanvas`) | infinite wrapping plane of product photos, Draggable+Inertia+wheel, GL bend from drag velocity; filter chips re-flow with Flip (others shrink to dots); click → Flip into ProductSheet | 2-col masonry with parallax |
| 09 | Homes | walnut table, 8 Polaroids with Caveat captions; drag with inertia, lift, bounce; double-click flips to quote; Shuffle | swipeable stack |
| 10 | Visit | arch doorway with carved doors (image halves) swinging open on hinges onto the showroom with bloom; hours with today highlighted + open/closed; directions; booking (7 date chips, slots, name, phone) → doors close/reopen with confirmation | stacked |

## 9. Other pages

- `/shop` — headline flip; sticky filter rail (category, wood, max price slider, stock), sort; editorial list rows alternating image side, unfold reveal, GL ripple, Flip on filter; "+" quick view → ProductSheet.
- `/product/:slug` — parallax gallery (some arches) + sticky buy panel (rolling price, wood + fabric swatches, qty, add, lead time, delivery note); "See it in 3D" full-screen viewer reusing models + configurator controls + dimensions; mono spec table; "Made by" craftsman; "Pairs well with" drag row.
- `/checkout` — delivery details, city, 7-day slot calendar, mock card, summary (subtotal, white-glove Rs 6,500, GST 18 %), Place order.
- `/order/:id` — delivery timeline draws itself (5 brass nodes with dates), order number, Continue browsing.
- `*` — NotFound: an empty niche.

## 10. Data files (`src/data`)

`brand.js` (contact, hours, nav, footer, woods, fabrics), `products.js` (29 pieces: slug, name, category, collections, woods, price, dims, story, lead time, maker, model), `collections.js` (8 books: colours, sizes, story, pieces, materials), `rooms.js` (9 rooms with hotspots), `homes.js` (8 Polaroids), `film.js` (10 chapters).

## 11. Image manifest

Generated by `scripts/build-manifest.py` → `scripts/image-manifest.json` (84 jobs, fixed seeds 101–184), run with `npm run images`.

- `public/images`: room-1…9, day-{morning,study,lunch,evening,night}, product-<slug> ×29, manifesto-1…3, library-workshop, collection-<id> ×8, home-1…8, craftsman-1…3, visit-door-left/right, visit-showroom, preloader-walnut.
- `public/textures`: wood-walnut, wood-sheesham, wood-oak, wood-ash-ebonised, wood-endgrain-rings, bark-sheesham, fabric-boucle-cream, fabric-linen-sage, fabric-velvet-rust, fabric-wool-charcoal, cane-weave, plaster-wall, terrazzo-floor, brass-brushed.
- Every 3D texture also has a procedural canvas twin (`three/materials.js`) used until (or instead of) the JPG, so the 3D never renders untextured.

## 12. Performance & a11y

R3F canvases lazy-mounted by IntersectionObserver, `frameloop` demand/never when off-screen, dpr ≤ 1.5, disposal on unmount. Semantic landmarks, alt text, clay 2 px focus rings, focus traps + Esc in book/lightbox/drawers/sheets, button alternatives for every 3D interaction, fixed aspect boxes, `display=swap` fonts. No horizontal overflow at 360 px; 44 px tap targets.
