import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import compression from 'compression';
import http from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();

// 1. Enable Gzip / Deflate response compression for HTML, JS, CSS, and JSON
app.use(compression({ threshold: 1024 }));

// 2. High-Grade Security Headers (HSTS, COOP, CSP, X-Frame-Options, NoSniff, Referrer-Policy)
app.use((req, res, next) => {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  if (isHttps) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  }
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com https://s.ytimg.com https://www.desmos.com https://accounts.google.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://i.ytimg.com https://yt3.ggpht.com https://res.cloudinary.com https://lh3.googleusercontent.com",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://accounts.google.com https://www.desmos.com",
    "connect-src 'self' http://localhost:5000 http://localhost:4000 http://localhost:4200 https://accounts.google.com https://www.googleapis.com https://api.cloudinary.com https://res.cloudinary.com https://www.desmos.com",
    "media-src 'self' blob: https://res.cloudinary.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'self'"
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);
  next();
});

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

