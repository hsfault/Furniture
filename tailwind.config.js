/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1600px' },
    extend: {
      colors: {
        plaster: '#EFE9E1',
        linen: '#F7F3EE',
        espresso: '#2A1D15',
        walnut: '#5A3A25',
        taupe: '#6E6256', // deepened from #8F8073 so small text reads (4.9:1 on plaster)
        sage: '#8C9A7E',
        clay: '#C2693E',
        brass: '#B8935A',
        'brass-ink': '#7F6131', // brass for text on light grounds (4.8:1)
        'sage-ink': '#5C6B4F', // sage for text on light grounds
        night: '#1B1612',
        teal: '#1F4E5A',
        oxblood: '#5E1F1F',
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'Didot', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        hand: ['Caveat', 'cursive'],
      },
      fontSize: {
        hero: ['clamp(3.4rem, 9vw, 10rem)', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        section: ['clamp(2.4rem, 6vw, 6.5rem)', { lineHeight: '0.95', letterSpacing: '-0.025em' }],
        label: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.14em' }],
      },
      borderRadius: { arch: '999px 999px 0 0' },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
        inout4: 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
      boxShadow: {
        niche: 'inset 0 18px 30px -12px rgba(42,29,21,.35), inset 0 0 0 1px rgba(184,147,90,.25)',
        drawer: '0 30px 60px -20px rgba(27,22,18,.55)',
      },
    },
  },
  plugins: [],
};
