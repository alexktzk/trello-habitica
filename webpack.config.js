const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env) => {
  return {
    entry : {
      index: './src/js/index.js',
      settings: './src/js/settings.js',
      'edit-task': './src/js/edit-task.js',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].bundle.[contenthash].js',
    },
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 8080
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        }
      ]
    },
    plugins: ['index', 'settings', 'edit-task'].map(chunk => {
      return new HtmlWebpackPlugin({
        filename: `${chunk}.html`,
        template: `./src/${chunk}.html`,
        chunks: [chunk],
        cache: true
      })
    })
  }
}
