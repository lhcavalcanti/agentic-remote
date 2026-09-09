import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const require = createRequire(`${root}/package.json`)
const { defineConfig } = await import(require.resolve('vitest/config'))
export default defineConfig({
  root,
  define: { __APP_VERSION__: '"1.1.0"', __APP_BUILD_ID__: '"1.1.0"' },
  resolve: {
    alias: [
      { find: /^react$/, replacement: require.resolve('react') },
      { find: /^react\/jsx-runtime$/, replacement: require.resolve('react/jsx-runtime') },
      { find: /^react\/jsx-dev-runtime$/, replacement: require.resolve('react/jsx-dev-runtime') },
      { find: /^@testing-library\/react$/, replacement: require.resolve('@testing-library/react') },
      { find: /^@testing-library\/jest-dom\/vitest$/, replacement: `${root}/node_modules/@testing-library/jest-dom/dist/vitest.mjs` },
      { find: /^vitest$/, replacement: `${root}/node_modules/vitest/dist/index.js` },
    ],
  },
  test: {
    environment: 'jsdom',
    env: { NODE_ENV: 'development' },
    fileParallelism: false,
    include: ['docs/reviews/2026-09-09/reproduce-ui-findings.tsx'],
  },
})
