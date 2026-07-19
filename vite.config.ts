import { defineConfig } from 'vite';

/**
 * The GitHub repository name. When the site is published at
 * https://<user>.github.io/<REPO_NAME>/ the app must be served from the
 * matching sub-path. Change this single constant if you rename the repo.
 */
const REPO_NAME = 'juego-live';

// When running locally (dev/preview) we serve from root; on GitHub Pages
// (or any CI build) we serve from the repository sub-path.
const isCI = process.env.GITHUB_ACTIONS === 'true' || process.env.CI === 'true';

export default defineConfig({
  base: isCI ? `/${REPO_NAME}/` : '/',
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
  server: {
    host: true,
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
