import { esbuildPlugin } from '@web/dev-server-esbuild'

export default {
  files: [
    '**/*.test.ts',
    '**/*.test.html',
    '!**/*.html.ts',
    '!node_modules/',
  ],
  plugins: [ esbuildPlugin({ ts: true }) ],
}
