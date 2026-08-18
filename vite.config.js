import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 🔥 Configuración para evitar binarios nativos
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      external: [],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-icons')) return 'icons';
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'charts';
            if (id.includes('bootstrap')) return 'bootstrap';
            return 'vendor';
          }
        }
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