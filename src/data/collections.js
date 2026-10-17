import { bySlug } from './products.js';

// cloth: spine/cover colour. ink: text colour on that cloth.
const cloths = {
  walnut: { cloth: '#5A3A25', ink: '#F1E4CF' },
  sage: { cloth: '#7F8C70', ink: '#F4EFE6' },
  clay: { cloth: '#B05C35', ink: '#FBEFE3' },
  linen: { cloth: '#E3D7C3', ink: '#2A1D15' },
  espresso: { cloth: '#2E2019', ink: '#E6CFA6' },
  teal: { cloth: '#1F4E5A', ink: '#EAD9B8' },
  oxblood: { cloth: '#5E1F1F', ink: '#EBD5B0' },
};

const c = (o) => ({ ...cloths[o.clothName], image: `/images/collection-${o.id}.jpg`, ...o });

export const collections = [
  c({
    id: 'living', number: '01', name: 'Living', clothName: 'walnut', height: 316, thickness: 58,
    line: 'Low, deep seats and tables at the height of a cup of tea.',
    essay: 'A living room is where furniture is asked to be patient. People fall asleep on it, children build forts out of it, guests stay later than they meant to. We make these pieces heavy and low so they hold a room still, and soft enough that nobody minds staying.',
    pieces: ['dune-lounge-chair', 'dune-sofa', 'jharoka-armchair', 'chabutra-coffee-table', 'arc-side-table', 'halo-floor-lamp'],
  }),
  c({
    id: 'dining', number: '02', name: 'Dining', clothName: 'sage', height: 298, thickness: 52,
    line: 'A long table, enough chairs, and room for one more.',
    essay: 'Our dining tables are made for the second helping and the third cup of chai. Sheesham that has been air-dried for eighteen months, trestles you can see and understand, cane chair backs that let a long evening breathe.',
    pieces: ['qila-dining-table', 'noor-dining-chair', 'rasta-sideboard', 'fanoos-pendant', 'thaal-tray', 'matka-vase'],
  }),
  c({
    id: 'bedroom', number: '03', name: 'Bedroom', clothName: 'linen', height: 322, thickness: 62,
    line: 'Quiet pieces for the first and last hour of the day.',
    essay: 'Nothing in a bedroom should squeak, catch or shout. So the drawers run on waxed wood, the bed is low enough to sit on to put on your shoes, and the chest closes slowly on its own. The quietest room in the house deserves the most careful joinery.',
    pieces: ['neend-bed', 'sirhana-nightstand', 'almari-wardrobe', 'sandook-chest', 'diya-table-lamp', 'surma-mirror'],
  }),
  c({
    id: 'study', number: '04', name: 'Study', clothName: 'teal', height: 304, thickness: 50,
    line: 'A desk, a chair, and somewhere for the books to wait.',
    essay: 'A desk should make you want to sit down at it. White oak because it is pale and calm in the morning; brass pulls because they warm to the hand; a bookcase of arched niches because the books you love deserve a small room of their own.',
    pieces: ['kalam-writing-desk', 'kursi-desk-chair', 'taaq-bookcase', 'dune-lounge-chair', 'arc-side-table', 'ravi-stool'],
  }),
  c({
    id: 'outdoor-cane', number: '05', name: 'Outdoor & Cane', clothName: 'clay', height: 292, thickness: 54,
    line: 'Woven by hand, made for courtyards and long June evenings.',
    essay: 'Cane is how this part of the world stayed cool before electricity. Bashir weaves it wet, straight onto the frame, so it pulls tight as it dries and stays tight for decades. Put it on a veranda; it likes the air.',
    pieces: ['charpai-daybed', 'veranda-lounger', 'sehan-cane-bench', 'noor-dining-chair', 'rasta-sideboard', 'fanoos-pendant'],
  }),
  c({
    id: 'lighting', number: '06', name: 'Lighting', clothName: 'espresso', height: 286, thickness: 46,
    line: 'Small, warm lights at the height people actually live.',
    essay: 'We design lamps for evenings, not for showrooms: low, warm, at reading height or below. Brass that ages where it is touched, linen that softens the bulb, cane that throws a pattern on the ceiling. Light is the last piece of furniture you add and the first you notice.',
    pieces: ['halo-floor-lamp', 'diya-table-lamp', 'fanoos-pendant', 'shamaa-sconce', 'surma-mirror', 'matka-vase'],
  }),
  c({
    id: 'objects', number: '07', name: 'Objects', clothName: 'oxblood', height: 296, thickness: 48,
    line: 'Things that are handled every day and get better for it.',
    essay: 'A tray turned from the offcuts of a dining table. A water pot from a potter in Gujrat. A brass mirror that darkens where hands touch it. Small things carry a house; they are the ones you pick up.',
    pieces: ['thaal-tray', 'matka-vase', 'surma-mirror', 'chaand-console', 'shamaa-sconce', 'diya-table-lamp'],
  }),
  c({
    id: 'kids', number: '08', name: "Kids' Corner", clothName: 'sage', height: 288, thickness: 52,
    line: 'Rounded corners, honest wood, made to be handed down.',
    essay: 'Children are the hardest test a piece of furniture will ever face. Every corner here is rounded to twelve millimetres, every finish is food-safe oil, and every piece is built to survive one childhood and then be passed, scuffed and loved, to the next.',
    pieces: ['lori-cot', 'kitab-low-shelf', 'ravi-stool', 'sandook-chest', 'diya-table-lamp', 'arc-side-table'],
  }),
];

export function collectionStats(col) {
  const items = col.pieces.map((s) => bySlug[s]).filter(Boolean);
  const woodSet = new Set(items.flatMap((x) => x.woods));
  return {
    items,
    count: items.length * 2,
    woods: [...woodSet],
    from: Math.min(...items.map((x) => x.price)),
  };
}
