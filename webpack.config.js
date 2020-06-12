const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/client/main.ts',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, './dist/client'),
  },
  optimization: {
    runtimeChunk: {
      name: 'runtime',
    }
  },
  externals: {
    jquery: 'jQuery',
    vue: 'Vue',
    socketIO: 'socket.io-client',
    vuex: 'Vuex',
    Cookies: "js-cookie"
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.client.json',
          appendTsSuffixTo: [/\.vue$/]
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        test: /^((?!\.min).)*.css$/,
        loader: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.vue', '.css' ],
  },
  plugins: [
    new LiveReloadPlugin(),
    new VueLoaderPlugin(),
    new CopyPlugin({
      patterns: [
        { context: './src/client', from: '**/*.html', to: '.' },
        { context: './src/client', from: '**/*.min.css', to: '.' }
      ]
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist/client'),
    hot: true
  }
};