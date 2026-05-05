import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/resume_portfolio/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2015',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        home: resolve(__dirname, 'home.html'),
        intro: resolve(__dirname, 'intro.html'),
        works: resolve(__dirname, 'works.html'),
        'works-projects': resolve(__dirname, 'works/works-projects.html'),
        'works-games': resolve(__dirname, 'works/works-games.html'),
        'works-web': resolve(__dirname, 'works/works-web.html'),
        'works-design': resolve(__dirname, 'works/works-design.html'),
        'works-honors': resolve(__dirname, 'works/works-honors.html'),
      },
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
  },
});