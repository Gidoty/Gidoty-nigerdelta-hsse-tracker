// __APP_VERSION__ and __BUILD_COMMIT__ are injected at build time by
// vite.config.js's `define`, from package.json's version and the build's
// git commit SHA respectively. In dev (vite serve) these fall back to
// 'dev' since there's no discrete build commit for a running dev server.
export const APP_VERSION =
  typeof __APP_VERSION__ !== 'undefined' ? `${__APP_VERSION__}+${__BUILD_COMMIT__}` : 'dev'
