// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [mdx()],

  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Rocky AOE',
      cssVariable: '--font-rocky-aoe',
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/ROCKYAOE.ttf'],
            weight: 'normal',
            style: 'normal',
          },
        ],
      },
    },
  ],
});
