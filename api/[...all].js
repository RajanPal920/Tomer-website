// Catch-all Vercel Serverless Function entry point for Tomar Enterprises API
import { handleApiRequest } from '../server/apiRouter.js';

export default async function handler(req, res) {
  try {
    return await handleApiRequest(req, res);
  } catch (err) {
    console.error('[VERCEL API ERROR]', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Internal server error processing API request',
        details: err.message,
      })
    );
  }
}
