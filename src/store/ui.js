import { create } from 'zustand';

export const useUI = create((set) => ({
  introDone: false,
  menuOpen: false,
  cartOpen: false,
  doorsClosed: false,
  filmPlaying: false,
  filmActive: false,
  soundOn: false,
  cartBump: 0,
  sheet: null, // { slug, from: Element }
  setIntroDone: () => set({ introDone: true }),
  setMenu: (menuOpen) => set({ menuOpen }),
  setCart: (cartOpen) => set({ cartOpen }),
  setDoors: (doorsClosed) => set({ doorsClosed }),
  setFilm: (o) => set(o),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  bumpCart: () => set((s) => ({ cartBump: s.cartBump + 1 })),
  openSheet: (slug, from = null) => set({ sheet: { slug, from } }),
  closeSheet: () => set({ sheet: null }),
}));
