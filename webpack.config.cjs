const path = require('path')
const Dotenv = require('dotenv-webpack')

module.exports = {
  entry: {
    index: './browser_src/index/index.ts',
  },
  mode: 'production',
  stats: 'minimal',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  plugins: [
    new Dotenv(),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, './public'),
  },
}
