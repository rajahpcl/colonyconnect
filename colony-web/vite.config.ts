import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:8083';
  // Proxy error handler to give clearer messages when backend is down / connection resets
  const attachProxyErrorHandler = (proxy: any) => {
    try {
      proxy.on('error', (err: any, req: any, res: any) => {
        // Log server-side so devconsole shows better reason
        console.error('[vite] http proxy error for', req?.url, err?.message || err);
        try {
          if (res && !res.headersSent) {
            res.writeHead && res.writeHead(502, { 'Content-Type': 'application/json' });
          }
          res && res.end && res.end(JSON.stringify({ error: 'Bad Gateway', message: err?.message }));
        } catch (e) {
          // swallow
        }
      });
    } catch (e) {
      // no-op
    }
  };

  return {
    base: '/colonyconnect/',
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
    server: {
      port: 5173,
      proxy: {
        '/colonyconnectapi': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => attachProxyErrorHandler(proxy),
        },
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => `/colonyconnectapi${path}`,
          configure: (proxy) => attachProxyErrorHandler(proxy),
        },
      },
    },
  };
});
