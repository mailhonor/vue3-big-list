import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [
    cssInjectedByJsPlugin(),
    vue(),
  ],
  publicDir: "demo",
  root: 'demo',
  base: "demo",
  build: {
    rollupOptions: {
      input: {
        main: './demo/index.html',
      },
    },
    emptyOutDir: true,
    outDir: './demo_dist'
  },
  server: {
    host: false,
    port: 3000,
  },
});
