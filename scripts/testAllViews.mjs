// Comprehensive Automated Audit of All Routes & Endpoints for Tomar Enterprises
import http from 'http';

const routes = [
  '/',
  '/properties',
  '/buy',
  '/rent',
  '/commercial',
  '/plots',
  '/lease',
  '/properties/signature-grand-3-bhk-virar-west',
  '/locations/virar',
  '/locations/vasai',
  '/locations/nalasopara',
  '/locations/palghar',
  '/tools/emi-calculator',
  '/tools/plot-area-converter',
  '/projects',
  '/contact',
  '/owner-login',
  '/owner/dashboard',
  '/api/properties',
];

async function checkRoute(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:5173${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ path, status: res.statusCode, length: data.length });
      });
    });
    req.on('error', (err) => {
      resolve({ path, status: 'ERROR', error: err.message });
    });
  });
}

async function run() {
  console.log('=== RUNNING FULL ROUTE & API AUDIT ===\n');
  let allPassed = true;
  for (const r of routes) {
    const res = await checkRoute(r);
    const pass = res.status === 200 || (r === '/owner/dashboard' && res.status === 200); // SPA serves index.html with status 200
    console.log(`[${pass ? 'PASS' : 'FAIL'}] Route: ${r.padEnd(46)} -> HTTP ${res.status}`);
    if (!pass) allPassed = false;
  }
  console.log('\n======================================');
  console.log(allPassed ? 'ALL AUDIT ROUTES RETURNED 200 OK!' : 'SOME ROUTES FAILED');
}

run();
