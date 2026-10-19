// Shared between <GLImage> (DOM side) and <GLImageLayer> (canvas side).
const items = new Map();
const listeners = new Set();
let uid = 0;

export const nextId = () => `gl-${++uid}`;

// One IntersectionObserver marks which pictures are within ~a viewport, so
// the layer only measures and draws those.
let io = null;
function observer() {
  if (!io && typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        const it = e.target.__glItem;
        if (it) it.near = e.isIntersecting;
      }),
      { rootMargin: '60% 0px 60% 0px' },
    );
  }
  return io;
}

export const anyNear = () => {
  for (const it of items.values()) if (it.near) return true;
  return false;
};

export function register(item) {
  item.near = !observer();
  if (item.el) {
    item.el.__glItem = item;
    observer()?.observe(item.el);
  }
  items.set(item.id, item);
  listeners.forEach((fn) => fn());
  return () => {
    if (item.el) {
      io?.unobserve(item.el);
      delete item.el.__glItem;
    }
    items.delete(item.id);
    listeners.forEach((fn) => fn());
  };
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const getItems = () => [...items.values()];

// Global spring-smoothed scroll velocity, written by the layer every frame.
export const glState = { velocity: 0, spring: 0 };
