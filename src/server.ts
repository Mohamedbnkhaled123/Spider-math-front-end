import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import http from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: ['localhost', '127.0.0.1', 'localhost:4000', 'localhost:4200', '*']
});

const backendBaseUrl = process.env['API_URL'] || 'http://localhost:5000';

/**
 * Proxy API requests directly to Express Backend API server (Port 5000).
 * Prevents Angular SSR from capturing /api routes and returning HTML.
 */
app.use('/api', (clientReq, clientRes) => {
  const backendUrl = new URL(clientReq.originalUrl, backendBaseUrl);

  const connector = http.request(
    backendUrl,
    {
      method: clientReq.method,
      headers: {
        ...clientReq.headers,
        host: backendUrl.host,
      },
    },
    (backendRes) => {
      clientRes.writeHead(backendRes.statusCode || 500, backendRes.headers);
      backendRes.pipe(clientRes, { end: true });
    }
  );

  connector.on('error', (err) => {
    console.error('[SSR Backend Proxy Error]:', err.message);
    if (!clientRes.headersSent) {
      clientRes.status(502).json({
        success: false,
        error: {
          code: 'GATEWAY_ERROR_502',
          message: 'تعذر الاتصال بسيرفر الباك إند API. يرجى التأكد من تشغيل السيرفر على المنفذ 5000.'
        }
      });
    }
  });

  clientReq.pipe(connector, { end: true });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * Defaults to port 4200 to align with Google OAuth authorized origin.
 */
if (process.argv[1]?.includes('server.mjs')) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Spider Math Express SSR Production server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createNodeRequestHandler(app);

