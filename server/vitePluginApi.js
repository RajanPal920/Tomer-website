// Vite Plugin to mount Tomar Enterprises Backend API and Video Streaming in Vite Development Server

import fs from 'node:fs';
import path from 'node:path';
import { handleApiRequest } from './apiRouter.js';

export function apiPlugin() {
  return {
    name: 'tomar-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 1. Video streaming middleware with RFC-compliant HTTP 206 Range handling
        if (req.url && req.url.includes('/images/video/') && req.url.split('?')[0].endsWith('.mp4')) {
          const cleanUrl = decodeURIComponent(req.url.split('?')[0]);
          const filePath = path.join(process.cwd(), 'public', cleanUrl);

          if (fs.existsSync(filePath)) {
            try {
              const stat = fs.statSync(filePath);
              const fileSize = stat.size;
              const range = req.headers.range;

              if (range) {
                const parts = range.replace(/bytes=/, '').split('-');
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

                if (start >= fileSize || end >= fileSize || start > end) {
                  res.statusCode = 416;
                  res.setHeader('Content-Range', `bytes */${fileSize}`);
                  res.end();
                  return;
                }

                const chunkSize = end - start + 1;
                const stream = fs.createReadStream(filePath, { start, end });

                res.writeHead(206, {
                  'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                  'Accept-Ranges': 'bytes',
                  'Content-Length': chunkSize,
                  'Content-Type': 'video/mp4',
                  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                  'Pragma': 'no-cache',
                });
                stream.pipe(res);
                return;
              } else {
                res.writeHead(200, {
                  'Content-Length': fileSize,
                  'Content-Type': 'video/mp4',
                  'Accept-Ranges': 'bytes',
                  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                  'Pragma': 'no-cache',
                });
                fs.createReadStream(filePath).pipe(res);
                return;
              }
            } catch (err) {
              console.error('[VIDEO STREAMING ERROR]', err);
            }
          }
        }

        // 2. API Endpoints
        if (req.url && req.url.startsWith('/api/')) {
          try {
            await handleApiRequest(req, res);
            return;
          } catch (err) {
            console.error('[API MIDDLEWARE ERROR]', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server error in API middleware' }));
            return;
          }
        }

        next();
      });
    },
  };
}
