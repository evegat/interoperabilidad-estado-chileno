import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: process.env.ASTRO_SITE || 'https://evegat.github.io',
  base: process.env.ASTRO_BASE || (process.env.GITHUB_PAGES ? '/interoperabilidad-estado-chileno' : '/'),
  integrations: [tailwind()],
  build: {
    format: 'directory',
  },
});
