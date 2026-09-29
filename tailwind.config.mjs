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
      },
    },
  },
  plugins: [],
};
