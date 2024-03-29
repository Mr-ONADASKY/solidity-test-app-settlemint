const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PORT = process.env.PORT || 5000
const HOST = process.env.YOUR_HOST || '0.0.0.0';

module.exports = {
  entry: './app/javascripts/app.js',
  devServer: {
    inline:true,
    port: PORT,
    host: HOST,
    disableHostCheck: true,
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.js'
  },
  plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './app/index.html', to: "index.html" }
    ])
  ],
  module: {
    rules: [
      {
       test: /\.css$/,
       use: [ 'style-loader', 'css-loader' ]
      }
    ],
    loaders: [
      { test: /\.json$/, use: 'json-loader' },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      }
    ]
  }
}
