// import { fileURLToPath, URL } from 'node:url'
//
// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'
// import path from 'path'
//
// // https://vite.dev/config/
// export default defineConfig({
//   server: {
//     proxy: {
//       '/api': {
//         target: 'http://127.0.0.1:8000',
//         changeOrigin: true,
//       },
//       '/ws': {
//         target: 'ws://127.0.0.1:8000',
//         ws: true,
//         changeOrigin: true,
//       },
//     },
//   },
//   plugins: [
//     vue(),
//     vueDevTools(),
//   ],
//   resolve: {
//     // alias: {
//     //   '@': fileURLToPath(new URL('./src', import.meta.url))
//     // },
//     alias: { "@": path.resolve(__dirname, './src'), }
//   },
// })
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'path'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})