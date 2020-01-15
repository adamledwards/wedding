module.exports = {
  entry: {
    index: __dirname + '/src/assets/js/index.ts',
    admin: __dirname + '/src/assets/js/admin.ts',
    table: __dirname + '/src/assets/js/table.ts',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/src/wedding/invite/static/js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
}
