const {
  createProxyMiddleware
} = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(createProxyMiddleware('/v1', {
    target: 'https://api.keyst.one/',
    changeOrigin: true,
    // pathRewrite: {
    //   '^/api': ''
    // }
  }));
  app.use(createProxyMiddleware('/v2', {
    target: 'https://api.keyst.one/',
    changeOrigin: true,
    // pathRewrite: {
    //   '^/api': ''
    // }
  }));
  app.use(createProxyMiddleware('/api', {
    target: 'https://mempool.space/',
    changeOrigin: true,
    // pathRewrite: {
    //   '^/api': ''
    // }
  }));
  app.use(createProxyMiddleware('/testnet', {
    target: 'https://mempool.space/',
    changeOrigin: true,
    // pathRewrite: {
    //   '^/api': ''
    // }
  }));
};