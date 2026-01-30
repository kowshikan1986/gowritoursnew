import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const extraHosts = (env.VITE_ALLOWED_HOSTS || '')
    .split(',')
    .map(h => h.trim())
    .filter(Boolean)

  return {
    plugins: [react()],
    publicDir: 'public', // Copy public folder to dist on build
    server: {
      host: true,
      port: 4000,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5002',
          changeOrigin: true,
        },
      },
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        'gowritoursjava-main-6c0a179.kuberns.cloud',
        'gowritoursjava-main-83a2c51.kuberns.cloud',
        ...extraHosts,
      ],
    },
    build: {
      chunkSizeWarningLimit: 1500,
      // Production optimizations
      minify: 'terser', // Use terser for better minification
      sourcemap: false, // Disable source maps in production
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@heroicons/react', 'framer-motion', 'styled-components']
          }
        }
      },
      terserOptions: {
        compress: {
          drop_console: true, // Remove console logs in production
          drop_debugger: true
        }
      }
    },
  }
})
