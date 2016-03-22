var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: [
    './src/js/index.js'
  ],
  output: {
    path: path.join(__dirname, 'public', 'js'),
    filename: 'bundle.js',
    publicPath: '/public/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
        include: __dirname
      }
    ]
  }
}