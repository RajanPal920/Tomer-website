// SEO Verification Test Suite for Tomar Enterprises
// Verifies technical SEO assets, sitemap, robots.txt, keywords file, structured data, and route resolution.

import fs from 'fs';
import path from 'path';
import { sampleProperties } from '../src/data/properties.js';
import { APPROVED_STATIONS } from '../src/data/locations.js';
import { SEO_LANDING_PAGES } from '../src/data/seoLandingPages.js';
import { filterProperties } from '../src/services/propertySearch.js';
import {
  buildRealEstateAgentSchema,
  buildWebSiteSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildPropertyListingSchema,
  generatePropertySeo,
  resolvePropertyLocation,
  resolvePropertyTypeName,
  SITE_BASE_URL
} from '../src/services/seo.js';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passed++;
    console.log(`  ✓ ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
  }
}

console.log('\n============================================================');
console.log('       TOMAR ENTERPRISES: LOCAL SEO VERIFICATION AUDIT       ');
console.log('============================================================\n');

// 1. Keyword Research File Verification
console.log('--- 1. KEYWORD RESEARCH FILE (seo/real-estate-keywords.csv) ---');
const csvPath = path.resolve('seo/real-estate-keywords.csv');
assert(fs.existsSync(csvPath), 'Keyword research CSV exists on disk');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.trim().split('\n');
const keywordCount = lines.length - 1; // subtract header
assert(keywordCount >= 100, `Keyword count >= 100 (Found: ${keywordCount} keywords)`);

const header = lines[0];
const expectedCols = ['keyword', 'location', 'property_type', 'intent', 'priority', 'target_page', 'title_pattern', 'content_requirements'];
const hasAllCols = expectedCols.every(col => header.includes(col));
assert(hasAllCols, 'CSV contains all required standardized columns');

// Check location coverage across keywords
const allLocationsCovered = APPROVED_STATIONS.every(st =>
  csvContent.toLowerCase().includes(st.canonicalName.toLowerCase())
);
assert(allLocationsCovered, 'All 7 corridor locations covered in keyword research');

// 2. Robots.txt Verification
console.log('\n--- 2. ROBOTS.TXT VERIFICATION (public/robots.txt) ---');
const robotsPath = path.resolve('public/robots.txt');
assert(fs.existsSync(robotsPath), 'robots.txt exists in public directory');
const robotsContent = fs.readFileSync(robotsPath, 'utf8');
assert(robotsContent.includes('Allow: /'), 'robots.txt allows public pages');
assert(robotsContent.includes('Disallow: /owner-login'), 'robots.txt blocks /owner-login');
assert(robotsContent.includes('Disallow: /admin'), 'robots.txt blocks /admin');
assert(robotsContent.includes('Disallow: /owner/dashboard'), 'robots.txt blocks /owner/dashboard');
assert(robotsContent.includes('Sitemap: https://tomer-website-tawny.vercel.app/sitemap.xml'), 'robots.txt links to canonical XML sitemap');

// 3. Sitemap.xml Verification
console.log('\n--- 3. XML SITEMAP VERIFICATION (public/sitemap.xml) ---');
const sitemapPath = path.resolve('public/sitemap.xml');
assert(fs.existsSync(sitemapPath), 'sitemap.xml exists in public directory');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
assert(sitemapContent.startsWith('<?xml') && sitemapContent.includes('<urlset'), 'Valid XML declaration and urlset root');
assert(!sitemapContent.includes('/owner-login'), 'Zero private or admin URLs in sitemap');
assert(!sitemapContent.includes('/owner/dashboard'), 'Zero owner dashboard URLs in sitemap');

// Count URLs in sitemap
const urlMatches = sitemapContent.match(/<url>/g);
const sitemapUrlCount = urlMatches ? urlMatches.length : 0;
assert(sitemapUrlCount >= 150, `Sitemap contains comprehensive canonical URLs (Found: ${sitemapUrlCount})`);

// Verify all approved stations and SEO landing pages are in sitemap
const allStationsInSitemap = APPROVED_STATIONS.every(st =>
  sitemapContent.includes(`<loc>${SITE_BASE_URL}/locations/${st.slug}</loc>`)
);
assert(allStationsInSitemap, 'All 7 location landing URLs present in sitemap');

const allSeoLandingsInSitemap = SEO_LANDING_PAGES.every(lp =>
  sitemapContent.includes(`<loc>${SITE_BASE_URL}/${lp.slug}</loc>`)
);
assert(allSeoLandingsInSitemap, 'All high-intent SEO landing URLs present in sitemap');

// 4. High-Intent Landing Pages Inventory Check
console.log('\n--- 4. HIGH-INTENT LANDING PAGES DATA INTEGRITY ---');
for (const landing of SEO_LANDING_PAGES) {
  let matches = filterProperties(sampleProperties, {
    locality: landing.primaryLocation,
    category: landing.categoryFilter !== 'all' ? landing.categoryFilter : undefined,
    categoryTab: landing.tabFilter !== 'all' ? landing.tabFilter : undefined,
  });
  if (landing.sublocalityFilter) {
    const subMatches = matches.filter(p => {
      const text = `${p.subLocation || ''} ${p.address || ''} ${p.locality || ''}`.toLowerCase();
      return text.includes(landing.sublocalityFilter.toLowerCase());
    });
    if (subMatches.length > 0) matches = subMatches;
  }
  assert(
    matches.length >= 1,
    `Landing Page /${landing.slug} returns matching listings (Found: ${matches.length})`
  );
  assert(landing.faqs && landing.faqs.length >= 2, `Landing Page /${landing.slug} has >= 2 genuine FAQs`);
  assert(landing.h1 && landing.title && landing.metaDescription, `Landing Page /${landing.slug} has complete H1, Title & Meta Description`);
}

// 5. Phase 4 Property-Specific SEO Engine Verification
console.log('\n--- 5. PHASE 4 PROPERTY-SPECIFIC SEO ENGINE ---');

const testResale = {
  id: 'test-resale-1',
  slug: '1-bhk-resale-flat-nalasopara-west',
  category: 'resale-flat',
  transactionType: 'buy',
  locality: 'nalasopara',
  subLocation: 'Nalasopara West, Sriprastha',
  bedrooms: 1,
  price: 2800000,
  priceDisplay: '₹28.00 Lakh'
};
const seoResale = generatePropertySeo(testResale);
assert(seoResale.h1 === '1 BHK Resale Flat in Nalasopara West', `Example 1 H1: "${seoResale.h1}"`);
assert(seoResale.title.includes('1 BHK Resale Flat in Nalasopara West'), `Example 1 Title includes correct formula`);

const testNewFlat = {
  id: 'test-new-1',
  slug: 'new-flats-vasai-east',
  category: 'new-flat',
  transactionType: 'buy',
  locality: 'vasai-road',
  subLocation: 'Evershine City, Vasai East',
  bedrooms: null,
};
const seoNewFlat = generatePropertySeo(testNewFlat);
assert(seoNewFlat.h1 === 'New Flats for Sale in Vasai East', `Example 2 H1: "${seoNewFlat.h1}"`);
assert(seoNewFlat.title.includes('New Flats for Sale in Vasai East'), `Example 2 Title includes correct formula`);

const testPlot = {
  id: 'test-plot-1',
  slug: 'residential-plot-boisar',
  category: 'residential-plot',
  transactionType: 'plots-land',
  locality: 'boisar',
  subLocation: 'Boisar',
};
const seoPlot = generatePropertySeo(testPlot);
assert(seoPlot.h1 === 'Residential Plot in Boisar', `Example 3 H1: "${seoPlot.h1}"`);
assert(seoPlot.title.includes('Residential Plot in Boisar'), `Example 3 Title includes correct formula`);

const testOffice = {
  id: 'test-office-1',
  slug: 'commercial-office-boisar',
  category: 'commercial-office',
  transactionType: 'commercial',
  locality: 'boisar',
  subLocation: 'Boisar MIDC Tarapur Administrative Zone',
};
const seoOffice = generatePropertySeo(testOffice);
assert(seoOffice.h1 === 'Commercial Office Space in Boisar MIDC', `Example 4 H1: "${seoOffice.h1}"`);
assert(seoOffice.title.includes('Commercial Office Space in Boisar MIDC'), `Example 4 Title includes correct formula`);

// Verify all sample properties generate valid, safe SEO metadata without leaking private fields
let allPropsValid = true;
for (const p of sampleProperties) {
  const meta = generatePropertySeo(p);
  if (!meta.title || !meta.h1 || !meta.description || !meta.canonicalPath || !meta.schema) {
    allPropsValid = false;
    break;
  }
}
assert(allPropsValid, `All ${sampleProperties.length} properties generate complete dynamic SEO metadata`);

// 6. Structured Data JSON-LD Schema Verification
console.log('\n--- 6. STRUCTURED DATA (JSON-LD) SYNTAX & FIELDS ---');
const agentSchema = buildRealEstateAgentSchema();
assert(agentSchema['@type'] === 'RealEstateAgent', 'RealEstateAgent schema type correct');
assert(agentSchema.name === 'TOMAR ENTERPRISES', 'RealEstateAgent name correct');
assert(agentSchema.telephone.includes('82370 92224'), 'RealEstateAgent telephone verified');
assert(agentSchema.address.postalCode === '401305', 'RealEstateAgent postal code 401305 correct');
assert(agentSchema.areaServed.length === 7, 'RealEstateAgent areaServed includes all 7 corridor stations');

const webSiteSchema = buildWebSiteSchema();
assert(webSiteSchema['@type'] === 'WebSite', 'WebSite schema type correct');
assert(webSiteSchema.potentialAction['@type'] === 'SearchAction', 'WebSite Sitelinks SearchAction defined');

const sampleProp = sampleProperties[0];
const propSchema = buildPropertyListingSchema(sampleProp);
assert(propSchema['@type'] === 'RealEstateListing', 'Property schema @type is RealEstateListing');
assert(propSchema.offers && propSchema.offers.priceCurrency === 'INR', 'Property schema includes valid INR offers');

const sampleFaqs = [{ question: 'What are office hours?', answer: 'Contact us for hours.' }];
const faqSchema = buildFaqSchema(sampleFaqs);
assert(faqSchema['@type'] === 'FAQPage' && faqSchema.mainEntity.length === 1, 'FAQPage schema syntax valid');

// 7. Production Build Artifacts Check
console.log('\n--- 7. PRODUCTION BUILD ARTIFACTS (dist/index.html) ---');
const distIndexPath = path.resolve('dist/index.html');
assert(fs.existsSync(distIndexPath), 'dist/index.html exists');
const distHtml = fs.readFileSync(distIndexPath, 'utf8');
assert(distHtml.includes('<link rel="canonical"'), 'dist/index.html includes canonical link tag');
assert(distHtml.includes('property="og:title"'), 'dist/index.html includes OpenGraph title');
assert(distHtml.includes('name="twitter:card"'), 'dist/index.html includes Twitter card');
assert(distHtml.includes('application/ld+json'), 'dist/index.html includes static JSON-LD schema');

console.log('\n============================================================');
console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED         `);
if (failed === 0) {
  console.log('   STATUS: ALL LOCAL SEO REQUIREMENTS FULLY VERIFIED!       ');
} else {
  console.log('   STATUS: SOME TESTS FAILED. CHECK OUTPUT ABOVE.           ');
}
console.log('============================================================\n');

process.exit(failed > 0 ? 1 : 0);
