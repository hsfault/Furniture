// model: which procedural 3D model the "See it in 3D" viewer uses.
// dims in cm, weight in kg. price is for the first listed wood (and fabric, when it has one).
const p = (o) => ({
  image: `/images/product-${o.slug}.jpg`,
  fabrics: [],
  inStock: false,
  leadTime: 'Made to order · 5–6 weeks',
  finish: 'Hand-rubbed oil, seven coats',
  ...o,
});

export const products = [
  p({
    slug: 'dune-lounge-chair', name: 'Dune Lounge Chair', category: 'Seating',
    collections: ['living', 'study'], woods: ['walnut', 'sheesham', 'oak', 'ash'],
    fabrics: ['boucle', 'linen', 'velvet', 'wool'], price: 186000,
    dims: { w: 78, d: 84, h: 72, seat: 38 }, weight: 31, model: 'chair', maker: 'rasool', inStock: true,
    story: 'Low, deep and heavy enough not to move when you drop into it. The frame is jointed walnut; the cushions are bouclé over horsehair and cotton.',
    leadTime: 'In stock · delivered in 7 days',
  }),
  p({
    slug: 'dune-sofa', name: 'Dune Three-Seat Sofa', category: 'Seating',
    collections: ['living'], woods: ['walnut', 'oak'], fabrics: ['boucle', 'linen', 'wool'], price: 412000,
    dims: { w: 228, d: 96, h: 74, seat: 40 }, weight: 78, model: 'chair', maker: 'rasool',
    story: 'The Dune chair, stretched to seat three without a seam across the middle. One long cushion, so nobody sits in the crack.',
  }),
  p({
    slug: 'jharoka-armchair', name: 'Jharoka Armchair', category: 'Seating',
    collections: ['living'], woods: ['sheesham', 'walnut'], fabrics: ['linen', 'velvet'], price: 138000,
    dims: { w: 66, d: 70, h: 96, seat: 44 }, weight: 19, model: 'chair', maker: 'rasool',
    story: 'Its back is a jharoka, the latticed balcony window of old Lahore, carved from one board so the light comes through in small arches.',
  }),
  p({
    slug: 'noor-dining-chair', name: 'Noor Dining Chair', category: 'Seating', tags: ['Cane'],
    collections: ['dining', 'outdoor-cane'], woods: ['walnut', 'sheesham', 'oak'], price: 48000,
    dims: { w: 48, d: 52, h: 82, seat: 46 }, weight: 6.5, model: 'chair', maker: 'bashir', inStock: true,
    story: 'A curved top rail steamed over a week, and a cane back that gives a little when you lean into a long dinner.',
    leadTime: 'In stock · delivered in 7 days',
  }),
  p({
    slug: 'kursi-desk-chair', name: 'Kursi Desk Chair', category: 'Seating',
    collections: ['study'], woods: ['oak', 'walnut'], price: 64000,
    dims: { w: 56, d: 52, h: 80, seat: 46 }, weight: 7, model: 'chair', maker: 'rasool',
    story: 'Eleven turned spindles in a curved back. Built for the kind of sitting where you forget you are sitting.',
  }),
  p({
    slug: 'ravi-stool', name: 'Ravi Stool', category: 'Seating', tags: ['Cane'],
    collections: ['study', 'kids'], woods: ['sheesham', 'walnut', 'oak'], price: 26000,
    dims: { w: 40, d: 40, h: 46 }, weight: 3.8, model: 'stool', maker: 'bashir', inStock: true,
    story: 'The stool from our workshop film: four legs, four rails, eight mortises and a cane seat. Not a single screw.',
    leadTime: 'In stock · delivered in 7 days',
  }),
  p({
    slug: 'arc-side-table', name: 'Arc Side Table', category: 'Tables',
    collections: ['living', 'study', 'kids'], woods: ['walnut', 'oak', 'ash'], price: 54000,
    dims: { w: 48, d: 48, h: 52 }, weight: 6, model: 'table', maker: 'iqbal', inStock: true,
    story: 'A round top turned from a single walnut board, on three legs splayed at eleven degrees so it never rocks on an uneven floor.',
    leadTime: 'In stock · delivered in 7 days',
  }),
  p({
    slug: 'qila-dining-table', name: 'Qila Dining Table', category: 'Tables',
    collections: ['dining'], woods: ['sheesham', 'walnut'], price: 365000,
    dims: { w: 240, d: 100, h: 76 }, weight: 96, model: 'table', maker: 'rasool',
    story: 'Seats eight, ten at Eid. Trestle legs with through-tenons and walnut wedges you can see and tap back in if the seasons ever loosen them.',
    leadTime: 'Made to order · 8–10 weeks',
  }),
  p({
    slug: 'chabutra-coffee-table', name: 'Chabutra Coffee Table', category: 'Tables',
    collections: ['living'], woods: ['walnut', 'sheesham', 'ash'], price: 128000,
    dims: { w: 120, d: 64, h: 38 }, weight: 28, model: 'table', maker: 'iqbal',
    story: 'Named for the raised courtyard platform where people sit in the evening. A thick top with a soft rounded edge and a low shelf for the books you mean to read.',
  }),
  p({
    slug: 'kalam-writing-desk', name: 'Kalam Writing Desk', category: 'Tables',
    collections: ['study'], woods: ['oak', 'walnut'], price: 214000,
    dims: { w: 130, d: 62, h: 75 }, weight: 34, model: 'table', maker: 'rasool',
    story: 'Two shallow drawers, hand-dovetailed, with brass pulls that warm under your fingers. Sized for a laptop and a notebook, with room left for a cup.',
  }),
  p({
    slug: 'chaand-console', name: 'Chaand Console', category: 'Tables',
    collections: ['living', 'objects'], woods: ['sheesham', 'walnut'], price: 176000,
    dims: { w: 140, d: 38, h: 82 }, weight: 30, model: 'table', maker: 'rasool',
    story: 'A crescent-moon fretwork apron carved over three weeks in Chiniot. Made for an entrance, where it is the first thing you touch coming home.',
    leadTime: 'Made to order · 8–10 weeks',
  }),
  p({
    slug: 'taaq-bookcase', name: 'Taaq Bookcase', category: 'Storage',
    collections: ['study', 'living'], woods: ['walnut', 'oak'], price: 268000,
    dims: { w: 110, d: 36, h: 210 }, weight: 72, model: 'box', maker: 'rasool',
    story: 'The piece we are named after: five arched niches, each a small taaq for the things you keep. Back panels in book-matched veneer.',
  }),
  p({
    slug: 'sandook-chest', name: 'Sandook Chest', category: 'Storage',
    collections: ['bedroom', 'kids'], woods: ['sheesham'], price: 158000,
    dims: { w: 110, d: 50, h: 56 }, weight: 41, model: 'box', maker: 'rasool', inStock: true,
    story: 'The dowry chest, honestly made. Aged brass corners, hand-set studs, and a lid that closes slowly on a soft stay so small fingers are safe.',
    leadTime: 'In stock · delivered in 7 days',
  }),
  p({
    slug: 'almari-wardrobe', name: 'Almari Wardrobe', category: 'Storage',
    collections: ['bedroom'], woods: ['ash', 'walnut'], price: 395000,
    dims: { w: 120, d: 60, h: 200 }, weight: 110, model: 'box', maker: 'rasool',
    story: 'Two tall doors with carved raised panels and a cedar-lined interior that keeps moths away and smells faintly of pencils.',
    leadTime: 'Made to order · 10–12 weeks',
  }),
  p({
    slug: 'rasta-sideboard', name: 'Rasta Sideboard', category: 'Storage', tags: ['Cane'],
    collections: ['dining', 'outdoor-cane'], woods: ['walnut', 'oak'], price: 238000,
    dims: { w: 180, d: 46, h: 78 }, weight: 52, model: 'box', maker: 'bashir',
    story: 'Sliding cane doors that let the air through, the way old Punjabi kitchens kept bread and spices breathing.',
  }),
  p({
    slug: 'kitab-low-shelf', name: 'Kitab Low Shelf', category: 'Storage',
    collections: ['kids'], woods: ['oak'], price: 58000,
    dims: { w: 90, d: 30, h: 60 }, weight: 14, model: 'box', maker: 'iqbal', inStock: true,
    story: 'Child height, every corner rounded to a 12 mm radius, covers facing out so the book chooses the child.',
    leadTime: 'In stock · delivered in 7 days',
  }),
  p({
    slug: 'neend-bed', name: 'Neend Platform Bed', category: 'Beds',
    collections: ['bedroom'], woods: ['walnut', 'oak', 'sheesham'], price: 325000,
    dims: { w: 196, d: 214, h: 88 }, weight: 92, model: 'box', maker: 'rasool',
    story: 'Low to the floor, with a slatted headboard that leans back eight degrees for reading. Breaks down into five parts for narrow haveli stairs.',
  }),
  p({
    slug: 'lori-cot', name: 'Lori Cot', category: 'Beds',
    collections: ['kids'], woods: ['oak'], price: 118000,
    dims: { w: 128, d: 68, h: 92 }, weight: 24, model: 'box', maker: 'iqbal',
    story: 'Turned spindles spaced for small heads, a base that lowers as the baby learns to stand, and a side that comes off when it becomes a daybed.',
  }),
  p({
    slug: 'sirhana-nightstand', name: 'Sirhana Nightstand', category: 'Storage', tags: ['Cane'],
    collections: ['bedroom'], woods: ['walnut', 'sheesham'], price: 64000,
    dims: { w: 48, d: 40, h: 54 }, weight: 11, model: 'box', maker: 'bashir', inStock: true,
    story: 'One drawer for the phone, one cane-fronted cupboard for everything else. Sized to sit exactly at mattress height beside the Neend bed.',
    leadTime: 'In stock · delivered in 7 days',
  }),
  p({
    slug: 'halo-floor-lamp', name: 'Halo Floor Lamp', category: 'Lighting',
    collections: ['living', 'lighting'], woods: ['walnut'], price: 72000,
    dims: { w: 38, d: 38, h: 168 }, weight: 7, model: 'lamp', maker: 'iqbal', inStock: true,
    story: 'A thin brass rod and a ring of warm light at reading height. The walnut base is heavy so the lamp stays put when the cat does not.',
    leadTime: 'In stock · delivered in 7 days',
  }),
  p({
    slug: 'diya-table-lamp', name: 'Diya Table Lamp', category: 'Lighting',
    collections: ['lighting', 'bedroom', 'kids'], woods: ['walnut', 'oak'], price: 38000,
    dims: { w: 32, d: 32, h: 48 }, weight: 2.6, model: 'lamp', maker: 'iqbal',
    story: 'A turned walnut base shaped like an oil lamp, under a pleated linen shade that turns the bulb into candlelight.',
  }),
  p({
    slug: 'fanoos-pendant', name: 'Fanoos Pendant', category: 'Lighting', tags: ['Cane'],
    collections: ['lighting', 'dining', 'outdoor-cane'], woods: ['walnut'], price: 46000,
    dims: { w: 46, d: 46, h: 58 }, weight: 2.1, model: 'lamp', maker: 'bashir',
    story: 'A lantern of woven cane that throws a soft pattern of light onto the ceiling. Hang it low over the table.',
  }),
  p({
    slug: 'shamaa-sconce', name: 'Shamaa Sconce', category: 'Lighting',
    collections: ['lighting'], woods: ['walnut'], price: 32000,
    dims: { w: 14, d: 18, h: 30 }, weight: 1.2, model: 'lamp', maker: 'iqbal', inStock: true,
    story: 'Aged brass and a frosted cup on a small walnut backplate. Two of them either side of a mirror make an entrance feel like an evening.',
    leadTime: 'In stock · delivered in 7 days',
  }),
  p({
    slug: 'sehan-cane-bench', name: 'Sehan Cane Bench', category: 'Seating', tags: ['Cane'],
    collections: ['outdoor-cane', 'living'], woods: ['walnut', 'sheesham'], price: 92000,
    dims: { w: 140, d: 42, h: 44 }, weight: 13, model: 'bench', maker: 'bashir',
    story: 'For the end of a bed, a hallway, or the courtyard on a cool evening. The cane is woven straight onto the frame, wet, so it tightens as it dries.',
  }),
  p({
    slug: 'charpai-daybed', name: 'Charpai Daybed', category: 'Beds', tags: ['Cane'],
    collections: ['outdoor-cane'], woods: ['sheesham'], price: 142000,
    dims: { w: 190, d: 92, h: 48 }, weight: 26, model: 'bench', maker: 'bashir',
    story: 'The bed every Punjabi grandmother had on the roof, made a little lower and a little finer, with turned legs lacquered in the Chiniot way.',
  }),
  p({
    slug: 'veranda-lounger', name: 'Veranda Lounger', category: 'Seating', tags: ['Cane'],
    collections: ['outdoor-cane'], woods: ['sheesham'], price: 118000,
    dims: { w: 66, d: 150, h: 84, seat: 34 }, weight: 21, model: 'bench', maker: 'bashir',
    story: 'Three reclining positions, a cane back that breathes in June, and arms wide enough for a glass of lassi.',
  }),
  p({
    slug: 'matka-vase', name: 'Matka Vase', category: 'Objects',
    collections: ['objects', 'dining'], woods: ['walnut'], price: 14500,
    dims: { w: 34, d: 34, h: 42 }, weight: 4.2, model: 'vase', maker: 'iqbal', inStock: true,
    story: 'Thrown by a potter in Gujrat in the shape of the water pot, then glazed matte so it holds a branch of bougainvillea like it belongs there.',
    leadTime: 'In stock · delivered in 7 days', finish: 'Matte glaze, unglazed foot',
  }),
  p({
    slug: 'surma-mirror', name: 'Surma Mirror', category: 'Objects',
    collections: ['objects', 'bedroom'], woods: ['walnut'], price: 68000,
    dims: { w: 80, d: 4, h: 80 }, weight: 9, model: 'vase', maker: 'iqbal',
    story: 'A thick ring of aged brass around a round mirror. It darkens where hands touch it, which is the point.',
    finish: 'Aged brass, waxed',
  }),
  p({
    slug: 'thaal-tray', name: 'Thaal Tray', category: 'Objects',
    collections: ['objects', 'dining'], woods: ['walnut', 'sheesham'], price: 12000,
    dims: { w: 48, d: 48, h: 6 }, weight: 1.4, model: 'table', maker: 'iqbal', inStock: true,
    story: 'Turned from offcuts of the Qila table so nothing good is thrown away. Brass handles, raised rim, carries chai for six.',
    leadTime: 'In stock · delivered in 7 days',
  }),
];

export const categories = ['All', 'Seating', 'Tables', 'Storage', 'Beds', 'Lighting', 'Cane'];

export const bySlug = Object.fromEntries(products.map((x) => [x.slug, x]));

export function matchesCategory(product, cat) {
  if (!cat || cat === 'All') return true;
  return product.category === cat || (product.tags || []).includes(cat);
}
