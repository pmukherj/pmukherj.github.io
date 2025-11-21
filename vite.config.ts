import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Use '/' if this is your main GitHub Pages repo, or '/pmukherj.github.io/' if it's a project page
})
