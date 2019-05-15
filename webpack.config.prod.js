const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => {
  return {
    mode: 'production',
    entry: {
      index: './src/js/index.js',
      settings: './src/js/settings.js',
      login: './src/js/login.js',
      'edit-task': './src/js/edit-task.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].bundle.[contenthash].js'
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
    plugins: ['index', 'settings', 'edit-task', 'login'].map(chunk => {
      return new HtmlWebpackPlugin({
        filename: `${chunk}.html`,
        template: `./src/${chunk}.html`,
        chunks: [chunk],
        cache: true
      });
    })
  };
};
