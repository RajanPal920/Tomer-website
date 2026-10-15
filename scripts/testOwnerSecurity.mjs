// Automated Security & Authorization Test Suite for Tomar Enterprises
// Tests:
// TEST A: Owner logs in successfully
// TEST B: Unauthenticated visitor attempts to access dashboard/enquiries -> Access Denied
// TEST C: Owner creates a residential plot in Nalasopara as a draft -> Must NOT appear publicly
// TEST D: Owner publishes that plot -> Appears in public listings and search
// TEST E: Owner opens property detail -> Correct data appears
// TEST F: Owner edits price -> Public property reflects updated value
// TEST G: Owner unpublishes -> No longer appears as available public listing
// TEST H: Public visitor attempts to call property-creation API directly -> Backend rejects (401/403)
// TEST I: Owner marks property sold -> No longer appears as available
// TEST J: Visitor submits property enquiry -> Enquiry recorded, does NOT create a public listing

import { handleApiRequest } from '../server/apiRouter.js';
import { EventEmitter } from 'node:events';

console.log('=== RUNNING OWNER SECURITY & AUTHORIZATION TEST SUITE ===\n');

let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
    failedTests++;
  }
}

import { Readable } from 'node:stream';

// Mock HTTP Request/Response runner for direct server-level unit testing
async function callApi(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const stream = body ? Readable.from([Buffer.from(JSON.stringify(body))]) : Readable.from([]);
    const req = Object.assign(stream, {
      method,
      url: path,
      headers: {
        host: 'localhost:5173',
        ...headers,
      },
      socket: { remoteAddress: '127.0.0.1' },
    });

    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      setHeader(name, val) {
        this.headers[name] = val;
      },
      end(chunk) {
        if (chunk) this.body += chunk;
        let parsed = null;
        try {
          parsed = this.body ? JSON.parse(this.body) : null;
        } catch {
          parsed = this.body;
        }
        resolve({
          status: this.statusCode,
          headers: this.headers,
          data: parsed,
        });
      },
    };

    // Execute API handler
    handleApiRequest(req, res).catch(reject);
  });
}

async function runTests() {
  try {
    // -----------------------------------------------------------------------
    // TEST H: Public visitor calls property creation API without authorization
    // -----------------------------------------------------------------------
    const unauthPost = await callApi('POST', '/api/properties', {
      title: 'Hacker Injected Property',
      category: 'new-flat',
      transactionType: 'buy',
      locality: 'virar',
    });
    assert(
      unauthPost.status === 403 || unauthPost.status === 401,
      'TEST H: Public visitor property-creation API call strictly rejected (401/403 Forbidden)',
      `Status: ${unauthPost.status}`
    );

    // -----------------------------------------------------------------------
    // TEST B: Unauthenticated visitor attempts to access enquiries or owner session
    // -----------------------------------------------------------------------
    const unauthSession = await callApi('GET', '/api/auth/session');
    assert(
      unauthSession.status === 401,
      'TEST B: Unauthenticated visitor cannot access owner session (401)',
      `Status: ${unauthSession.status}`
    );

    const unauthEnquiries = await callApi('GET', '/api/enquiries');
    assert(
      unauthEnquiries.status === 401 || unauthEnquiries.status === 403,
      'TEST B: Unauthenticated visitor cannot access customer enquiries (401/403 Rejected)',
      `Status: ${unauthEnquiries.status}`
    );

    // -----------------------------------------------------------------------
    // TEST A: Owner logs in successfully
    // -----------------------------------------------------------------------
    const invalidLogin = await callApi('POST', '/api/auth/login', {
      username: 'admin',
      password: 'WrongPassword!',
    });
    assert(
      invalidLogin.status === 401,
      'Invalid password correctly rejected with 401 Unauthorized'
    );

    const validLogin = await callApi('POST', '/api/auth/login', {
      username: 'admin',
      password: 'Tomar@Admin2026!',
    });
    assert(
      validLogin.status === 200 && !!validLogin.data?.token,
      'TEST A: Owner logs in successfully with valid credentials and receives session token',
      `Status: ${validLogin.status}`
    );

    const ownerToken = validLogin.data.token;
    const authHeaders = { authorization: `Bearer ${ownerToken}` };

    // Verify session
    const checkSession = await callApi('GET', '/api/auth/session', null, authHeaders);
    assert(
      checkSession.status === 200 && checkSession.data.user.role === 'owner',
      'Owner session validated by server as role="owner"'
    );

    // -----------------------------------------------------------------------
    // TEST C: Owner creates a residential plot in Nalasopara as a draft
    // -----------------------------------------------------------------------
    const createDraft = await callApi(
      'POST',
      '/api/properties',
      {
        title: 'Nalasopara Green Meadows Residential Plot',
        category: 'residential-plot',
        transactionType: 'plots-land',
        locality: 'nalasopara',
        subLocation: 'Nalasopara East, Central Park Road',
        price: '₹22.50 Lakh',
        areaSqFt: 1800,
        areaUnit: 'sq.ft',
        status: 'draft', // DRAFT
        internalNotes: 'Private seller meeting on Monday; verification pending.',
      },
      authHeaders
    );

    assert(
      createDraft.status === 201 && createDraft.data.property.status === 'draft',
      'TEST C (Part 1): Owner successfully created draft residential plot in Nalasopara',
      `Status: ${createDraft.status}`
    );

    const createdPlot = createDraft.data.property;
    const plotId = createdPlot.id;
    const plotSlug = createdPlot.slug;

    // Verify public does NOT see draft
    const publicList = await callApi('GET', '/api/properties');
    const draftInPublic = publicList.data.properties.some((p) => p.id === plotId);
    assert(
      !draftInPublic,
      'TEST C (Part 2): Draft property must NOT appear in public properties listing'
    );

    // Verify public detail lookup also hides draft
    const publicDetailDraft = await callApi('GET', `/api/properties/${plotId}`);
    assert(
      publicDetailDraft.status === 404,
      'TEST C (Part 3): Direct public detail page lookup for draft returns 404 (Private Draft)'
    );

    // -----------------------------------------------------------------------
    // TEST D: Owner publishes that plot
    // -----------------------------------------------------------------------
    const publishRes = await callApi(
      'PATCH',
      `/api/properties/${plotId}`,
      { status: 'published' },
      authHeaders
    );
    assert(
      publishRes.status === 200 && publishRes.data.property.status === 'published',
      'TEST D (Part 1): Owner published property successfully'
    );

    // Public list NOW includes the published plot
    const publicListAfterPub = await callApi('GET', '/api/properties');
    const publishedInPublic = publicListAfterPub.data.properties.find((p) => p.id === plotId);
    assert(
      !!publishedInPublic,
      'TEST D (Part 2): Published plot now appears automatically in public properties listing'
    );
    assert(
      publishedInPublic && publishedInPublic.internalNotes === undefined,
      'TEST D (Part 3): Private internalNotes are stripped from public response'
    );

    // -----------------------------------------------------------------------
    // TEST E: Owner opens property detail -> correct data appears
    // -----------------------------------------------------------------------
    const publicDetailPub = await callApi('GET', `/api/properties/${plotId}`);
    assert(
      publicDetailPub.status === 200 &&
        publicDetailPub.data.property.title === 'Nalasopara Green Meadows Residential Plot' &&
        publicDetailPub.data.property.locality === 'nalasopara' &&
        publicDetailPub.data.property.category === 'residential-plot',
      'TEST E: Public detail view returns correct property data matching slug/id'
    );

    // -----------------------------------------------------------------------
    // TEST F: Owner edits price and saves
    // -----------------------------------------------------------------------
    const editPrice = await callApi(
      'PATCH',
      `/api/properties/${plotId}`,
      { price: '₹24.00 Lakh', priceDisplay: '₹24.00 Lakh (Negotiable)' },
      authHeaders
    );
    assert(
      editPrice.status === 200 && editPrice.data.property.price === '₹24.00 Lakh',
      'TEST F (Part 1): Owner updated price successfully'
    );

    const publicDetailAfterEdit = await callApi('GET', `/api/properties/${plotId}`);
    assert(
      publicDetailAfterEdit.data.property.price === '₹24.00 Lakh' &&
        publicDetailAfterEdit.data.property.priceDisplay === '₹24.00 Lakh (Negotiable)',
      'TEST F (Part 2): Public property page reflects updated price'
    );

    // -----------------------------------------------------------------------
    // TEST G: Owner unpublishes the property
    // -----------------------------------------------------------------------
    const unpublishRes = await callApi(
      'PATCH',
      `/api/properties/${plotId}`,
      { status: 'draft' },
      authHeaders
    );
    assert(
      unpublishRes.status === 200 && unpublishRes.data.property.status === 'draft',
      'Owner set status back to draft'
    );

    const publicListAfterUnpub = await callApi('GET', '/api/properties');
    const inPublicAfterUnpub = publicListAfterUnpub.data.properties.some((p) => p.id === plotId);
    assert(
      !inPublicAfterUnpub,
      'TEST G: Unpublished property no longer appears in public properties listing'
    );

    // -----------------------------------------------------------------------
    // TEST I: Owner marks property sold
    // -----------------------------------------------------------------------
    const markSoldRes = await callApi(
      'PATCH',
      `/api/properties/${plotId}`,
      { status: 'sold' },
      authHeaders
    );
    assert(
      markSoldRes.status === 200 && markSoldRes.data.property.status === 'sold',
      'Owner marked property as sold'
    );

    const publicListSold = await callApi('GET', '/api/properties');
    const inPublicSold = publicListSold.data.properties.some((p) => p.id === plotId);
    assert(
      !inPublicSold,
      'TEST I: Sold property does not appear as available public listing'
    );

    // -----------------------------------------------------------------------
    // TEST J: Visitor submits a property enquiry
    // -----------------------------------------------------------------------
    const visitorEnquiry = await callApi('POST', '/api/enquiries', {
      name: 'Vikas Patil',
      phone: '9820123456',
      email: 'vikas.patil@example.com',
      propertyId: 'demo-virar-resale-001',
      propertyTitle: 'Evershine Global City 2 BHK',
      message: 'Interested in visiting the site this Sunday afternoon.',
    });
    assert(
      visitorEnquiry.status === 201 && !!visitorEnquiry.data.enquiryId,
      'TEST J (Part 1): Visitor enquiry submitted and recorded with enquiryId'
    );

    // Verify it did NOT create a public listing
    const publicListAfterEnquiry = await callApi('GET', '/api/properties');
    const enquiryTurnedListing = publicListAfterEnquiry.data.properties.some(
      (p) => p.id === visitorEnquiry.data.enquiryId
    );
    assert(
      !enquiryTurnedListing,
      'TEST J (Part 2): Visitor enquiry does NOT create a public listing'
    );

    // Verify owner can view enquiry
    const ownerEnquiryList = await callApi('GET', '/api/enquiries', null, authHeaders);
    const recordedEnquiry = ownerEnquiryList.data.enquiries.find(
      (e) => e.name === 'Vikas Patil' && e.phone === '9820123456'
    );
    assert(
      !!recordedEnquiry,
      'TEST J (Part 3): Visitor enquiry is stored in owner dashboard enquiries'
    );

    // Clean up test plot so tests can be run idempotently
    await callApi('DELETE', `/api/properties/${plotId}`, null, authHeaders);

    console.log('\n========================================');
    if (failedTests === 0) {
      console.log('ALL OWNER SECURITY & AUTHORIZATION TESTS PASSED (100% SUCCESS)');
    } else {
      console.error(`TOTAL FAILED TESTS: ${failedTests}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
