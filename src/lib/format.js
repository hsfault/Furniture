const nf = new Intl.NumberFormat('en-US');

export const formatPrice = (n) => `Rs ${nf.format(Math.round(n))}`;

export const formatDims = (d) => `W ${d.w} · D ${d.d} · H ${d.h} cm`;

export const pad2 = (n) => String(n).padStart(2, '0');

export const formatTimecode = (s) => `${pad2(Math.floor(s / 60))}:${pad2(Math.floor(s % 60))}`;

export const pxToCm = (px) => (px / 37.795).toFixed(1);

export function orderNumber() {
  const d = new Date();
  return `TQ-${String(d.getFullYear()).slice(2)}${pad2(d.getMonth() + 1)}-${Math.floor(1000 + Math.random() * 9000)}`;
}
