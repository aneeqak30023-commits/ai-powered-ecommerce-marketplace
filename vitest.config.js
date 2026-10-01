import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    // Setting `exclude` replaces Vitest's defaults, so they are restated here
    // and the Kilo Code agent worktrees are added. Those directories hold stale
    // checkouts of the project; without this their duplicate copies of the test
    // suite get collected and run alongside the real ones.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      '**/.kilo/worktrees/**',
    ],
  },
})
