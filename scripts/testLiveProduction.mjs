// Live Production Verification Script
// Tests deployed website on Vercel: https://tomer-website-tawny.vercel.app/

const BASE_URL = 'https://tomer-website-tawny.vercel.app';

async function runLiveAudit() {
  console.log(`\n====================================================`);
  console.log(`  VERIFYING LIVE VERCEL PRODUCTION DEPLOYMENT       `);
  console.log(`  URL: ${BASE_URL}                                   `);
  console.log(`====================================================\n`);

  try {
    // 1. Check Public Properties Endpoint (Unauthenticated public visitor)
    console.log('[1/5] Testing GET /api/properties (Public visitor)...');
    const propsRes = await fetch(`${BASE_URL}/api/properties`);
    const propsData = await propsRes.json().catch(() => ({}));
    console.log(`  -> Status: ${propsRes.status} ${propsRes.statusText}`);
    console.log(`  -> Returned properties: ${propsData?.properties?.length || 0}`);
    if (propsRes.status !== 200 || !Array.isArray(propsData.properties)) {
      throw new Error(`Failed to fetch public properties from live site: status ${propsRes.status}`);
    }

    // 2. Test Owner Login
    console.log('\n[2/5] Testing POST /api/auth/login (Owner login)...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'Tomar@Admin2026!',
      }),
    });
    const loginData = await loginRes.json().catch(() => ({}));
    console.log(`  -> Status: ${loginRes.status} ${loginRes.statusText}`);
    console.log(`  -> Success: ${loginData?.success}, Token: ${loginData?.token ? 'YES (Present)' : 'NO'}`);
    const setCookie = loginRes.headers.get('set-cookie');
    console.log(`  -> Set-Cookie Header: ${setCookie ? 'YES (Present)' : 'NO'}`);
    if (loginRes.status !== 200 || !loginData?.token) {
      throw new Error(`Owner login failed on live site: status ${loginRes.status}`);
    }

    const token = loginData.token;
    const cookieHeader = setCookie ? setCookie.split(';')[0] : `tomar_session=${token}`;

    // 3. Test Session Verification
    console.log('\n[3/5] Testing GET /api/auth/session with session cookie & token ...');
    const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: cookieHeader,
      },
    });
    const sessionData = await sessionRes.json().catch(() => ({}));
    console.log(`  -> Status: ${sessionRes.status} ${sessionRes.statusText}`);
    console.log(`  -> Authenticated: ${sessionData?.authenticated}, Role: ${sessionData?.user?.role}`);
    if (sessionRes.status !== 200 || !sessionData?.authenticated) {
      throw new Error(`Session verification failed on live site: status ${sessionRes.status}`);
    }

    // 4. Check Capacity Stats Endpoint (Authenticated Owner)
    console.log('\n[4/5] Testing GET /api/properties/stats (Authenticated Owner)...');
    const statsRes = await fetch(`${BASE_URL}/api/properties/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: cookieHeader,
      },
    });
    const statsData = await statsRes.json().catch(() => ({}));
    console.log(`  -> Status: ${statsRes.status} ${statsRes.statusText}`);
    console.log(`  -> Capacity: Active=${statsData?.capacity?.active}, Max=${statsData?.capacity?.maxLimit}, Remaining=${statsData?.capacity?.remaining}`);
    if (statsRes.status !== 200) {
      throw new Error(`Failed to fetch stats from live site: status ${statsRes.status}`);
    }

    // 5. Test Authenticated Owner Property Update (Confirm NO 403 Forbidden)
    console.log('\n[5/6] Testing PATCH /api/properties/:id (Testing Owner Update Permissions) ...');
    const firstProp = propsData.properties[0];
    const originalPrice = firstProp.priceDisplay || firstProp.price;
    console.log(`  -> Updating Property: "${firstProp.title}" (ID: ${firstProp.id})`);

    const updateRes = await fetch(`${BASE_URL}/api/properties/${firstProp.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        priceDisplay: originalPrice, // Safe self-update
      }),
    });
    const updateData = await updateRes.json().catch(() => ({}));
    console.log(`  -> Status: ${updateRes.status} ${updateRes.statusText}`);
    console.log(`  -> Success: ${updateData?.success}`);
    if (updateRes.status !== 200 || !updateData?.success) {
      throw new Error(`Owner property update failed with status ${updateRes.status}: ${updateData?.error || 'Unknown'}`);
    }

    // 6. Test Change Password Endpoint & Security Validations on Live Production
    console.log('\n[6/6] Testing POST /api/auth/change-password Security Rules on Live Production...');

    // 6A. Test Rejection of Wrong Current Password
    const wrongCurrentRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        currentPassword: 'WrongCurrentPassword123!',
        newPassword: 'BrandNewStrongPass2026#',
        confirmPassword: 'BrandNewStrongPass2026#',
      }),
    });
    console.log(`  -> 6A (Wrong Current Password): Status ${wrongCurrentRes.status} (Expected 401)`);
    if (wrongCurrentRes.status !== 401) {
      throw new Error(`Expected 401 for wrong current password on live site, got ${wrongCurrentRes.status}`);
    }

    // 6B. Test Rejection of Short Password (< 12 chars)
    const shortPassRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        currentPassword: 'Tomar@Admin2026!',
        newPassword: 'ShortPass1!',
        confirmPassword: 'ShortPass1!',
      }),
    });
    console.log(`  -> 6B (Short Password < 12 chars): Status ${shortPassRes.status} (Expected 400)`);
    if (shortPassRes.status !== 400) {
      throw new Error(`Expected 400 for short password on live site, got ${shortPassRes.status}`);
    }

    // 6C. Test Rejection of Mismatched Passwords
    const mismatchPassRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        currentPassword: 'Tomar@Admin2026!',
        newPassword: 'BrandNewStrongPass2026#',
        confirmPassword: 'DifferentStrongPass2026#',
      }),
    });
    console.log(`  -> 6C (Mismatched New Passwords): Status ${mismatchPassRes.status} (Expected 400)`);
    if (mismatchPassRes.status !== 400) {
      throw new Error(`Expected 400 for mismatched passwords on live site, got ${mismatchPassRes.status}`);
    }

    console.log(`\n====================================================`);
    console.log(`  ALL LIVE PRODUCTION TESTS PASSED SUCCESSFULLY!    `);
    console.log(`====================================================\n`);
  } catch (err) {
    console.error(`\n[LIVE TEST FAILED]`, err.message);
    process.exit(1);
  }
}

runLiveAudit();
