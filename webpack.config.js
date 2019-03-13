const path = require('path')
const webpack = require('webpack')

module.exports = (env) => {
  return {
    entry : {
      app: './src/js/index.js',
      settings: './src/js/settings-form.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].bundle.js',
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
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                "@babel/plugin-transform-runtime",
              ],
            }
          }
        }
      ]
    }
  }
}
