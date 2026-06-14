import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function normalizeViteBase(path = '/') {
  if (!path || path === '/') return '/'
  const value = `/${String(path).replace(/^\/+|\/+$/g, '')}/`
  return value
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const appBasePath = normalizeViteBase(env.VITE_APP_BASE_PATH || '/')
  const backendTarget = env.VITE_DEV_API_TARGET || 'http://localhost:8010'

  return {
    base: appBasePath,
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
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },

    build: {
      // 开启代码分割，配合 React.lazy 实现路由级按需加载
      rollupOptions: {
        input: {
          shop: resolve(__dirname, 'index.html'),
          admin: resolve(__dirname, 'admin.html'),
        },
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
  }
})
