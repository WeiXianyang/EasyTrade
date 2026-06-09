import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'es-toolkit/compat/get': fileURLToPath(new URL('./src/vendor/es-toolkit-compat/get.js', import.meta.url)),
      'es-toolkit/compat/range': fileURLToPath(new URL('./src/vendor/es-toolkit-compat/range.js', import.meta.url)),
      'es-toolkit/compat/sortBy': fileURLToPath(new URL('./src/vendor/es-toolkit-compat/sortBy.js', import.meta.url)),
      'es-toolkit/compat/isPlainObject': fileURLToPath(new URL('./src/vendor/es-toolkit-compat/isPlainObject.js', import.meta.url)),
      'es-toolkit/compat/throttle': fileURLToPath(new URL('./src/vendor/es-toolkit-compat/throttle.js', import.meta.url)),
      'es-toolkit/compat/omit': fileURLToPath(new URL('./src/vendor/es-toolkit-compat/omit.js', import.meta.url)),
      'es-toolkit/compat/maxBy': fileURLToPath(new URL('./src/vendor/es-toolkit-compat/maxBy.js', import.meta.url)),
      'es-toolkit/compat/sumBy': fileURLToPath(new URL('./src/vendor/es-toolkit-compat/sumBy.js', import.meta.url)),
      'es-toolkit/compat/last': fileURLToPath(new URL('./src/vendor/es-toolkit-compat/last.js', import.meta.url)),
      'es-toolkit/compat/minBy': fileURLToPath(new URL('./src/vendor/es-toolkit-compat/minBy.js', import.meta.url)),
      'es-toolkit/compat/uniqBy': fileURLToPath(new URL('./src/vendor/es-toolkit-compat/uniqBy.js', import.meta.url)),
    },
  },

  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],

  // 继续预构建 Recharts，但把 compat 子路径重定向到稳定的 ESM 适配层
  optimizeDeps: {
    include: ['recharts'],
  },

  server: {
    // 开发环境代理：将 /api 请求转发到后端服务，解决跨域问题
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // 替换为实际后端地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  build: {
    // 开启代码分割，配合 React.lazy 实现路由级按需加载
    rollupOptions: {
      output: {
        // manualChunks 使用函数形式兼容 rolldown
        manualChunks(id) {
          if (id.includes('node_modules/antd') || id.includes('node_modules/@ant-design')) {
            return 'antd';
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'recharts';
          }
        },
      },
    },
  },
})

