#!/usr/bin/env python3
"""Write scripts/image-manifest.json: every photo and texture the TAAQ site uses.

Run once after editing a prompt (add --with-textures to include the 3D
texture JPGs), then generate with `npm run images`
(which skips files that already exist, so it is safe to re-run).
"""
import json
import sys
from pathlib import Path

PHOTO = (", architectural interior photography, soft natural window light, warm lime-plaster "
         "walls, calm minimal styling, solid wood furniture, muted earthy palette of plaster "
         "beige, walnut brown, sage and terracotta, shot on medium format, 35mm, high detail, "
         "realistic, no people's faces, no text, no watermark, no logo")
TEXTURE = "seamless tileable texture, top view, flat even lighting, no shadows, high detail, "
# Product shots skip the interior suffix: with it, the free model paints an empty room.
PRODUCT = ("product catalogue photograph of {}, alone, standing on the floor against a plain warm "
           "beige plaster wall, studio lighting, soft shadow, centered, whole piece in frame, "
           "minimal, no other furniture, photorealistic, no text, no watermark")

ROOMS = [
    ("living room with a cream boucle lounge chair and a round walnut side table", 1200, 1500),
    ("dining room with a long sheesham dining table and woven cane chairs", 1600, 1000),
    ("bedroom with a low walnut platform bed and rumpled natural linen bedding", 1200, 1200),
    ("study with a white oak writing desk under a tall arched window", 1200, 1500),
    ("reading nook with a woven cane bench, cushions and a stack of books", 1600, 1000),
    ("entrance hall with a hand-carved Chiniot wooden console and a round brass mirror", 1200, 1500),
    ("terrace with woven cane loungers at dusk, potted olive trees", 1600, 1000),
    ("children's corner with low white oak shelves, a small cot and wooden toys", 1200, 1200),
    ("living room at night lit only by a slim brass floor lamp, walnut furniture", 1600, 1000),
]
DAY = [
    ("morning", "a reading nook at dawn, pale blue-pink first light through an arched window, cane bench"),
    ("study", "a white oak desk in bright late-morning light, open notebook, brass desk lamp"),
    ("lunch", "a sheesham dining table set for lunch in warm amber afternoon sun, cane chairs"),
    ("evening", "a living room at dusk, rose-coloured evening light, boucle sofa, walnut coffee table"),
    ("night", "a bedroom at night, deep shadows, a low walnut bed lit by one warm bedside lamp"),
]
PRODUCTS = {
    "dune-lounge-chair": "a low lounge chair with thick cream boucle seat and back cushions on a low walnut frame with tapered legs",
    "dune-sofa": "a long three-seat sofa with plump cream boucle cushions on a low walnut plinth frame",
    "jharoka-armchair": "a carved sheesham armchair with an arched latticed back and a sage linen seat",
    "noor-dining-chair": "a solid walnut dining chair with a woven cane backrest and curved top rail",
    "kursi-desk-chair": "a white oak desk chair with a curved spindle back and leather seat",
    "ravi-stool": "a small four-legged sheesham stool with a woven cane seat and mortise and tenon joints",
    "arc-side-table": "a round walnut side table with three splayed tapered legs",
    "qila-dining-table": "a long solid sheesham dining table with thick trestle legs",
    "chabutra-coffee-table": "a low rectangular walnut coffee table with rounded edges and a lower shelf",
    "kalam-writing-desk": "a white oak writing desk with slim tapered legs and two small drawers with brass pulls",
    "chaand-console": "a hand-carved sheesham console table with a crescent-moon fretwork apron",
    "taaq-bookcase": "a tall walnut bookcase with arched niches, a few books and ceramics",
    "sandook-chest": "a traditional sheesham storage chest bound with aged brass corners and studs",
    "almari-wardrobe": "a tall two-door ebonised ash wardrobe with carved panels and brass handles",
    "rasta-sideboard": "a long walnut sideboard with woven cane sliding doors on slim legs",
    "kitab-low-shelf": "a low white oak children's bookshelf with rounded corners",
    "neend-bed": "a low walnut platform bed with a slatted headboard and natural linen bedding",
    "lori-cot": "a white oak baby cot with turned spindles and rounded rails",
    "sirhana-nightstand": "a small walnut nightstand with one drawer and a cane-front cupboard",
    "halo-floor-lamp": "a slim brass floor lamp with a thin ring-shaped shade glowing warm",
    "diya-table-lamp": "a turned walnut table lamp with a pleated linen shade",
    "fanoos-pendant": "a woven cane pendant lamp shaped like a lantern, glowing warm",
    "shamaa-sconce": "an aged brass wall sconce with a frosted glass cup",
    "sehan-cane-bench": "a long low bench with a woven cane seat on a solid walnut frame",
    "charpai-daybed": "a traditional charpai daybed with turned sheesham legs and hand-woven jute and cane seat",
    "veranda-lounger": "a reclining outdoor lounger in teak with a woven cane back",
    "matka-vase": "a large rounded terracotta clay vase with a matte glaze",
    "surma-mirror": "a round wall mirror in a thick aged brass frame",
    "thaal-tray": "a round walnut serving tray with raised edges and brass handles",
}
COLLECTIONS = {
    "living": "a living room corner with a boucle lounge chair, walnut coffee table and books",
    "dining": "a dining room with a sheesham table set for dinner, cane chairs, a cane pendant",
    "bedroom": "a calm bedroom with a low walnut bed, linen bedding and a carved chest",
    "study": "a study with an oak desk, arched bookcase and a brass lamp",
    "outdoor-cane": "a shaded courtyard veranda with a charpai daybed and cane loungers",
    "lighting": "a dim room lit by a brass floor lamp, a cane pendant and a linen table lamp",
    "objects": "a still life of a terracotta vase, a walnut tray and a brass mirror on a plaster ledge",
    "kids": "a children's room with an oak cot, a low bookshelf and a small cane stool",
}
HOMES = [
    "a Gulberg apartment reading corner with a boucle lounge chair by a window",
    "a DHA dining room with a long sheesham table after dinner, candles",
    "an old Lahore haveli courtyard with a charpai daybed and potted plants",
    "a Karachi sea-facing living room with a walnut sofa and cane pendant",
    "an Islamabad study with an oak desk facing the Margalla hills",
    "a child's bedroom in Model Town with an oak cot and a low shelf",
    "a bedroom with a low walnut bed and a carved brass-bound chest",
    "an entrance hall with a carved console, a brass mirror and fresh jasmine",
]
# Hands only: the model draws faces unless the frame is cropped at the wrists.
CRAFTSMEN = [
    "close-up photograph of an old craftsman's weathered hands holding a chisel against a sheesham plank on a workbench, cropped at the wrists, no face, no head, wood shavings, warm window light, photorealistic",
    "close-up photograph of an old craftsman's weathered hands weaving cane strands onto a wooden stool frame, cropped at the wrists, no face, no head, warm window light, photorealistic",
    "close-up photograph of an old craftsman's weathered hands rubbing oil into a walnut tabletop with a cotton cloth, cropped at the wrists, no face, no head, warm window light, photorealistic",
]
OTHER = [
    ("images/manifesto-1.jpg", "close-up of a chisel carving a walnut board, wood shavings, macro", 600, 400),
    ("images/manifesto-2.jpg", "close-up of hands oiling a walnut surface with a cotton cloth, glistening grain", 600, 400),
    ("images/manifesto-3.jpg", "an old worn leather and wood armchair standing in a single sunbeam", 600, 400),
    ("images/library-workshop.jpg", "a Chiniot woodworking workshop with a long workbench, hand tools on the wall, stacked sheesham planks, sawdust floating in sunbeams", 800, 600),
    ("images/visit-door-left.jpg", "front view of one tall ornate hand-carved dark sheesham wooden door panel, deep floral relief carving, brass studs, the carved door fills the entire frame edge to edge, flat orthographic, no room, no floor", 800, 1600),
    ("images/visit-door-right.jpg", "front view of one tall ornate hand-carved dark sheesham wooden door panel, deep floral relief carving, brass studs, the carved door fills the entire frame edge to edge, flat orthographic, no room, no floor", 800, 1600),
    ("images/visit-showroom.jpg", "a gallery-like furniture showroom with arched niches, plinths with single chairs and tables, skylight", 1600, 1100),
    ("images/preloader-walnut.jpg", "extreme close-up macro photograph of oiled dark chocolate-brown american walnut wood grain, deep brown not red, flat surface filling the entire frame", 1024, 1024),
]
TEXTURES = {
    "wood-walnut": "american walnut wood planks, straight grain, dark brown, oiled",
    "wood-sheesham": "sheesham rosewood, golden brown with dark streaks, straight grain",
    "wood-oak": "white oak wood, pale blond, fine straight grain, matte",
    "wood-ash-ebonised": "ebonised ash wood, near black, visible open grain",
    "wood-endgrain-rings": "end grain of a sawn tree log, concentric growth rings, sheesham",
    "bark-sheesham": "rough tree bark, grey brown, deep vertical fissures",
    "fabric-boucle-cream": "cream boucle fabric, looped textured yarn",
    "fabric-linen-sage": "sage green linen fabric, fine slub weave",
    "fabric-velvet-rust": "rust orange cotton velvet fabric, soft pile",
    "fabric-wool-charcoal": "charcoal grey wool fabric, twill weave",
    "cane-weave": "hand-woven rattan cane webbing, octagonal open weave, natural honey colour",
    "plaster-wall": "warm beige lime plaster wall, subtle trowel marks",
    "terrazzo-floor": "pale terrazzo floor, cream base with small beige, grey and terracotta chips",
    "brass-brushed": "brushed aged brass metal, fine horizontal lines",
}


def main():
    jobs = []
    seed = 100

    def add(out, prompt, w, h, suffix=PHOTO, raw=False):
        nonlocal seed
        seed += 1
        jobs.append({"prompt": prompt if raw else prompt + suffix, "out": out, "width": w, "height": h, "seed": seed})

    for i, (p, w, h) in enumerate(ROOMS, 1):
        add(f"images/room-{i}.jpg", p, w, h)
    for name, p in DAY:
        add(f"images/day-{name}.jpg", "the same home through the day: " + p, 1600, 1000)
    for slug, p in PRODUCTS.items():
        add(f"images/product-{slug}.jpg", PRODUCT.format(p), 1200, 1500, raw=True)
    for out, p, w, h in OTHER:
        add(out, p, w, h, raw=out.endswith("preloader-walnut.jpg"))
    for name, p in COLLECTIONS.items():
        add(f"images/collection-{name}.jpg", p, 900, 1100)
    for i, p in enumerate(HOMES, 1):
        add(f"images/home-{i}.jpg", "a real-looking furnished Pakistani home, " + p, 1000, 1000)
    for i, p in enumerate(CRAFTSMEN, 1):
        add(f"images/craftsman-{i}.jpg", p, 900, 1200, raw=True)
    # Textures are opt-in: the free model draws them as tiles or objects, and
    # src/three/materials.js already paints seamless ones in the browser.
    if "--with-textures" in sys.argv:
        for name, p in TEXTURES.items():
            add(f"textures/{name}.jpg", TEXTURE + p, 1024, 1024, suffix=", no text, no watermark")

    out = Path(__file__).with_name("image-manifest.json")
    out.write_text(json.dumps(jobs, indent=1) + "\n")
    print(f"wrote {len(jobs)} jobs to {out}")


if __name__ == "__main__":
    main()
