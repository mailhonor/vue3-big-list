const path = require('path')
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [
    cssInjectedByJsPlugin(),
    vue(),
  ],
  root: './',
  build: {
    emptyOutDir: true,
    rollupOptions: {
      external: ['vue', "mousetrap"],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    lib: {
      entry: [
        path.resolve(__dirname, 'src/index.ts'),
      ],
      fileName: "index",
      formats: ["es"],
    },
    outDir: "./dist/",
  },
});
