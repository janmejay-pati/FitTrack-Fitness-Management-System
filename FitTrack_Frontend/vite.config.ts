import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:44365',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/Users': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
      '/Auth': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
      '/Dashboard': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
      '/DashboardApi': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
      '/WorkoutsApi': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
      '/MealsApi': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
      '/BMIApi': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
      '/WaterApi': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
      '/GoalsApi': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
      '/AchievementsApi': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
      '/PlansApi': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
      '/TutorialsApi': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
      '/NotificationsApi': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
      '/Profile': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
      '/AdminApi': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
      '/Images': { target: 'https://localhost:44365', changeOrigin: true, secure: false },
    }
  }
})
