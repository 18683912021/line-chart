// vue.config.js
module.exports = {
  publicPath: './'，
  chainWebpack: config => {
    config.module
      .rule('mjs')
      .test(/\.mjs$/)
      .include
      .add(/node_modules/)
      .end()
      .type('javascript/auto')
      .use('babel-loader')
      .loader('babel-loader')
      .options({
        presets: ['@babel/preset-env'],
      });
  },
  devServer: {
    proxy: {
      "/api": {
        target: "http://47.106.157.160:10001", // 代理目标服务器
        changeOrigin: true, // 是否跨域
        // pathRewrite: { '^/api': '' }, // 重写路径
      },
    },
  },
};
