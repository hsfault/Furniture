import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { bySlug } from '../data/products.js';
import { woods, fabrics } from '../data/brand.js';

const woodDelta = (id) => woods.find((w) => w.id === id)?.delta ?? 0;
const fabricDelta = (id) => fabrics.find((f) => f.id === id)?.delta ?? 0;
export const WIDE_DELTA = 48000;

// Price of a product in a given configuration. The list price is for the
// product's first wood and fabric; other choices add their difference.
export function priceFor(product, { wood, fabric, size } = {}) {
  let price = product.price;
  if (wood) price += woodDelta(wood) - woodDelta(product.woods[0]);
  if (fabric && product.fabrics.length) price += fabricDelta(fabric) - fabricDelta(product.fabrics[0]);
  if (size === 'wide') price += WIDE_DELTA;
  return price;
}

export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      add(slug, opts = {}) {
        const product = bySlug[slug];
        if (!product) return;
        const wood = opts.wood || product.woods[0];
        const fabric = opts.fabric || product.fabrics[0] || null;
        const size = opts.size || null;
        const key = [slug, wood, fabric, size].join('|');
        const qty = opts.qty || 1;
        const existing = get().items.find((i) => i.key === key);
        if (existing) {
          set({ items: get().items.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i)) });
        } else {
          set({
            items: [
              ...get().items,
              {
                key, slug, wood, fabric, size, qty,
                name: product.name,
                image: opts.image && !opts.image.startsWith('data:') ? opts.image : product.image,
                price: priceFor(product, { wood, fabric, size }),
              },
            ],
          });
        }
      },
      setQty: (key, qty) => set({ items: get().items.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)) }),
      remove: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
      clear: () => set({ items: [] }),
    }),
    { name: 'taaq-cart' },
  ),
);

export const cartCount = (s) => s.items.reduce((n, i) => n + i.qty, 0);
export const cartSubtotal = (s) => s.items.reduce((n, i) => n + i.qty * i.price, 0);
