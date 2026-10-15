// Standalone Production Server for Tomar Enterprises
// Serves production static assets from dist/ and handles /api/* routes with full role-based authorization.
// Includes RFC-compliant HTTP 206 Range handling for video walkthrough streaming.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { handleApiRequest } from './apiRouter.js';
import { runMigrations, checkHealth } from './db/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '..', 'dist');
const PORT = process.env.PORT || 5173;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
};

// Bootstrap database on server startup
await runMigrations();
const dbStatus = await checkHealth();
console.log('[DB] Production database status:', dbStatus);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // 1. Video streaming middleware with RFC-compliant HTTP 206 Range handling
  if (pathname.includes('/images/video/') && pathname.endsWith('.mp4')) {
    const cleanUrl = decodeURIComponent(pathname);
    let videoPath = path.join(DIST_DIR, cleanUrl);
    if (!fs.existsSync(videoPath)) {
      videoPath = path.join(__dirname, '..', 'public', cleanUrl);
    }

    if (fs.existsSync(videoPath)) {
      try {
        const stat = fs.statSync(videoPath);
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
          const stream = fs.createReadStream(videoPath, { start, end });

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
          fs.createReadStream(videoPath).pipe(res);
          return;
        }
      } catch (err) {
        console.error('[VIDEO STREAMING ERROR]', err);
      }
    }
  }

  // 2. API Endpoints
  if (pathname.startsWith('/api/')) {
    return handleApiRequest(req, res);
  }

  // 3. Static File Serving from dist/ or public/
  let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    const publicPath = path.join(__dirname, '..', 'public', pathname);
    if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
      filePath = publicPath;
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // 4. Fallback to index.html for Single-Page Application (SPA) routing
  const indexHtml = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(indexHtml).pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found - Run npm run build first to produce dist/ bundle');
});

server.listen(PORT, () => {
  console.log(`[TOMAR ENTERPRISES] Production Server running on http://localhost:${PORT}`);
});
