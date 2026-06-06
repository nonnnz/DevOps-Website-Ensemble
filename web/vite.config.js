import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  // three / threlte are large client-only deps; let Vite pre-bundle them on demand.
  ssr: {
    noExternal: ['three', '@threlte/core', '@threlte/extras']
  }
});
