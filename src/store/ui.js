import { create } from 'zustand';

// Sound is on unless the visitor turned it off before (remembered per browser).
const savedSound = () => {
  try {
    return localStorage.getItem('taaq-sound') !== 'off';
  } catch {
    return true;
  }
};

export const useUI = create((set) => ({
  introDone: false,
  menuOpen: false,
  cartOpen: false,
  doorsClosed: false,
  filmPlaying: false,
  filmActive: false,
  soundOn: savedSound(),
  cartBump: 0,
  sheet: null, // { slug, from: Element }
  setIntroDone: () => set({ introDone: true }),
  setMenu: (menuOpen) => set({ menuOpen }),
  setCart: (cartOpen) => set({ cartOpen }),
  setDoors: (doorsClosed) => set({ doorsClosed }),
  setFilm: (o) => set(o),
  toggleSound: () =>
    set((s) => {
      try {
        localStorage.setItem('taaq-sound', s.soundOn ? 'off' : 'on');
      } catch {
        /* private mode */
      }
      return { soundOn: !s.soundOn };
    }),
  bumpCart: () => set((s) => ({ cartBump: s.cartBump + 1 })),
  openSheet: (slug, from = null) => set({ sheet: { slug, from } }),
  closeSheet: () => set({ sheet: null }),
}));
