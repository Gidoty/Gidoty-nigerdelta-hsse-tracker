import { execSync } from 'node:child_process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import pkg from './package.json' with { type: 'json' }

function getBuildCommitSha() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

// Vite content-hashes every emitted file, so the service worker can't
// hardcode which assets to precache for a first offline launch. This
// plugin writes the actual list of emitted files (from Rollup's bundle,
// the ground truth for what a build produced) to precache-manifest.json
// next to index.html, which sw.js fetches at install time.
function precacheManifestPlugin() {
  return {
    name: 'hsse-precache-manifest',
    generateBundle(_options, bundle) {
      const assets = Object.keys(bundle).filter((name) => !name.endsWith('.map'))
      this.emitFile({
        type: 'asset',
        fileName: 'precache-manifest.json',
        source: JSON.stringify({ assets, generatedAt: new Date().toISOString() }, null, 2),
      })
    },
  }
}

// This project's source lives at nigerdelta-hsse-tracker/app/, one level below
// the path it's actually served from (nigerdelta-hsse-tracker/, in the
// gidoty.github.io GitHub Pages user site — that repo serves whatever's on
// `main` directly, with no build step of its own). `npm run build` here
// outputs straight to the parent directory (`../`, i.e.
// nigerdelta-hsse-tracker/) so the compiled site is what's committed and
// served at gidoty.github.io/nigerdelta-hsse-tracker/, while this app/
// folder stays the editable source. emptyOutDir is off because outDir is a
// parent of this project root — a normal empty-and-rebuild would delete
// app/ itself.
export default defineConfig({
  base: '/nigerdelta-hsse-tracker/',
  plugins: [react(), precacheManifestPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_COMMIT__: JSON.stringify(getBuildCommitSha()),
  },
  build: {
    outDir: '../',
    emptyOutDir: false,
  },
})
