// Shared between <GLImage> (DOM side) and <GLImageLayer> (canvas side).
const items = new Map();
const listeners = new Set();
let uid = 0;

export const nextId = () => `gl-${++uid}`;

export function register(item) {
  items.set(item.id, item);
  listeners.forEach((fn) => fn());
  return () => {
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
