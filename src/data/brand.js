export const brand = {
  name: 'TAAQ',
  tagline: 'Furniture that stays.',
  meaning: 'Taaq — an alcove in a wall, a place where precious things are kept.',
  showroom: {
    line1: '7-B Main Boulevard',
    line2: 'DHA Phase 6, Lahore',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=7-B+Main+Boulevard+DHA+Phase+6+Lahore',
  },
  workshop: 'Chiniot, Punjab',
  phone: '+92 42 3712 0000',
  phoneHref: 'tel:+924237120000',
  whatsapp: 'https://wa.me/924237120000',
  email: 'hello@taaq.pk',
  instagram: 'https://instagram.com/',
  pinterest: 'https://pinterest.com/',
  // 0 = Sunday. Hours in 24h, Lahore time.
  hours: [
    { day: 'Sunday', open: null, close: null },
    { day: 'Monday', open: 11, close: 20 },
    { day: 'Tuesday', open: 11, close: 20 },
    { day: 'Wednesday', open: 11, close: 20 },
    { day: 'Thursday', open: 11, close: 20 },
    { day: 'Friday', open: 11, close: 20 },
    { day: 'Saturday', open: 11, close: 20 },
  ],
  deliveryNote: 'White-glove delivery across Lahore, Islamabad & Karachi',
  deliveryFee: 6500,
  gst: 0.18,
};

export const nav = [
  { label: 'Shop', to: '/shop', preview: '/images/product-dune-lounge-chair.jpg', blurb: 'Every piece, in one long index' },
  { label: 'Collections', to: '/#collections', preview: '/images/collection-living.jpg', blurb: 'Eight swatches on one brass pivot' },
  { label: 'Atelier', to: '/#atelier', preview: '/images/craftsman-1.jpg', blurb: 'From a Chiniot log to your room' },
  { label: 'Visit', to: '/#visit', preview: '/images/visit-showroom.jpg', blurb: 'DHA Phase 6, Lahore' },
];

export const menuDrawers = [
  { label: 'Home', to: '/', preview: '/images/room-1.jpg', note: '01' },
  { label: 'Shop', to: '/shop', preview: '/images/product-dune-lounge-chair.jpg', note: '02' },
  { label: 'Collections', to: '/#collections', preview: '/images/collection-dining.jpg', note: '03' },
  { label: 'Atelier', to: '/#atelier', preview: '/images/craftsman-2.jpg', note: '04' },
  { label: 'Visit', to: '/#visit', preview: '/images/visit-showroom.jpg', note: '05' },
];

export const woods = [
  { id: 'sheesham', name: 'Sheesham', hex: '#8A5733', tint: '#C08A5C', texture: 'wood-sheesham', delta: 0,
    care: 'Dense and oily. Wipe with a dry cloth; re-oil once a year.' },
  { id: 'walnut', name: 'Walnut', hex: '#5A3A25', tint: '#8E6446', texture: 'wood-walnut', delta: 14000,
    care: 'Darkens slowly to honey-brown in sun. Keep it out of direct afternoon light for the first months.' },
  { id: 'oak', name: 'White Oak', hex: '#C6A57A', tint: '#E3C9A2', texture: 'wood-oak', delta: 6000,
    care: 'Pale and hard. Soap finish: a damp cloth with a drop of flake soap lifts most marks.' },
  { id: 'ash', name: 'Ebonised Ash', hex: '#2C2723', tint: '#4A423C', texture: 'wood-ash-ebonised', delta: 11000,
    care: 'Iron-ebonised, so the black is in the wood, not on it. Wax every six months.' },
];

export const fabrics = [
  { id: 'boucle', name: 'Bouclé Cream', hex: '#E7DFD0', texture: 'fabric-boucle-cream', delta: 0,
    care: 'Brush along the loops; spot-clean with cold water.' },
  { id: 'linen', name: 'Sage Linen', hex: '#98A28A', texture: 'fabric-linen-sage', delta: 0,
    care: 'Covers zip off. Cold wash, line dry, press while damp.' },
  { id: 'velvet', name: 'Rust Velvet', hex: '#A1502E', texture: 'fabric-velvet-rust', delta: 9000,
    care: 'Steam to lift the pile. Turn cushions monthly.' },
  { id: 'wool', name: 'Charcoal Wool', hex: '#403C39', texture: 'fabric-wool-charcoal', delta: 7000,
    care: 'Naturally stain-resistant. Vacuum on low with a soft brush.' },
];

export const makers = {
  rasool: {
    name: 'Ustad Ghulam Rasool',
    role: 'Master carver, Chiniot',
    image: '/images/craftsman-1.jpg',
    note: 'Forty-one years at the same bench. He still sharpens every chisel himself, and will not let anyone else touch the gouges his father left him.',
  },
  bashir: {
    name: 'Bashir Ahmed',
    role: 'Cane weaver',
    image: '/images/craftsman-2.jpg',
    note: 'Weaves a chair seat in a single sitting, about six hours, so the tension never changes. Learned from his mother, who wove charpais for the whole street.',
  },
  iqbal: {
    name: 'Muhammad Iqbal',
    role: 'Finisher, Lahore',
    image: '/images/craftsman-3.jpg',
    note: 'Seven coats of oil, rubbed in by hand with a day between each. He says the wood tells him when it has had enough.',
  },
};

export const footer = {
  columns: [
    { title: 'Shop', links: [
      { label: 'All pieces', to: '/shop' },
      { label: 'Seating', to: '/shop?c=Seating' },
      { label: 'Tables', to: '/shop?c=Tables' },
      { label: 'Storage', to: '/shop?c=Storage' },
      { label: 'Lighting', to: '/shop?c=Lighting' },
    ] },
    { title: 'Studio', links: [
      { label: 'The collections', to: '/#collections' },
      { label: 'Atelier', to: '/#atelier' },
      { label: 'Homes we furnished', to: '/#homes' },
      { label: 'Make it yours', to: '/#configure' },
    ] },
    { title: 'Care & Delivery', links: [
      { label: 'Caring for solid wood', to: '/shop' },
      { label: 'White-glove delivery', to: '/checkout' },
      { label: 'Made to order', to: '/shop' },
      { label: 'Repairs, for life', to: '/#visit' },
    ] },
  ],
};
