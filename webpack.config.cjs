// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

module.exports = {
  entry: {
    index: './dist/browser_src/index/index.js',
    features: './dist/browser_src/index/features.js',
  },
  mode: 'production',
  stats: 'minimal',
  module: {
    rules: [
      {
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, './dist/public'),
  },
}
