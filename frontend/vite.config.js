import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Konfigurasi final agar cocok dengan Vercel
export default defineConfig({
  plugins: [react()],
  // base './' agar asset path tidak hilang saat deploy
  base: './',
  build: {
    outDir: 'dist',   // folder hasil build
    emptyOutDir: true // hapus isi dist sebelum build ulang
  },
  server: {
    port: 5173,       // default Vite dev port
    host: true
  }
})
