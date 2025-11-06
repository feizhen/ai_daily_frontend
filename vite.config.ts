import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Vite configuration for production build
export default defineConfig({
  plugins: [react()],

  // 开发服务器配置
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://aidailybackend-production.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        timeout: 30000, // 30 秒超时
      },
    },
  },

  // 生产构建优化
  build: {
    outDir: 'dist',
    sourcemap: true,
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    // chunk大小警告限制
    chunkSizeWarningLimit: 1000,
  },
})

