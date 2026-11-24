// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://ynkotp-webdev.github.io',
  // Демо живе на GitHub Pages у підпапці репозиторію. Внутрішні посилання йдуть через to() з src/data/salon.ts
  base: '/Atmosfera-beauty-lounge',
  vite: {
    plugins: [tailwindcss()]
  }
});
