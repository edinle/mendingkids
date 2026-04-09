import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use an absolute base path so production assets resolve correctly
  // even when loaded from test tools that append path segments.
  base: '/',
})
