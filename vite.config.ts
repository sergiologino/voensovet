import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Исправляем проблему когда NODE_ENV=production установлен глобально
  // Vite использует mode для определения режима, но React может использовать NODE_ENV
  define: {
    // Используем mode из Vite вместо глобального NODE_ENV
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development')
  }
}))
