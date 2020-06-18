const path = require('path');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const common = require('./webpack.common.js');
const merge = require('webpack-merge');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      contentBase: path.join(__dirname, 'dist/client'),
      hot: true
    },
    plugins: [
        new LiveReloadPlugin(),
    ]
})