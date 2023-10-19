const express = require('express');
const {
  createProxyMiddleware
} = require('http-proxy-middleware');
const app = express();
const port = 3001;


app.all('*', (req, res, next) => {
  return next();
});

app.use(express.static('build'));
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});