const PROXY_CONFIG = {
  "/acj-api": {
    target: "https://api.acjdigital.com",
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      "^/acj-api": ""
    },
    logLevel: "debug",
    onProxyReq: (proxyReq, req, res) => {
      // Log all incoming request headers for debugging
      console.log('📨 Incoming request headers:', JSON.stringify(req.headers, null, 2));
      
      // Forward Authorization header (case-insensitive check)
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (authHeader) {
        proxyReq.setHeader('Authorization', authHeader);
        console.log('✅ Authorization header forwarded:', authHeader.substring(0, 50) + '...');
      } else {
        console.log('⚠️ No Authorization header found in request');
      }
      
      // Forward channel header (case-insensitive check)
      const channelHeader = req.headers.channel || req.headers.Channel;
      if (channelHeader) {
        proxyReq.setHeader('channel', channelHeader);
        console.log('✅ Channel header forwarded:', channelHeader);
      } else {
        console.log('⚠️ No channel header found in request');
      }
      
      console.log('🔄 Proxying:', req.method, req.url, '-> https://api.acjdigital.com' + req.url.replace('/acj-api', ''));
      console.log('📤 Outgoing headers:', JSON.stringify(proxyReq.getHeaders(), null, 2));
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('📥 Proxy response status:', proxyRes.statusCode, 'for', req.url);
    },
    onError: (err, req, res) => {
      console.log('❌ Proxy error:', err.message);
    }
  }
};

module.exports = PROXY_CONFIG;
