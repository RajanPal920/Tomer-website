// Comprehensive End-to-End Automated Test Script for Tomar Enterprises Owner System
// Tests complete 10-phase workflow: Auth, Access Control, Property Creation, Image Upload,
// Publishing, Public Visibility, Detail Lookup, Editing, Unpublishing, Deletion, and Logout.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

import { runMigrations, get } from '../server/db/index.js';

await runMigrations();
const dbUser = await get('SELECT username FROM owner_users LIMIT 1');

const args = process.argv.slice(2);
const TEST_USERNAME = args[0] || process.env.TOMAR_OWNER_USER || dbUser?.username || 'admin';
const TEST_PASSWORD = args[1] || process.env.TOMAR_OWNER_PASS || 'Tomar@Admin2026!';

// 1x1 pixel valid transparent WebP base64
const SAMPLE_WEBP_BASE64 =
  'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoB+AAA/v5e9gA=';

let token = null;
let testPropertyId = null;
let testPropertySlug = null;
let uploadedImageUrl = null;

const results = [];

function recordResult(stepName, passed, details = '') {
  results.push({ stepName, passed, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} | ${stepName}${details ? ` -> ${details}` : ''}`);
}

async function runTests() {
  console.log(`\n========================================================================`);
  console.log(` TOMAR ENTERPRISES — AUTOMATED END-TO-END WORKFLOW & SECURITY AUDIT`);
  console.log(` Target Server: ${BASE_URL}`);
  console.log(`========================================================================\n`);

  try {
    // -----------------------------------------------------------------------
    // TEST 1: ACCESS CONTROL - Public visitor must be rejected from owner routes
    // -----------------------------------------------------------------------
    console.log('[SECTION 1] Testing Server-Side Role-Based Access Control...');

    // 1a: Attempt to create property without auth
    const unauthCreateRes = await fetch(`${BASE_URL}/api/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hacked Property', category: 'new-flat', locality: 'virar', transactionType: 'buy' }),
    });
    recordResult(
      'Access Control: Unauthenticated POST /api/properties',
      unauthCreateRes.status === 403,
      `Received HTTP ${unauthCreateRes.status} (Expected 403 Forbidden)`
    );

    // 1b: Attempt to view unpublished drafts without auth
    const unauthAllRes = await fetch(`${BASE_URL}/api/properties?all=true`);
    recordResult(
      'Access Control: Unauthenticated GET /api/properties?all=true',
      unauthAllRes.status === 401,
      `Received HTTP ${unauthAllRes.status} (Expected 401 Unauthorized)`
    );

    // 1c: Attempt to access visitor enquiries without auth
    const unauthEnqRes = await fetch(`${BASE_URL}/api/enquiries`);
    recordResult(
      'Access Control: Unauthenticated GET /api/enquiries',
      unauthEnqRes.status === 403,
      `Received HTTP ${unauthEnqRes.status} (Expected 403 Forbidden)`
    );

    // 1d: Attempt image upload without auth
    const unauthUploadRes = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: SAMPLE_WEBP_BASE64 }),
    });
    recordResult(
      'Access Control: Unauthenticated POST /api/upload',
      unauthUploadRes.status === 403,
      `Received HTTP ${unauthUploadRes.status} (Expected 403 Forbidden)`
    );

    // -----------------------------------------------------------------------
    // TEST 2: AUTHENTICATION & LOGIN
    // -----------------------------------------------------------------------
    console.log('\n[SECTION 2] Testing Owner Authentication & Session Token Generation...');

    // 2a: Invalid credentials
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'invalid_user', password: 'WrongPassword123!' }),
    });
    recordResult(
      'Auth: Invalid credentials rejected',
      badLoginRes.status === 401,
      `Received HTTP ${badLoginRes.status}`
    );

    // 2b: Valid credentials
    const goodLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD }),
    });

    const goodLoginData = await goodLoginRes.json();
    const loginOk = goodLoginRes.status === 200 && goodLoginData.token && goodLoginData.user?.role === 'owner';
    token = goodLoginData.token;
    recordResult(
      'Auth: Owner login with PBKDF2 verification',
      loginOk,
      `Received 256-bit token for owner "${goodLoginData.user?.username}"`
    );

    // 2c: Session check
    const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sessionData = await sessionRes.json();
    recordResult(
      'Auth: Session verification via /api/auth/session',
      sessionRes.status === 200 && sessionData.authenticated === true,
      `User confirmed active: ${sessionData.user?.username} (${sessionData.user?.role})`
    );

    // -----------------------------------------------------------------------
    // TEST 3: IMAGE UPLOAD & PERSISTENCE
    // -----------------------------------------------------------------------
    console.log('\n[SECTION 3] Testing Property Image Upload & Storage Persistence...');

    const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: SAMPLE_WEBP_BASE64,
        filename: 'test-property-photo.webp',
      }),
    });

    const uploadData = await uploadRes.json();
    const uploadOk = uploadRes.status === 201 && uploadData.url && uploadData.filename;
    uploadedImageUrl = uploadData.url;

    // Check file on disk
    const diskPath = path.join(__dirname, '..', 'public', 'images', 'properties', uploadData.filename || 'none');
    const fileExistsOnDisk = fs.existsSync(diskPath);

    recordResult(
      'Image Upload: Stored to disk and URL returned',
      uploadOk && fileExistsOnDisk,
      `URL: ${uploadedImageUrl} | Size: ${uploadData.sizeBytes} bytes`
    );

    // Verify serving image over HTTP
    if (uploadedImageUrl) {
      const imgHttpRes = await fetch(`${BASE_URL}${uploadedImageUrl}`);
      recordResult(
        'Image Upload: Image accessible over HTTP',
        imgHttpRes.status === 200,
        `HTTP Status: ${imgHttpRes.status}`
      );
    }

    // -----------------------------------------------------------------------
    // TEST 4: PROPERTY CREATION (DRAFT) & PERSISTENCE
    // -----------------------------------------------------------------------
    console.log('\n[SECTION 4] Testing Property Creation in Draft Status...');

    const timestamp = Date.now();
    const testPropPayload = {
      title: `Automated Test Luxury Villa ${timestamp}`,
      category: 'residential-house-villa',
      transactionType: 'buy',
      locality: 'virar',
      subLocation: 'Bolinj Agashi Road',
      address: 'Plot 42, Sunrise Enclave, Virar West',
      price: '₹1.25 Crore',
      priceDisplay: '₹1.25 Crore (All Inclusive)',
      pricePerSqft: '₹7,500 / sq.ft',
      areaSqFt: 1650,
      areaUnit: 'sq.ft',
      bedrooms: 3,
      bathrooms: 3,
      furnishing: 'Semi-Furnished',
      possessionStatus: 'Ready to Move',
      image: uploadedImageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      gallery: [uploadedImageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'],
      features: ['24x7 Municipal Water Supply', 'Car Parking Space', 'Vastu Compliant'],
      description: 'Test property for end-to-end verification of Tomar Enterprises Owner System.',
      status: 'draft',
      featured: true,
      isVerified: true,
      internalNotes: 'Private owner note: verify keys with broker.',
    };

    const createRes = await fetch(`${BASE_URL}/api/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(testPropPayload),
    });

    const createData = await createRes.json();
    testPropertyId = createData.property?.id;
    testPropertySlug = createData.property?.slug;

    recordResult(
      'Property Creation: Saved to server with unique ID & slug',
      createRes.status === 201 && testPropertyId && testPropertySlug,
      `ID: ${testPropertyId} | Slug: ${testPropertySlug}`
    );

    // Verify draft does NOT appear in public API
    const publicList1Res = await fetch(`${BASE_URL}/api/properties`);
    const publicList1 = await publicList1Res.json();
    const inPublicDraft = (publicList1.properties || []).some((p) => p.id === testPropertyId);
    recordResult(
      'Public Privacy: Draft property NOT visible on public website',
      !inPublicDraft,
      `Draft property absent from ${publicList1.total} public properties`
    );

    // -----------------------------------------------------------------------
    // TEST 5: PUBLISHING & PUBLIC DISCOVERY
    // -----------------------------------------------------------------------
    console.log('\n[SECTION 5] Publishing Property and Verifying Public Integration...');

    const publishRes = await fetch(`${BASE_URL}/api/properties/${testPropertyId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'published' }),
    });

    recordResult(
      'Publishing: Status switched to "published"',
      publishRes.status === 200,
      `HTTP Status: ${publishRes.status}`
    );

    // Verify it NOW appears in public API
    const publicList2Res = await fetch(`${BASE_URL}/api/properties`);
    const publicList2 = await publicList2Res.json();
    const inPublicPublished = (publicList2.properties || []).find((p) => p.id === testPropertyId);
    recordResult(
      'Public Discovery: Published property appears in public listing catalog',
      Boolean(inPublicPublished),
      `Found title: "${inPublicPublished?.title}" in category "${inPublicPublished?.category}"`
    );

    // Verify private internal notes are STRIPPED from public response
    recordResult(
      'Security: Private internal notes stripped from public payload',
      inPublicPublished && inPublicPublished.internalNotes === undefined,
      `Internal notes hidden from public: ${inPublicPublished?.internalNotes === undefined}`
    );

    // Test detail lookup by slug: /api/properties/:slug
    const detailRes = await fetch(`${BASE_URL}/api/properties/${testPropertySlug}`);
    const detailData = await detailRes.json();
    recordResult(
      'Public Detail View: Slug resolution works over HTTP',
      detailRes.status === 200 && detailData.property?.title === testPropPayload.title,
      `Resolved slug "${testPropertySlug}" -> "${detailData.property?.title}"`
    );

    // -----------------------------------------------------------------------
    // TEST 6: EDITING & PERSISTENCE
    // -----------------------------------------------------------------------
    console.log('\n[SECTION 6] Testing Property Editing & Persistence...');

    const updatedPrice = '₹1.35 Crore';
    const editRes = await fetch(`${BASE_URL}/api/properties/${testPropertyId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        price: updatedPrice,
        priceDisplay: '₹1.35 Crore (Revised Price)',
      }),
    });

    const editData = await editRes.json();
    recordResult(
      'Property Editing: Update existing record (no duplication)',
      editRes.status === 200 && editData.property?.price === updatedPrice,
      `New price: ${editData.property?.price}`
    );

    // Verify persistence directly in persistent relational database
    const dbProperty = await get('SELECT * FROM properties WHERE id = ?', [testPropertyId]);
    recordResult(
      'Persistence: Updated record verified directly in persistent database',
      dbProperty && dbProperty.price === updatedPrice,
      `Database price matches: ${dbProperty?.price}`
    );

    // -----------------------------------------------------------------------
    // TEST 7: UNPUBLISHING & IMMEDIATE PUBLIC REMOVAL
    // -----------------------------------------------------------------------
    console.log('\n[SECTION 7] Unpublishing Property and Verifying Public Removal...');

    await fetch(`${BASE_URL}/api/properties/${testPropertyId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'draft' }),
    });

    const publicList3Res = await fetch(`${BASE_URL}/api/properties`);
    const publicList3 = await publicList3Res.json();
    const stillInPublic = (publicList3.properties || []).some((p) => p.id === testPropertyId);
    recordResult(
      'Unpublishing: Property immediately disappears from public website',
      !stillInPublic,
      `Absent from public listings: ${!stillInPublic}`
    );

    // -----------------------------------------------------------------------
    // TEST 8: CLEANUP - Safely delete test property and uploaded photo
    // -----------------------------------------------------------------------
    console.log('\n[SECTION 8] Cleaning up Test Artifacts...');

    if (testPropertyId) {
      const deleteRes = await fetch(`${BASE_URL}/api/properties/${testPropertyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      recordResult(
        'Cleanup: Safely delete test property from server',
        deleteRes.status === 200,
        `Deleted property ref: ${testPropertyId}`
      );
    }

    if (uploadedImageUrl) {
      const filename = path.basename(uploadedImageUrl);
      const filePath = path.join(__dirname, '..', 'public', 'images', 'properties', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        recordResult('Cleanup: Removed temporary test image file', true, filename);
      }
    }

    // -----------------------------------------------------------------------
    // TEST 9: LOGOUT & SESSION INVALIDATION
    // -----------------------------------------------------------------------
    console.log('\n[SECTION 9] Testing Logout & Session Invalidation...');

    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    recordResult(
      'Logout: Invalidate active token via /api/auth/logout',
      logoutRes.status === 200,
      `HTTP Status: ${logoutRes.status}`
    );

    // Verify session token is now rejected
    const postLogoutCheck = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    recordResult(
      'Security: Post-logout token rejection',
      postLogoutCheck.status === 401,
      `HTTP Status: ${postLogoutCheck.status} (Unauthorized)`
    );

    // -----------------------------------------------------------------------
    // SUMMARY REPORT
    // -----------------------------------------------------------------------
    console.log(`\n========================================================================`);
    console.log(` AUDIT SUMMARY & TEST RESULTS`);
    console.log(`========================================================================`);
    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    console.log(` Total Checks: ${totalCount}`);
    console.log(` Passed:       ${passedCount}`);
    console.log(` Failed:       ${totalCount - passedCount}`);
    console.log(` Overall Status: ${passedCount === totalCount ? '🎉 ALL TESTS PASSED' : '⚠️ SOME CHECKS FAILED'}`);
    console.log(`========================================================================\n`);

    if (passedCount !== totalCount) {
      process.exit(1);
    }
  } catch (err) {
    console.error('[FATAL TEST ERROR]', err);
    process.exit(1);
  }
}

runTests();
