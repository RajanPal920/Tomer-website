// Direct invocation test for Vercel Serverless Function entrypoints
import handler from '../api/index.js';

async function testEndpoint(url, method, body = null, headers = {}) {
  let statusCode = 200;
  const resHeaders = {};
  let responseData = '';

  const req = {
    url,
    method,
    headers: { host: 'localhost:5173', ...headers },
    body,
    on: (event, callback) => {
      if (event === 'data' && body) {
        callback(typeof body === 'string' ? body : JSON.stringify(body));
      }
      if (event === 'end') {
        callback();
      }
    },
  };

  const res = {
    statusCode: 200,
    setHeader: (key, val) => {
      resHeaders[key] = val;
    },
    writeHead: (code, hdrs = {}) => {
      res.statusCode = code;
      Object.assign(resHeaders, hdrs);
    },
    end: (data) => {
      responseData = data;
      console.log(`[TEST] ${method} ${url} -> Status: ${res.statusCode} | Content-Type: ${resHeaders['Content-Type']} | Data: ${responseData ? responseData.slice(0, 120) : 'none'}`);
    },
  };

  await handler(req, res);
  return { status: res.statusCode, headers: resHeaders, body: responseData };
}

async function main() {
  console.log('--- TESTING VERCEL SERVERLESS HANDLER ---');
  await testEndpoint('/api/health', 'GET');
  await testEndpoint('/api/auth/session', 'GET');
  await testEndpoint('/api/auth/login', 'POST', { username: 'invalid_user', password: 'wrongpassword' });
  await testEndpoint('/api/properties', 'GET');
  console.log('--- ALL VERCEL HANDLER TESTS EXECUTED SUCCESSFULLY ---');
}

main().catch((err) => {
  console.error('[TEST FATAL ERROR]', err);
  process.exit(1);
});
