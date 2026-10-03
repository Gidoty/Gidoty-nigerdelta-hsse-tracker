import { defineConfig } from 'vitest/config'

// Separate from vite.config.js on purpose: that file's build-time
// execSync(git) call and outDir='../' are for the app build, not for
// running unit tests, which only exercise plain-JS logic (calculator,
// canonicalization, hashing, storage) — no DOM or React rendering needed.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
