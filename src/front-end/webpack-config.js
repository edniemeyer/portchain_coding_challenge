const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  entry: "./index.tsx",
  mode: "development",
  // devServer: {
  //   port: 3001,
  //   open: false,
  //   proxy: {
  //     "/api": "http://localhost:3000",
  //     secure: false
  //   }
  // },
  output: {
    path: path.resolve(__dirname, '..', '..', 'dist', 'front-end', 'public'),
    publicPath: '/',
    filename: "app-bundle.js"
  },
  resolve: {
    extensions: ['.Webpack.js', '.web.js', '.ts', '.js', '.jsx', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: "./tsconfig.json"
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
      filename: 'index.html',
      inject: 'body'
    })
  ]
}