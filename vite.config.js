import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true, // 自动打开浏览器
    proxy: {
      '/api': {
        target: 'http://localhost:8081',  // 后端服务器地址
        changeOrigin: true,
        secure: false,
        logLevel: 'debug' // 启用代理日志
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
})