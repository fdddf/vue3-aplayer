import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const r = (path) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig(({ command, mode }) => {
  // `vite` (dev server) and `vite build --mode demo` work on the demo page
  if (command === 'serve' || mode === 'demo') {
    return {
      root: r('./src/demo'),
      base: './',
      plugins: [vue()],
      server: {
        host: true,
        port: 3000,
      },
      build: {
        outDir: r('./demo'),
        emptyOutDir: true,
        // hls.js is bundled into the demo page
        chunkSizeWarningLimit: 1000,
      },
    }
  }

  // `vite build` builds the library
  return {
    plugins: [vue()],
    build: {
      lib: {
        entry: r('./src/index.js'),
        name: 'VueAPlayer',
        formats: ['es', 'umd'],
        fileName: (format) => (format === 'es' ? 'vue3-aplayer.mjs' : 'vue3-aplayer.umd.js'),
        cssFileName: 'vue3-aplayer',
      },
      rolldownOptions: {
        external: ['vue'],
        output: {
          exports: 'default',
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
  }
})
