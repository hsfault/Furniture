// Layout values are for the desktop collage: left/top in % of the section, w in vw.
// speed drives [data-speed] parallax, rotate is in degrees.
// hotspots: x/y in % of the photo, pointing at a product.
export const rooms = [
  {
    id: 'room-1', image: '/images/room-1.jpg', ratio: 1200 / 1500, shape: 'arch',
    name: 'Living room, Gulberg', products: ['Dune Lounge Chair', 'Arc Side Table'],
    layout: { left: 6, top: 2, w: 20, speed: 1.3, rotate: -2 },
    hotspots: [{ x: 42, y: 66, slug: 'dune-lounge-chair' }, { x: 74, y: 72, slug: 'arc-side-table' }],
  },
  {
    id: 'room-2', image: '/images/room-2.jpg', ratio: 1600 / 1000, shape: 'rect',
    name: 'Dining room, DHA', products: ['Qila Dining Table', 'Noor Dining Chair'],
    layout: { left: 64, top: 4, w: 28, speed: 0.7, rotate: 1.5 },
    hotspots: [{ x: 50, y: 62, slug: 'qila-dining-table' }, { x: 22, y: 64, slug: 'noor-dining-chair' }],
  },
  {
    id: 'room-3', image: '/images/room-3.jpg', ratio: 1, shape: 'rect',
    name: 'Bedroom, Model Town', products: ['Neend Platform Bed', 'Sirhana Nightstand'],
    layout: { left: 30, top: 16, w: 15, speed: 1.6, rotate: 2.5 },
    hotspots: [{ x: 50, y: 64, slug: 'neend-bed' }, { x: 84, y: 62, slug: 'sirhana-nightstand' }],
  },
  {
    id: 'room-4', image: '/images/room-4.jpg', ratio: 1200 / 1500, shape: 'arch',
    name: 'Study, Cantt', products: ['Kalam Writing Desk', 'Kursi Desk Chair'],
    layout: { left: 78, top: 30, w: 17, speed: 1.1, rotate: -1.5 },
    hotspots: [{ x: 48, y: 64, slug: 'kalam-writing-desk' }, { x: 36, y: 78, slug: 'kursi-desk-chair' }],
  },
  {
    id: 'room-5', image: '/images/room-5.jpg', ratio: 1600 / 1000, shape: 'rect',
    name: 'Reading nook, Bahria', products: ['Sehan Cane Bench', 'Diya Table Lamp'],
    layout: { left: 2, top: 36, w: 26, speed: 0.8, rotate: 1 },
    hotspots: [{ x: 46, y: 70, slug: 'sehan-cane-bench' }, { x: 80, y: 44, slug: 'diya-table-lamp' }],
  },
  {
    id: 'room-6', image: '/images/room-6.jpg', ratio: 1200 / 1500, shape: 'arch',
    name: 'Entrance, Defence', products: ['Chaand Console', 'Surma Mirror'],
    layout: { left: 56, top: 50, w: 14, speed: 1.45, rotate: -3 },
    hotspots: [{ x: 50, y: 70, slug: 'chaand-console' }, { x: 50, y: 32, slug: 'surma-mirror' }],
  },
  {
    id: 'room-7', image: '/images/room-7.jpg', ratio: 1600 / 1000, shape: 'rect',
    name: 'Terrace at dusk, Islamabad', products: ['Veranda Lounger', 'Fanoos Pendant'],
    layout: { left: 22, top: 66, w: 27, speed: 0.55, rotate: -1 },
    hotspots: [{ x: 40, y: 66, slug: 'veranda-lounger' }, { x: 72, y: 20, slug: 'fanoos-pendant' }],
  },
  {
    id: 'room-8', image: '/images/room-8.jpg', ratio: 1, shape: 'rect',
    name: "Kids' corner, Johar Town", products: ['Kitab Low Shelf', 'Lori Cot'],
    layout: { left: 72, top: 70, w: 18, speed: 1.25, rotate: 2 },
    hotspots: [{ x: 30, y: 66, slug: 'kitab-low-shelf' }, { x: 70, y: 58, slug: 'lori-cot' }],
  },
  {
    id: 'room-9', image: '/images/room-9.jpg', ratio: 1600 / 1000, shape: 'rect',
    name: 'Living room at night, Clifton', products: ['Halo Floor Lamp', 'Dune Three-Seat Sofa'],
    layout: { left: 44, top: 84, w: 24, speed: 0.95, rotate: 1.2 },
    hotspots: [{ x: 76, y: 40, slug: 'halo-floor-lamp' }, { x: 42, y: 70, slug: 'dune-sofa' }],
  },
];

export const day = [
  {
    id: 'morning', time: '07:00', label: 'Morning', image: '/images/day-morning.jpg', shape: 'arch',
    title: 'The first light', italic: 'finds the bench',
    story: 'Before anyone else is up, the cane bench by the window holds a cup of chai and a book you started last winter.',
    links: ['sehan-cane-bench', 'diya-table-lamp'],
    bg: '#E9DFD8', fg: '#2A1D15',
  },
  {
    id: 'study', time: '11:00', label: 'Study', image: '/images/day-study.jpg', shape: 'rect',
    title: 'Work, with', italic: 'the window open',
    story: 'White oak in hard daylight. Two drawers for the bills, a brass pull that has learned the shape of your hand.',
    links: ['kalam-writing-desk', 'kursi-desk-chair'],
    bg: '#F1EBE2', fg: '#2A1D15',
  },
  {
    id: 'lunch', time: '14:00', label: 'Lunch', image: '/images/day-lunch.jpg', shape: 'rect',
    title: 'Lunch runs', italic: 'long again',
    story: 'Amber sun across sheesham. Somebody pulls up one more chair, and the table, as it was built to, makes room.',
    links: ['qila-dining-table', 'noor-dining-chair'],
    bg: '#E8C99A', fg: '#2A1D15',
  },
  {
    id: 'evening', time: '19:00', label: 'Evening', image: '/images/day-evening.jpg', shape: 'rect',
    title: 'The room turns', italic: 'rose',
    story: 'Dusk comes in pink over the sofa. Feet go up on the coffee table, which is exactly what its rounded edge is for.',
    links: ['dune-sofa', 'chabutra-coffee-table'],
    bg: '#D9A99B', fg: '#2A1D15',
  },
  {
    id: 'night', time: '23:00', label: 'Night', image: '/images/day-night.jpg', shape: 'arch',
    title: 'One lamp,', italic: 'then none',
    story: 'A low walnut bed, a lamp at pillow height, the house finally still. Good furniture is quiet in the dark.',
    links: ['neend-bed', 'sirhana-nightstand'],
    bg: '#1B1612', fg: '#EFE9E1',
  },
];
