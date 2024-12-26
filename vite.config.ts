import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state-vendor': ['zustand', 'react-query'],
          'ui-vendor': ['lucide-react'],
          'terminal-vendor': ['xterm', 'xterm-addon-fit']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'zustand', 
      'react-query', 
      'lucide-react',
      'xterm',
      'xterm-addon-fit',
      '@webcontainer/api'
    ]
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true
  }
});
