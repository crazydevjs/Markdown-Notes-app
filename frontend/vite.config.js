import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite Configuration
 *
 * The proxy setting is key for development:
 *   Any request from the frontend to /api/* is automatically forwarded
 *   to http://localhost:5000/api/* — so we don't need to configure CORS
 *   during local development (no cross-origin issues).
 *
 * In production (Vercel), we set VITE_API_URL instead,
 * and axios uses that URL directly. The proxy is dev-only.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // rewrite: (path) => path — no rewrite needed, paths match
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable in production for smaller bundles
  },
});
