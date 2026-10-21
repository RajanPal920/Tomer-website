// Script to generate valid, canonical XML sitemap for Tomar Enterprises
// Generates: public/sitemap.xml and dist/sitemap.xml (if dist exists)

import fs from 'fs';
import path from 'path';
import { sampleProperties } from '../src/data/properties.js';
import { APPROVED_STATIONS } from '../src/data/locations.js';
import { SEO_LANDING_PAGES } from '../src/data/seoLandingPages.js';

const BASE_URL = process.env.VITE_SITE_URL || 'https://tomer-website-tawny.vercel.app';
const TODAY = new Date().toISOString().split('T')[0];

function generateSitemapXml() {
  const urls = [];

  // 1. Homepage
  urls.push({
    loc: `${BASE_URL}/`,
    lastmod: TODAY,
    changefreq: 'daily',
    priority: '1.0',
  });

  // 2. Core Category / Transaction Intent Hubs
  const categoryHubs = [
    { path: '/buy', priority: '0.9', changefreq: 'daily' },
    { path: '/rent', priority: '0.9', changefreq: 'daily' },
    { path: '/commercial', priority: '0.9', changefreq: 'daily' },
    { path: '/plots', priority: '0.9', changefreq: 'daily' },
    { path: '/lease', priority: '0.9', changefreq: 'daily' },
    { path: '/properties', priority: '0.8', changefreq: 'daily' },
  ];

  for (const hub of categoryHubs) {
    urls.push({
      loc: `${BASE_URL}${hub.path}`,
      lastmod: TODAY,
      changefreq: hub.changefreq,
      priority: hub.priority,
    });
  }

  // 3. Approved 7-Station Corridor Location Landing Pages
  for (const station of APPROVED_STATIONS) {
    urls.push({
      loc: `${BASE_URL}/locations/${station.slug}`,
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: '0.9',
    });
  }

  // 4. Curated High-Intent SEO Landing Pages
  for (const landing of SEO_LANDING_PAGES) {
    urls.push({
      loc: `${BASE_URL}/${landing.slug}`,
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: '0.9',
    });
  }

  // 5. Real Estate Tools & Projects Hubs
  const utilityPages = [
    { path: '/projects/new-developments', priority: '0.7', changefreq: 'weekly' },
    { path: '/projects/redevelopment', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/emi-calculator', priority: '0.7', changefreq: 'monthly' },
    { path: '/tools/plot-area-converter', priority: '0.7', changefreq: 'monthly' },
    { path: '/contact', priority: '0.8', changefreq: 'monthly' },
  ];

  for (const util of utilityPages) {
    urls.push({
      loc: `${BASE_URL}${util.path}`,
      lastmod: TODAY,
      changefreq: util.changefreq,
      priority: util.priority,
    });
  }

  // 6. Genuine Property Detail Pages
  const seenPropertySlugs = new Set();
  for (const prop of sampleProperties) {
    if (prop.status === 'archived') continue;
    const slug = prop.slug || prop.id;
    if (!slug || seenPropertySlugs.has(slug)) continue;
    seenPropertySlugs.add(slug);

    urls.push({
      loc: `${BASE_URL}/properties/${slug}`,
      lastmod: prop.updatedAt ? prop.updatedAt.split('T')[0] : TODAY,
      changefreq: 'weekly',
      priority: '0.7',
    });
  }

  // Construct XML String
  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
  ];

  for (const u of urls) {
    xmlLines.push('  <url>');
    xmlLines.push(`    <loc>${u.loc}</loc>`);
    xmlLines.push(`    <lastmod>${u.lastmod}</lastmod>`);
    xmlLines.push(`    <changefreq>${u.changefreq}</changefreq>`);
    xmlLines.push(`    <priority>${u.priority}</priority>`);
    xmlLines.push('  </url>');
  }

  xmlLines.push('</urlset>');
  const xmlContent = xmlLines.join('\n');

  // Write to public/sitemap.xml
  const publicPath = path.resolve('public/sitemap.xml');
  fs.writeFileSync(publicPath, xmlContent, 'utf8');
  console.log(`[SEO] Generated public sitemap (${urls.length} URLs) at: ${publicPath}`);

  // Also write to dist/sitemap.xml if dist directory exists
  const distDir = path.resolve('dist');
  if (fs.existsSync(distDir)) {
    const distPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(distPath, xmlContent, 'utf8');
    console.log(`[SEO] Synced sitemap to dist directory: ${distPath}`);
  }

  return urls.length;
}

generateSitemapXml();
