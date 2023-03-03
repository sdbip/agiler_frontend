// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

const pages = [ 'stories-and-tasks', 'features' ]
const pageEntries = mapToObject(
  pages, {
  keyFn: p => p,
  valueFn: p => `./dist/browser_src/index/${p}.js`,
})

module.exports = {
  entry: pageEntries,
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

function mapToObject(array, { keyFn, valueFn }) {
   return array.reduce((agg, item) => ({
    ...agg,
    [keyFn(item)]: valueFn(item),
  }), {})
}
