import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 🔥 Configuración para evitar binarios nativos
  build: {
    target: 'esnext',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  server: {
    force: true
  },
  // 🔥 Usar el módulo runner en lugar de bundler
  configLoader: 'runner',
  // 🔥 Forzar el uso de esbuild en modo nativo
  resolve: {
    alias: {
      'esbuild': 'esbuild-wasm'
    }
  }
})