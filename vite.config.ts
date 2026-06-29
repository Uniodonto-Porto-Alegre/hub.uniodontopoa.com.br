import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
        },
      },
    },
    server: env.VITE_BACKEND_URL
      ? {
          proxy: {
            '/api': {
              target: env.VITE_BACKEND_URL,
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,
  }
})
