import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    imagetools({
      // imagetools는 쿼리 파라미터가 있을 때만 동작하도록 설정
      // 기본 import는 일반 URL로 처리됨
      exclude: /\.(webp)$/i, // WebP는 imagetools 처리에서 제외
      defaultDirectives: new URLSearchParams({
        format: 'webp',
        quality: '80',
        w: '0;640;828;1200;1920',
        as: 'picture'
      })
    })
  ],
  server: {
    port: 3000 
  },
  build: {
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          // React 코어
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // HTTP 클라이언트
          axios: ['axios'],
          // Chart 라이브러리 (용량이 크므로 분리)
          charts: ['chart.js', 'react-chartjs-2', 'chartjs-adapter-date-fns', 'date-fns'],
          // UI 라이브러리
          ui: ['styled-components', 'qrcode.react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
