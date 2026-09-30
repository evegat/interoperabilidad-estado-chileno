/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        gob: {
          blue: '#0f265c',
          red: '#ea3433',
        },
        brand: {
          deep: '#0a2f2b',
          'deep-2': '#12483f',
          ink: '#13201e',
          paper: '#f7f5ef',
          surface: '#ffffff',
          soft: '#e9efec',
          line: '#ccd7d2',
          muted: '#5d6b68',
          accent: '#d7653b',
          'accent-soft': '#f4dfd5',
          'accent-hover': '#c95631',
          mint: '#54b995',
          gold: '#c5a75a',
        },
      },
    },
  },
  plugins: [],
};
