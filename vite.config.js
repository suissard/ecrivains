import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/n8n-proxy': {
        target: 'https://n8n.clavier.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/n8n-proxy/, '')
      }
    }
  }
})
