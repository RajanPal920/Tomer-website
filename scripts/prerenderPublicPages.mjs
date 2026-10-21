// Static Prerendering Engine for Tomar Enterprises
// Generates fully crawler-accessible, static HTML snapshots for all public canonical routes
// Compatible with Vercel static hosting and Vite SPA architecture.

import fs from 'fs';
import path from 'path';
import { sampleProperties } from '../src/data/properties.js';
import { APPROVED_STATIONS } from '../src/data/locations.js';
import { SEO_LANDING_PAGES } from '../src/data/seoLandingPages.js';
import { contactInfo } from '../src/data/contactInfo.js';
import { filterProperties } from '../src/services/propertySearch.js';
import {
  generatePropertySeo,
  buildRealEstateAgentSchema,
  buildWebSiteSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildPropertyListingSchema,
  resolvePropertyLocation,
} from '../src/services/seo.js';

const BASE_URL = process.env.VITE_SITE_URL || 'https://tomer-website-tawny.vercel.app';
const DIST_DIR = path.resolve('dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function replaceMeta(html, { title, description, canonicalUrl, ogType = 'website', ogImage, jsonLd, bodyContent }) {
  let output = html;

  // 1. Replace Title
  if (title) {
    output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  }

  // 2. Replace Description
  if (description) {
    output = output.replace(
      /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );
  }

  // 3. Replace Canonical
  if (canonicalUrl) {
    const fullCanonical = canonicalUrl.startsWith('http') ? canonicalUrl : `${BASE_URL}${canonicalUrl.startsWith('/') ? '' : '/'}${canonicalUrl}`;
    output = output.replace(
      /<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i,
      `<link rel="canonical" href="${escapeHtml(fullCanonical)}" />`
    );

    // og:url
    output = output.replace(
      /<meta\s+property=["']og:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta property="og:url" content="${escapeHtml(fullCanonical)}" />`
    );
  }

  // 4. OpenGraph and Twitter
  if (title) {
    output = output.replace(
      /<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtml(title)}" />`
    );
    output = output.replace(
      /<meta\s+name=["']twitter:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta name="twitter:title" content="${escapeHtml(title)}" />`
    );
  }

  if (description) {
    output = output.replace(
      /<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(description)}" />`
    );
    output = output.replace(
      /<meta\s+name=["']twitter:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    );
  }

  if (ogType) {
    output = output.replace(
      /<meta\s+property=["']og:type["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta property="og:type" content="${escapeHtml(ogType)}" />`
    );
  }

  if (ogImage) {
    const fullImg = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
    output = output.replace(
      /<meta\s+property=["']og:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta property="og:image" content="${escapeHtml(fullImg)}" />`
    );
    output = output.replace(
      /<meta\s+name=["']twitter:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta name="twitter:image" content="${escapeHtml(fullImg)}" />`
    );
  }

  // 5. Replace or Inject Structured Data JSON-LD
  if (jsonLd) {
    const jsonLdScript = `<script type="application/ld+json" id="seo-structured-data">\n${JSON.stringify(jsonLd, null, 2)}\n    </script>`;
    output = output.replace(
      /<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>/i,
      jsonLdScript
    );
  }

  // 6. Inject Semantic Initial HTML Body into <div id="root"></div>
  if (bodyContent) {
    output = output.replace(
      /<div\s+id=["']root["']>[\s\S]*?<\/div>/i,
      `<div id="root">${bodyContent}</div>`
    );
  }

  return output;
}

function writePrerenderedFile(routePath, htmlContent) {
  // Clean routePath (e.g. '/properties/my-slug' -> 'properties/my-slug')
  const cleanPath = routePath.replace(/^\//, '').replace(/\/$/, '');
  const targetDir = cleanPath ? path.join(DIST_DIR, cleanPath) : DIST_DIR;
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const filePath = path.join(targetDir, 'index.html');
  fs.writeFileSync(filePath, htmlContent, 'utf8');
}

export function prerenderAll() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.warn(`[Prerender] Template ${TEMPLATE_PATH} not found. Skipping static prerender.`);
    return 0;
  }

  const templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  let generatedCount = 0;

  console.log('[Prerender] Starting build-time static HTML generation for crawlers...');

  // 1. Core Category Hubs
  const categoryHubs = [
    {
      path: '/buy',
      title: 'Properties for Sale in Vasai to Boisar | New & Resale Homes | Tomar Enterprises',
      h1: 'Properties for Sale in Vasai to Boisar Corridor',
      description: 'Explore verified 1 BHK, 2 BHK, and 3 BHK flats for sale across Vasai Road, Virar, Nalasopara, and Palghar. MahaRERA registered advisor Tomar Enterprises.',
      categoryTab: 'buy',
    },
    {
      path: '/rent',
      title: 'Rental Properties in Vasai to Boisar | Flats for Rent | Tomar Enterprises',
      h1: 'Rental Properties across Vasai to Boisar',
      description: 'Find verified rental flats and residential apartments across Vasai Road, Virar, Nalasopara, Palghar, and Boisar. Zero brokerage fraud, verified agreements.',
      categoryTab: 'rentals',
    },
    {
      path: '/commercial',
      title: 'Commercial Property, Shops & Offices | Vasai to Boisar | Tomar Enterprises',
      h1: 'Commercial Retail Shops & Corporate Offices',
      description: 'Prime commercial shops, corporate office spaces, and business showrooms across Vasai, Virar, Palghar, and Boisar MIDC corridor.',
      categoryTab: 'commercial',
    },
    {
      path: '/plots',
      title: 'Plots & Land for Sale | NA Plots & Industrial Land | Tomar Enterprises',
      h1: 'Residential NA Plots & Industrial Land',
      description: 'Collector sanctioned NA plots, residential bungalow land in Saphale and Kelve, and Tarapur Boisar MIDC industrial plots with clear titles.',
      categoryTab: 'plots-land',
    },
    {
      path: '/lease',
      title: 'Heavy Deposit & Lease Properties | Zero Rent Homes | Tomar Enterprises',
      h1: 'Heavy Deposit & Long-Term Lease Properties',
      description: 'Explore verified heavy deposit and long-term lease properties across Virar, Nalasopara, and Vasai with legal lease agreement support.',
      categoryTab: 'lease-heavy-deposit',
    },
    {
      path: '/properties',
      title: 'Real Estate Catalog | Properties from Vasai to Boisar | Tomar Enterprises',
      h1: 'All Verified Real Estate Properties',
      description: 'Browse complete real estate catalog across Vasai Road, Nalasopara, Virar, Saphale, Kelve Road, Palghar, and Boisar with Tomar Enterprises.',
      categoryTab: 'all',
    },
  ];

  for (const hub of categoryHubs) {
    const matchingProps = filterProperties(sampleProperties, { categoryTab: hub.categoryTab }).slice(0, 6);
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: hub.h1, url: hub.path },
    ];
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        buildRealEstateAgentSchema(),
        buildBreadcrumbSchema(breadcrumbs),
      ],
    };

    const propCardsHtml = matchingProps.map((p) => `
      <article style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:16px;background:#ffffff;">
        <h3 style="margin-top:0;font-size:18px;"><a href="/properties/${escapeHtml(p.slug || p.id)}" style="color:#0f172a;text-decoration:none;">${escapeHtml(p.title)}</a></h3>
        <p style="color:#475569;font-size:14px;margin:4px 0;"><strong>Location:</strong> ${escapeHtml(p.subLocation || p.locality)}, Maharashtra</p>
        <p style="color:#047857;font-size:16px;font-weight:bold;margin:4px 0;"><strong>Price:</strong> ${escapeHtml(p.priceDisplay || p.priceFormatted || 'Contact for Price')}</p>
        <p style="color:#64748b;font-size:13px;margin:4px 0;">${escapeHtml(p.areaDisplay || '')} &bull; ${escapeHtml(p.transactionType || '')} &bull; ${escapeHtml(p.category || '')}</p>
        <p style="margin-top:8px;"><a href="/properties/${escapeHtml(p.slug || p.id)}" style="color:#b91c1c;font-weight:600;font-size:14px;">View Full Property Details &rarr;</a></p>
      </article>
    `).join('');

    const bodyContent = `
      <header style="background:#0f172a;color:#ffffff;padding:24px 20px;">
        <div style="max-width:1200px;margin:0 auto;">
          <p style="margin:0;font-size:13px;color:#94a3b8;">Tomar Enterprises &bull; MahaRERA Reg: ${escapeHtml(contactInfo.reraRegistration.certificateNumber || contactInfo.reraNumber)}</p>
          <h1 style="font-size:28px;margin:8px 0;">${escapeHtml(hub.h1)}</h1>
          <p style="margin:0;font-size:15px;color:#cbd5e1;">${escapeHtml(hub.description)}</p>
        </div>
      </header>
      <main style="max-width:1200px;margin:32px auto;padding:0 20px;font-family:system-ui,-apple-system,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:13px;color:#64748b;margin-bottom:20px;">
          <a href="/" style="color:#0f172a;">Home</a> &gt; <span>${escapeHtml(hub.h1)}</span>
        </nav>
        <section>
          <h2 style="font-size:22px;color:#0f172a;margin-bottom:16px;">Available Verified Listings (${matchingProps.length}+ properties)</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;">
            ${propCardsHtml}
          </div>
        </section>
        <footer style="margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;font-size:13px;color:#64748b;">
          <p>Tomar Enterprises Real Estate Advisory &bull; Office: ${escapeHtml(contactInfo.officeAddress.shopNo)}, ${escapeHtml(contactInfo.officeAddress.complex)}, ${escapeHtml(contactInfo.officeAddress.locality)} &bull; Phone: ${escapeHtml(contactInfo.phoneDisplay)}</p>
        </footer>
      </main>
    `;

    const html = replaceMeta(templateHtml, {
      title: hub.title,
      description: hub.description,
      canonicalUrl: hub.path,
      ogType: 'website',
      jsonLd: schema,
      bodyContent,
    });

    writePrerenderedFile(hub.path, html);
    generatedCount++;
  }

  // 2. Approved 7-Station Corridor Location Landing Pages
  for (const station of APPROVED_STATIONS) {
    const locPath = `/locations/${station.slug}`;
    const stationTitle = `${station.displayName} Real Estate & Property Listings | Tomar Enterprises`;
    const stationDesc = `Explore verified flats, resale homes, shops, offices, and plots in ${station.displayName}. Connect with MahaRERA registered advisor Tomar Enterprises for site visits.`;
    const matchingProps = filterProperties(sampleProperties, { locality: station.locationId }).slice(0, 6);

    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Locations', url: '/#locations' },
      { name: station.displayName, url: locPath },
    ];
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        buildRealEstateAgentSchema(),
        buildBreadcrumbSchema(breadcrumbs),
      ],
    };

    const propCardsHtml = matchingProps.map((p) => `
      <article style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:16px;background:#ffffff;">
        <h3 style="margin-top:0;font-size:18px;"><a href="/properties/${escapeHtml(p.slug || p.id)}" style="color:#0f172a;text-decoration:none;">${escapeHtml(p.title)}</a></h3>
        <p style="color:#475569;font-size:14px;margin:4px 0;"><strong>Sublocality:</strong> ${escapeHtml(p.subLocation || station.displayName)}</p>
        <p style="color:#047857;font-size:16px;font-weight:bold;margin:4px 0;"><strong>Price:</strong> ${escapeHtml(p.priceDisplay || p.priceFormatted || 'Contact for Price')}</p>
        <p style="color:#64748b;font-size:13px;margin:4px 0;">${escapeHtml(p.areaDisplay || '')} &bull; ${escapeHtml(p.transactionType || '')}</p>
        <p style="margin-top:8px;"><a href="/properties/${escapeHtml(p.slug || p.id)}" style="color:#b91c1c;font-weight:600;font-size:14px;">View Full Property Details &rarr;</a></p>
      </article>
    `).join('');

    const bodyContent = `
      <header style="background:#0f172a;color:#ffffff;padding:24px 20px;">
        <div style="max-width:1200px;margin:0 auto;">
          <p style="margin:0;font-size:13px;color:#94a3b8;">Corridor Hub &bull; Vasai to Boisar Railway Line</p>
          <h1 style="font-size:28px;margin:8px 0;">${escapeHtml(station.displayName)} Real Estate & Property Advisory</h1>
          <p style="margin:0;font-size:15px;color:#cbd5e1;">${escapeHtml(stationDesc)}</p>
        </div>
      </header>
      <main style="max-width:1200px;margin:32px auto;padding:0 20px;font-family:system-ui,-apple-system,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:13px;color:#64748b;margin-bottom:20px;">
          <a href="/" style="color:#0f172a;">Home</a> &gt; <a href="/#locations" style="color:#0f172a;">Locations</a> &gt; <span>${escapeHtml(station.displayName)}</span>
        </nav>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:22px;color:#0f172a;margin-bottom:12px;">Overview of ${escapeHtml(station.displayName)}</h2>
          <p style="color:#475569;line-height:1.6;font-size:15px;">${escapeHtml(station.description || stationDesc)}</p>
        </section>
        <section>
          <h2 style="font-size:22px;color:#0f172a;margin-bottom:16px;">Verified Properties in ${escapeHtml(station.displayName)} (${matchingProps.length}+ listings)</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;">
            ${propCardsHtml || '<p style="color:#64748b;">No active listings in this category right now. Contact our desk for newly arrived properties.</p>'}
          </div>
        </section>
      </main>
    `;

    const html = replaceMeta(templateHtml, {
      title: stationTitle,
      description: stationDesc,
      canonicalUrl: locPath,
      ogType: 'website',
      ogImage: station.image,
      jsonLd: schema,
      bodyContent,
    });

    writePrerenderedFile(locPath, html);
    generatedCount++;
  }

  // 3. High-Intent Curated SEO Landing Pages
  for (const page of SEO_LANDING_PAGES) {
    const pagePath = `/${page.slug}`;
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: page.h1, url: pagePath },
    ];
    const graph = [
      buildRealEstateAgentSchema(),
      buildBreadcrumbSchema(breadcrumbs),
    ];
    if (page.faqs && page.faqs.length > 0) {
      const faqSchema = buildFaqSchema(page.faqs);
      if (faqSchema) graph.push(faqSchema);
    }
    const schema = {
      '@context': 'https://schema.org',
      '@graph': graph,
    };

    let matches = filterProperties(sampleProperties, {
      locality: page.primaryLocation,
      category: page.categoryFilter !== 'all' ? page.categoryFilter : undefined,
      categoryTab: page.tabFilter !== 'all' ? page.tabFilter : undefined,
    });
    if (page.sublocalityFilter) {
      const term = page.sublocalityFilter.toLowerCase();
      const filtered = matches.filter((p) => {
        const text = `${p.subLocation || ''} ${p.address || ''} ${p.locality || ''}`.toLowerCase();
        return text.includes(term);
      });
      if (filtered.length > 0) matches = filtered;
    }
    const sampleMatches = matches.slice(0, 6);

    const propCardsHtml = sampleMatches.map((p) => `
      <article style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:16px;background:#ffffff;">
        <h3 style="margin-top:0;font-size:18px;"><a href="/properties/${escapeHtml(p.slug || p.id)}" style="color:#0f172a;text-decoration:none;">${escapeHtml(p.title)}</a></h3>
        <p style="color:#475569;font-size:14px;margin:4px 0;"><strong>Location:</strong> ${escapeHtml(p.subLocation || p.locality)}</p>
        <p style="color:#047857;font-size:16px;font-weight:bold;margin:4px 0;"><strong>Price:</strong> ${escapeHtml(p.priceDisplay || p.priceFormatted || 'Contact for Price')}</p>
        <p style="color:#64748b;font-size:13px;margin:4px 0;">${escapeHtml(p.areaDisplay || '')} &bull; ${escapeHtml(p.transactionType || '')}</p>
        <p style="margin-top:8px;"><a href="/properties/${escapeHtml(p.slug || p.id)}" style="color:#b91c1c;font-weight:600;font-size:14px;">View Full Property Details &rarr;</a></p>
      </article>
    `).join('');

    const faqsHtml = (page.faqs || []).map((faq) => `
      <div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;background:#ffffff;">
        <h3 style="font-size:16px;color:#0f172a;margin-top:0;margin-bottom:8px;">${escapeHtml(faq.question)}</h3>
        <p style="color:#475569;font-size:14px;margin:0;line-height:1.5;">${escapeHtml(faq.answer)}</p>
      </div>
    `).join('');

    const bodyContent = `
      <header style="background:#0f172a;color:#ffffff;padding:24px 20px;">
        <div style="max-width:1200px;margin:0 auto;">
          <p style="margin:0;font-size:13px;color:#94a3b8;">Tomar Enterprises &bull; Real Estate Advisor</p>
          <h1 style="font-size:28px;margin:8px 0;">${escapeHtml(page.h1)}</h1>
          <p style="margin:0;font-size:15px;color:#cbd5e1;">${escapeHtml(page.metaDescription)}</p>
        </div>
      </header>
      <main style="max-width:1200px;margin:32px auto;padding:0 20px;font-family:system-ui,-apple-system,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:13px;color:#64748b;margin-bottom:20px;">
          <a href="/" style="color:#0f172a;">Home</a> &gt; <span>${escapeHtml(page.h1)}</span>
        </nav>
        <section style="margin-bottom:28px;">
          <h2 style="font-size:22px;color:#0f172a;margin-bottom:12px;">Market Overview & Advisory</h2>
          <p style="color:#475569;line-height:1.6;font-size:15px;">${escapeHtml(page.introText)}</p>
        </section>
        <section style="margin-bottom:32px;">
          <h2 style="font-size:22px;color:#0f172a;margin-bottom:16px;">Matching Real Estate Listings (${matches.length}+ available)</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;">
            ${propCardsHtml || '<p style="color:#64748b;">No active listings in this category right now. Contact our desk for newly arrived properties.</p>'}
          </div>
        </section>
        ${faqsHtml ? `
        <section style="margin-top:32px;">
          <h2 style="font-size:22px;color:#0f172a;margin-bottom:16px;">Frequently Asked Questions</h2>
          ${faqsHtml}
        </section>` : ''}
      </main>
    `;

    const html = replaceMeta(templateHtml, {
      title: page.title,
      description: page.metaDescription,
      canonicalUrl: pagePath,
      ogType: 'website',
      jsonLd: schema,
      bodyContent,
    });

    writePrerenderedFile(pagePath, html);
    generatedCount++;
  }

  // 4. Genuine Individual Property Detail Pages
  const seenPropertySlugs = new Set();
  for (const property of sampleProperties) {
    if (property.status === 'archived') continue;
    const slug = property.slug || property.id;
    if (!slug || seenPropertySlugs.has(slug)) continue;
    seenPropertySlugs.add(slug);

    const propPath = `/properties/${slug}`;
    const seo = generatePropertySeo(property);
    const locality = resolvePropertyLocation(property);
    const priceDisplay = property.priceDisplay || property.priceFormatted || (property.price ? `₹${property.price}` : 'Price on Request');
    const areaDisplay = property.areaDisplay || (property.areaSqFt ? `${property.areaSqFt} sq.ft carpet` : '');
    const isSoldOut = property.status === 'sold' || property.status === 'sold_out' || property.status === 'sold-out';

    const bodyContent = `
      <header style="background:#0f172a;color:#ffffff;padding:24px 20px;">
        <div style="max-width:1200px;margin:0 auto;">
          <p style="margin:0;font-size:13px;color:#94a3b8;">Tomar Enterprises &bull; MahaRERA Reg: ${escapeHtml(contactInfo.reraRegistration.certificateNumber || contactInfo.reraNumber)} &bull; Ref: ${escapeHtml(property.id)}</p>
          <h1 style="font-size:28px;margin:8px 0;">${escapeHtml(seo.h1)}</h1>
          ${seo.subHeading ? `<p style="margin:0;font-size:16px;color:#cbd5e1;">${escapeHtml(seo.subHeading)}</p>` : ''}
          <p style="margin:4px 0 0 0;font-size:14px;color:#94a3b8;">${escapeHtml(property.subLocation || locality)}, Palghar District, Maharashtra</p>
        </div>
      </header>
      <main style="max-width:1200px;margin:32px auto;padding:0 20px;font-family:system-ui,-apple-system,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:13px;color:#64748b;margin-bottom:20px;">
          <a href="/" style="color:#0f172a;">Home</a> &gt; <a href="/properties" style="color:#0f172a;">Properties</a> &gt; <a href="/locations/${escapeHtml(property.locality)}" style="color:#0f172a;">${escapeHtml(locality)}</a> &gt; <span>${escapeHtml(seo.h1)}</span>
        </nav>
        ${isSoldOut ? `
        <div style="background:#ffe4e6;color:#881337;padding:16px;border-radius:8px;margin-bottom:20px;border:1px solid #fecdd3;">
          <strong>SOLD OUT:</strong> This property has been sold. Browse similar properties in ${escapeHtml(locality)}.
        </div>` : ''}
        <article style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px;border-bottom:1px solid #e2e8f0;padding-bottom:16px;">
            <div>
              <span style="font-size:26px;font-weight:bold;color:#0f172a;">${escapeHtml(priceDisplay)}</span>
              ${property.pricePerSqft ? `<p style="color:#64748b;font-size:14px;margin:4px 0;">Rate: ${escapeHtml(property.pricePerSqft)}</p>` : ''}
            </div>
            <div style="font-size:14px;color:#475569;">
              ${property.bedrooms ? `<p style="margin:2px 0;"><strong>Configuration:</strong> ${escapeHtml(property.bedrooms)} BHK</p>` : ''}
              ${areaDisplay ? `<p style="margin:2px 0;"><strong>Carpet Area:</strong> ${escapeHtml(areaDisplay)}</p>` : ''}
              ${property.possessionDisplay ? `<p style="margin:2px 0;"><strong>Possession:</strong> ${escapeHtml(property.possessionDisplay)}</p>` : ''}
              ${property.facing ? `<p style="margin:2px 0;"><strong>Facing:</strong> ${escapeHtml(property.facing)}</p>` : ''}
            </div>
          </div>
          <div style="margin-top:20px;">
            <h2 style="font-size:20px;color:#0f172a;margin-bottom:8px;">Property Description</h2>
            <p style="color:#475569;line-height:1.6;font-size:15px;">${escapeHtml(property.description || seo.description)}</p>
          </div>
          ${property.amenities && property.amenities.length > 0 ? `
          <div style="margin-top:20px;">
            <h2 style="font-size:20px;color:#0f172a;margin-bottom:8px;">Key Amenities & Features</h2>
            <ul style="color:#475569;font-size:14px;line-height:1.8;">
              ${property.amenities.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}
            </ul>
          </div>` : ''}
          <div style="margin-top:24px;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
            <h3 style="font-size:16px;color:#0f172a;margin-top:0;">Contact MahaRERA Registered Advisor</h3>
            <p style="color:#475569;font-size:14px;margin:4px 0;">TOMAR ENTERPRISES &bull; Advisor: ${escapeHtml(contactInfo.reraRegistration.agentName)}</p>
            <p style="color:#475569;font-size:14px;margin:4px 0;">Phone: <strong>${escapeHtml(contactInfo.phoneDisplay)}</strong> &bull; Office: ${escapeHtml(contactInfo.officeAddress.shopNo)}, ${escapeHtml(contactInfo.officeAddress.complex)}, Virar East 401305</p>
          </div>
        </article>
      </main>
    `;

    const html = replaceMeta(templateHtml, {
      title: seo.title,
      description: seo.description,
      canonicalUrl: propPath,
      ogType: 'article',
      ogImage: property.image,
      jsonLd: seo.schema,
      bodyContent,
    });

    writePrerenderedFile(propPath, html);
    generatedCount++;
  }

  // 5. Utility Pages
  const utilityPages = [
    {
      path: '/contact',
      title: 'Contact Tomar Enterprises | Real Estate Advisor in Virar East & Vasai to Boisar',
      h1: 'Contact Tomar Enterprises Property Advisory Desk',
      description: 'Visit Tomar Enterprises at Nakshatra Apt, Viva Jangid Complex, Virar East. Call +91 82370 92224 for property sales, purchase assistance, and site visits.',
    },
    {
      path: '/projects/new-developments',
      title: 'New Real Estate Developments & Township Projects | Vasai to Boisar | Tomar Enterprises',
      h1: 'New Real Estate Developments & Township Projects',
      description: 'Explore upcoming and under-construction township projects across Vasai Road, Virar, Palghar, and Boisar with MahaRERA verified documentation.',
    },
    {
      path: '/projects/redevelopment',
      title: 'Society Redevelopment Advisory & Assistance | Virar, Vasai & Boisar | Tomar Enterprises',
      h1: 'Society Redevelopment Advisory & Assistance',
      description: 'End-to-end society redevelopment consultancy for cooperative housing societies in Vasai-Virar and Palghar district with legal & feasibility guidance.',
    },
    {
      path: '/tools/emi-calculator',
      title: 'Home Loan EMI Calculator | Tomar Enterprises Real Estate Tools',
      h1: 'Home Loan EMI Calculator for Property Buyers',
      description: 'Calculate monthly home loan EMIs, interest payable, and total loan repayment for properties across Vasai, Virar, Palghar, and Boisar.',
    },
    {
      path: '/tools/plot-area-converter',
      title: 'Land & Plot Area Converter (Sq.ft, Guntha, Acre, Vigha) | Tomar Enterprises',
      h1: 'Land & Plot Area Unit Converter',
      description: 'Convert plot and land measurements between Square Feet, Square Meters, Guntha, Acre, and Hectare for Maharashtra real estate properties.',
    },
  ];

  for (const util of utilityPages) {
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: util.h1, url: util.path },
    ];
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        buildRealEstateAgentSchema(),
        buildBreadcrumbSchema(breadcrumbs),
      ],
    };

    const bodyContent = `
      <header style="background:#0f172a;color:#ffffff;padding:24px 20px;">
        <div style="max-width:1200px;margin:0 auto;">
          <p style="margin:0;font-size:13px;color:#94a3b8;">Tomar Enterprises &bull; Real Estate Advisor</p>
          <h1 style="font-size:28px;margin:8px 0;">${escapeHtml(util.h1)}</h1>
          <p style="margin:0;font-size:15px;color:#cbd5e1;">${escapeHtml(util.description)}</p>
        </div>
      </header>
      <main style="max-width:1200px;margin:32px auto;padding:0 20px;font-family:system-ui,-apple-system,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:13px;color:#64748b;margin-bottom:20px;">
          <a href="/" style="color:#0f172a;">Home</a> &gt; <span>${escapeHtml(util.h1)}</span>
        </nav>
        <section style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
          <p style="color:#475569;line-height:1.6;font-size:15px;">${escapeHtml(util.description)}</p>
          <div style="margin-top:20px;">
            <p><strong>Office Address:</strong> ${escapeHtml(contactInfo.officeAddress.shopNo)}, ${escapeHtml(contactInfo.officeAddress.complex)}, ${escapeHtml(contactInfo.officeAddress.locality)}</p>
            <p><strong>Direct Helpline:</strong> ${escapeHtml(contactInfo.phoneDisplay)}</p>
          </div>
        </section>
      </main>
    `;

    const html = replaceMeta(templateHtml, {
      title: util.title,
      description: util.description,
      canonicalUrl: util.path,
      ogType: 'website',
      jsonLd: schema,
      bodyContent,
    });

    writePrerenderedFile(util.path, html);
    generatedCount++;
  }

  console.log(`[Prerender] Successfully generated ${generatedCount} static crawler-accessible HTML pages in dist/!`);
  return generatedCount;
}

if (process.argv[1] && process.argv[1].endsWith('prerenderPublicPages.mjs')) {
  prerenderAll();
}
