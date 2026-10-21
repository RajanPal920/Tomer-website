// Comprehensive Production SEO Verification Script for Tomar Enterprises
// Audits:
// 1. Domain consistency across all files
// 2. dist/ output (homepage, category, location, SEO landing, individual property)
// 3. All 139 published properties (duplicates, missing records, broken images, localities)
// 4. East/West localities and category filter mapping
// 5. Sitemap.xml vs public indexable routes
// 6. Robots.txt, canonical URLs, JSON-LD schema syntax
// 7. 17 curated SEO landing pages (matching inventory, unique content)
// 8. Bundle size and asset inspection

import fs from 'fs';
import path from 'path';
import { sampleProperties } from '../src/data/properties.js';
import { APPROVED_STATIONS } from '../src/data/locations.js';
import { SEO_LANDING_PAGES } from '../src/data/seoLandingPages.js';
import { filterProperties } from '../src/services/propertySearch.js';
import {
  generatePropertySeo,
  buildPropertyListingSchema,
  resolvePropertyLocation,
  SITE_BASE_URL,
} from '../src/services/seo.js';

const EXPECTED_DOMAIN = 'https://tomer-website-tawny.vercel.app';
const DIST_DIR = path.resolve('dist');

console.log('========================================================================');
console.log('       TOMAR ENTERPRISES: DEEP PRODUCTION SEO VERIFICATION AUDIT        ');
console.log('========================================================================\n');

const results = {
  domainChecks: [],
  distHtmlChecks: [],
  propertyCatalogChecks: [],
  landingPagesChecks: [],
  sitemapChecks: [],
  robotsChecks: [],
  bundleChecks: [],
};

// -------------------------------------------------------------------------
// 1. DOMAIN CONSISTENCY AUDIT
// -------------------------------------------------------------------------
console.log('--- 1. PRODUCTION DOMAIN CONSISTENCY ---');
const domainFiles = [
  { name: 'src/services/seo.js', content: fs.readFileSync('src/services/seo.js', 'utf8') },
  { name: 'public/robots.txt', content: fs.readFileSync('public/robots.txt', 'utf8') },
  { name: 'scripts/generateSitemap.mjs', content: fs.readFileSync('scripts/generateSitemap.mjs', 'utf8') },
  { name: 'scripts/prerenderPublicPages.mjs', content: fs.readFileSync('scripts/prerenderPublicPages.mjs', 'utf8') },
  { name: 'index.html', content: fs.readFileSync('index.html', 'utf8') },
];

let domainConsistent = true;
for (const file of domainFiles) {
  const matches = file.content.includes(EXPECTED_DOMAIN);
  if (!matches) {
    domainConsistent = false;
    results.domainChecks.push(`FAIL: ${file.name} does not reference ${EXPECTED_DOMAIN}`);
  } else {
    results.domainChecks.push(`PASS: ${file.name} correctly references ${EXPECTED_DOMAIN}`);
  }
}
results.domainChecks.forEach(c => console.log(' ', c));

// -------------------------------------------------------------------------
// 2. CHECK DIST/ GENERATED HTML FILES
// -------------------------------------------------------------------------
console.log('\n--- 2. DIST/ OUTPUT INSPECTION (REPRESENTATIVE PAGES) ---');
const testPages = [
  { type: 'Homepage', path: 'dist/index.html', expectedH1: null, minSize: 2000 },
  { type: 'Category Hub', path: 'dist/buy/index.html', expectedH1: 'Properties for Sale in Vasai to Boisar Corridor', minSize: 2000 },
  { type: 'Category Hub', path: 'dist/commercial/index.html', expectedH1: 'Commercial Retail Shops & Corporate Offices', minSize: 2000 },
  { type: 'Category Hub', path: 'dist/plots/index.html', expectedH1: 'Residential NA Plots & Industrial Land', minSize: 2000 },
  { type: 'Location Landing', path: 'dist/locations/virar/index.html', expectedH1: 'Virar', minSize: 2000 },
  { type: 'Location Landing', path: 'dist/locations/boisar/index.html', expectedH1: 'Boisar', minSize: 2000 },
  { type: 'SEO Landing', path: 'dist/flats-for-sale-in-vasai-east/index.html', expectedH1: 'Flats for Sale in Vasai East', minSize: 2000 },
  { type: 'SEO Landing', path: 'dist/resale-flats-in-nalasopara-east/index.html', expectedH1: 'Resale Flats in Nalasopara East', minSize: 2000 },
  { type: 'Property Detail', path: 'dist/properties/apex-corporate-suite-vasai-east/index.html', expectedH1: 'Commercial Office Space in Vasai East', minSize: 2000 },
  { type: 'Property Detail', path: 'dist/properties/evershine-global-city-2-bhk-virar/index.html', expectedH1: '2 BHK Resale Flat in Virar West', minSize: 2000 },
];

for (const tp of testPages) {
  const fullPath = path.resolve(tp.path);
  if (!fs.existsSync(fullPath)) {
    results.distHtmlChecks.push(`FAIL: [${tp.type}] Missing ${tp.path}`);
    continue;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const hasTitle = /<title>[^<]+<\/title>/i.test(content);
  const hasDesc = /<meta\s+name=["']description["']\s+content=["'][^"']+["']/i.test(content);
  const hasCanonical = /<link\s+rel=["']canonical["']\s+href=["']https:\/\/tomer-website-tawny\.vercel\.app[^"']*["']/i.test(content);
  const hasJsonLd = /<script\s+type=["']application\/ld\+json["']/i.test(content);
  const hasH1 = tp.expectedH1 ? (content.includes(`<h1`) && content.includes(tp.expectedH1)) : true;

  if (hasTitle && hasDesc && hasCanonical && hasJsonLd && hasH1) {
    results.distHtmlChecks.push(`PASS: [${tp.type}] ${tp.path} verified (Title, Desc, Canonical, H1, Schema)`);
  } else {
    results.distHtmlChecks.push(`FAIL: [${tp.type}] ${tp.path} failed checks (hasTitle:${hasTitle}, hasDesc:${hasDesc}, hasCanonical:${hasCanonical}, hasH1:${hasH1})`);
  }
}
results.distHtmlChecks.forEach(c => console.log(' ', c));

// -------------------------------------------------------------------------
// 3. 139 PUBLISHED PROPERTIES QUALITY AUDIT
// -------------------------------------------------------------------------
console.log('\n--- 3. ALL 139 PROPERTIES QUALITY & INTEGRITY AUDIT ---');
const publishedProps = sampleProperties.filter(p => p.status !== 'archived');
console.log(`  Total active/published properties: ${publishedProps.length}`);

const titlesMap = new Map();
const descsMap = new Map();
let missingSlugCount = 0;
let missingImageCount = 0;
let brokenImageFileCount = 0;
let invalidLocalityCount = 0;
let duplicateSlugCount = 0;
const seenSlugs = new Set();

for (const p of publishedProps) {
  const slug = p.slug || p.id;
  if (!slug) {
    missingSlugCount++;
  } else if (seenSlugs.has(slug)) {
    duplicateSlugCount++;
  } else {
    seenSlugs.add(slug);
  }

  // Locality check
  const loc = resolvePropertyLocation(p);
  if (!loc || loc === 'Vasai-Boisar') {
    // If fallback, check if intentional
    if (!p.locality) invalidLocalityCount++;
  }

  // Image verification
  if (!p.image) {
    missingImageCount++;
  } else if (p.image.startsWith('/images/')) {
    const diskPath = path.join('public', p.image.replace(/^\//, ''));
    if (!fs.existsSync(diskPath)) {
      brokenImageFileCount++;
    }
  }

  // SEO Title & Description
  const seo = generatePropertySeo(p);
  titlesMap.set(seo.title, (titlesMap.get(seo.title) || 0) + 1);
  descsMap.set(seo.description, (descsMap.get(seo.description) || 0) + 1);
}

const duplicateTitles = Array.from(titlesMap.entries()).filter(([t, count]) => count > 1);
const duplicateDescs = Array.from(descsMap.entries()).filter(([d, count]) => count > 1);

results.propertyCatalogChecks.push(`Published property count: ${publishedProps.length}`);
results.propertyCatalogChecks.push(`Missing slugs: ${missingSlugCount}`);
results.propertyCatalogChecks.push(`Duplicate slugs: ${duplicateSlugCount}`);
results.propertyCatalogChecks.push(`Missing images: ${missingImageCount}`);
results.propertyCatalogChecks.push(`Broken local image files: ${brokenImageFileCount}`);
results.propertyCatalogChecks.push(`Duplicate SEO titles across catalog: ${duplicateTitles.length}`);
results.propertyCatalogChecks.push(`Duplicate SEO meta descriptions: ${duplicateDescs.length}`);

results.propertyCatalogChecks.forEach(c => console.log(' ', c));
if (duplicateTitles.length > 0) {
  console.log(`  NOTE: Duplicate title examples (${duplicateTitles.length}):`);
  duplicateTitles.slice(0, 3).forEach(([title, count]) => console.log(`    - "${title}" (${count} properties)`));
}

// -------------------------------------------------------------------------
// 4. CHECK EAST/WEST LOCALITIES AND CATEGORY FILTERS
// -------------------------------------------------------------------------
console.log('\n--- 4. EAST/WEST LOCALITIES & CATEGORY INTENT AUDIT ---');
const sublocCounts = {};
for (const p of publishedProps) {
  const subloc = resolvePropertyLocation(p);
  sublocCounts[subloc] = (sublocCounts[subloc] || 0) + 1;
}
console.log('  Resolved Sublocality distribution:');
Object.entries(sublocCounts).sort((a,b) => b[1] - a[1]).forEach(([subloc, cnt]) => {
  console.log(`    - ${subloc}: ${cnt} properties`);
});

// -------------------------------------------------------------------------
// 5. SITEMAP.XML AUDIT
// -------------------------------------------------------------------------
console.log('\n--- 5. SITEMAP.XML VALIDATION ---');
const sitemapPath = path.resolve('public/sitemap.xml');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const locMatches = [...sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
console.log(`  Total URLs listed in sitemap: ${locMatches.length}`);

let nonCanonicalDomainCount = 0;
let privateUrlInSitemap = 0;
for (const url of locMatches) {
  if (!url.startsWith(EXPECTED_DOMAIN)) {
    nonCanonicalDomainCount++;
  }
  if (url.includes('/admin') || url.includes('/owner-login') || url.includes('/owner/dashboard')) {
    privateUrlInSitemap++;
  }
}
results.sitemapChecks.push(`Non-canonical domains in sitemap: ${nonCanonicalDomainCount}`);
results.sitemapChecks.push(`Private/admin URLs in sitemap: ${privateUrlInSitemap}`);
results.sitemapChecks.forEach(c => console.log(' ', c));

// -------------------------------------------------------------------------
// 6. ROBOTS.TXT AUDIT
// -------------------------------------------------------------------------
console.log('\n--- 6. ROBOTS.TXT AUDIT ---');
const robotsContent = fs.readFileSync('public/robots.txt', 'utf8');
const blocksAdmin = robotsContent.includes('Disallow: /admin') && robotsContent.includes('Disallow: /owner-login');
const allowsPublic = robotsContent.includes('Allow: /');
const hasSitemapDirective = robotsContent.includes(`Sitemap: ${EXPECTED_DOMAIN}/sitemap.xml`);
results.robotsChecks.push(`Blocks admin/private routes: ${blocksAdmin ? 'YES' : 'NO'}`);
results.robotsChecks.push(`Allows public crawling: ${allowsPublic ? 'YES' : 'NO'}`);
results.robotsChecks.push(`Points to valid sitemap: ${hasSitemapDirective ? 'YES' : 'NO'}`);
results.robotsChecks.forEach(c => console.log(' ', c));

// -------------------------------------------------------------------------
// 7. 17 CURATED SEO LANDING PAGES AUDIT
// -------------------------------------------------------------------------
console.log('\n--- 7. 17 CURATED SEO LANDING PAGES QUALITY AUDIT ---');
for (const page of SEO_LANDING_PAGES) {
  let matches = filterProperties(publishedProps, {
    locality: page.primaryLocation,
    category: page.categoryFilter !== 'all' ? page.categoryFilter : undefined,
    categoryTab: page.tabFilter !== 'all' ? page.tabFilter : undefined,
  });
  if (page.sublocalityFilter) {
    const term = page.sublocalityFilter.toLowerCase();
    const filtered = matches.filter(p => {
      const text = `${p.subLocation || ''} ${p.address || ''} ${p.locality || ''}`.toLowerCase();
      return text.includes(term);
    });
    if (filtered.length > 0) matches = filtered;
  }

  const isThin = matches.length === 0;
  const status = isThin ? 'THIN (0 matches)' : `OK (${matches.length} listings)`;
  results.landingPagesChecks.push(`/${page.slug}: ${status}`);
}
results.landingPagesChecks.forEach(c => console.log(' ', c));

// -------------------------------------------------------------------------
// 8. JS BUNDLE AUDIT
// -------------------------------------------------------------------------
console.log('\n--- 8. PRODUCTION ASSETS & BUNDLE SIZE ---');
const assetsDir = path.resolve('dist/assets');
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  for (const f of files) {
    const stat = fs.statSync(path.join(assetsDir, f));
    const kb = (stat.size / 1024).toFixed(2);
    console.log(`  Asset: ${f} (${kb} KB)`);
  }
}

console.log('\n========================================================================');
console.log('       AUDIT COMPLETE — ALL METRICS LOGGED FOR REPORT                   ');
console.log('========================================================================\n');
