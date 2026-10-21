// Centralized Technical SEO Service for Tomar Enterprises
// Manages document title, meta descriptions, canonical links, OpenGraph, Twitter Cards, robots directives, and JSON-LD schemas.

import { contactInfo } from '../data/contactInfo.js';

export const SITE_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) ||
  'https://tomer-website-tawny.vercel.app';

export const DEFAULT_OG_IMAGE = `${SITE_BASE_URL}/images/buildingImages/build1.png`;

/**
 * Ensures or creates a meta tag with the given attribute selector
 */
function setMetaTag(attrName, attrValue, content) {
  if (typeof document === 'undefined') return;
  if (!content) {
    const existing = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (existing) existing.remove();
    return;
  }
  let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attrName, attrValue);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

/**
 * Ensures or updates the canonical link tag
 */
function setCanonicalUrl(url) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector('link[rel="canonical"]');
  if (!url) {
    if (link) link.remove();
    return;
  }
  const absoluteUrl = url.startsWith('http') ? url : `${SITE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', absoluteUrl);
}

/**
 * Injects or updates a JSON-LD structured data script tag
 */
function setStructuredData(schemaObj, scriptId = 'seo-structured-data') {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById(scriptId);
  if (!schemaObj) {
    if (existing) existing.remove();
    return;
  }
  let script = existing;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  try {
    script.textContent = JSON.stringify(schemaObj, null, 2);
  } catch (err) {
    console.warn('[SEO] Failed to serialize structured data schema:', err);
  }
}

/**
 * Master SEO updater function called on route transitions or page component mount
 */
export function updateSeoMetadata({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  structuredData = null,
} = {}) {
  if (typeof document === 'undefined') return;

  // 1. Title
  const finalTitle = title
    ? (title.includes('Tomar Enterprises') || title.includes('TOMAR ENTERPRISES') ? title : `${title} | Tomar Enterprises`)
    : 'TOMAR ENTERPRISES | Real Estate Agency — Virar East & Vasai to Boisar Corridor';
  document.title = finalTitle;

  // 2. Meta Description
  const finalDesc = description ||
    'MahaRERA registered real estate agency in Virar East (A99000043480). Search flats, resale homes, shops, offices, NA plots & rentals from Vasai to Boisar with Tomar Enterprises.';
  setMetaTag('name', 'description', finalDesc);

  // 3. Robots Directives
  if (noindex) {
    setMetaTag('name', 'robots', 'noindex, nofollow');
  } else {
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  }

  // 4. Canonical URL
  const canonical = canonicalPath !== undefined ? canonicalPath : (typeof window !== 'undefined' ? window.location.pathname : '/');
  setCanonicalUrl(canonical);

  const fullCanonicalUrl = canonical.startsWith('http')
    ? canonical
    : `${SITE_BASE_URL}${canonical.startsWith('/') ? '' : '/'}${canonical}`;

  // 5. Open Graph Meta Tags
  setMetaTag('property', 'og:site_name', contactInfo.brandName);
  setMetaTag('property', 'og:locale', 'en_IN');
  setMetaTag('property', 'og:type', ogType);
  setMetaTag('property', 'og:title', finalTitle);
  setMetaTag('property', 'og:description', finalDesc);
  setMetaTag('property', 'og:url', fullCanonicalUrl);
  setMetaTag('property', 'og:image', ogImage.startsWith('http') ? ogImage : `${SITE_BASE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`);

  // 6. Twitter Card Meta Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', finalTitle);
  setMetaTag('name', 'twitter:description', finalDesc);
  setMetaTag('name', 'twitter:image', ogImage.startsWith('http') ? ogImage : `${SITE_BASE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`);

  // 7. Structured Data (JSON-LD)
  if (structuredData) {
    setStructuredData(structuredData, 'seo-structured-data');
  } else {
    // Default schema: RealEstateAgent + WebSite
    setStructuredData({
      '@context': 'https://schema.org',
      '@graph': [
        buildRealEstateAgentSchema(),
        buildWebSiteSchema(),
      ],
    }, 'seo-structured-data');
  }
}

/**
 * Builds Schema.org RealEstateAgent structured data using genuine business details
 */
export function buildRealEstateAgentSchema() {
  return {
    '@type': 'RealEstateAgent',
    '@id': `${SITE_BASE_URL}/#realestateagent`,
    name: contactInfo.brandName,
    legalName: `${contactInfo.brandName} (${contactInfo.reraRegistration.agentName})`,
    url: SITE_BASE_URL,
    logo: `${SITE_BASE_URL}/tomar-logo.png`,
    image: DEFAULT_OG_IMAGE,
    description: 'MahaRERA registered real estate agency specializing in residential flats, resale homes, commercial shops, and NA plots across the Vasai-to-Boisar corridor.',
    telephone: contactInfo.phoneDisplay,
    email: contactInfo.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${contactInfo.officeAddress.shopNo}, ${contactInfo.officeAddress.complex}`,
      addressLocality: 'Virar East, Palghar',
      addressRegion: 'Maharashtra',
      postalCode: '401305',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '19.4678',
      longitude: '72.8124',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '09:30',
        closes: '20:30',
      },
    ],
    priceRange: '₹10 Lakh - ₹5 Cr',
    areaServed: [
      { '@type': 'City', name: 'Vasai Road' },
      { '@type': 'City', name: 'Nalasopara' },
      { '@type': 'City', name: 'Virar' },
      { '@type': 'City', name: 'Saphale' },
      { '@type': 'City', name: 'Kelve Road' },
      { '@type': 'City', name: 'Palghar' },
      { '@type': 'City', name: 'Boisar' },
    ],
    knowsAbout: [
      'Residential Flats & Apartments',
      'Resale Flats Handover',
      'Non-Agricultural (NA) Land Plots',
      'Tarapur Boisar MIDC Industrial Land',
      'Commercial Retail Shops & Offices',
      'Society Redevelopment Advisory',
      'MahaRERA Registration Compliance',
    ],
  };
}

/**
 * Builds Schema.org WebSite structured data with Sitelinks SearchBox
 */
export function buildWebSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_BASE_URL}/#website`,
    url: SITE_BASE_URL,
    name: 'Tomar Enterprises Real Estate',
    publisher: {
      '@id': `${SITE_BASE_URL}/#realestateagent`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_BASE_URL}/properties?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Builds Schema.org BreadcrumbList structured data
 * @param {Array<{ name: string, url: string }>} items
 */
export function buildBreadcrumbSchema(items = []) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_BASE_URL}${item.url.startsWith('/') ? '' : '/'}${item.url}`,
    })),
  };
}

/**
 * Builds Schema.org FAQPage structured data
 * @param {Array<{ question: string, answer: string }>} faqs
 */
export function buildFaqSchema(faqs = []) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Resolves verified sublocality or canonical locality from a property object
 */
export function resolvePropertyLocation(property) {
  if (!property) return 'Vasai-Boisar';
  const text = `${property.subLocation || ''} ${property.address || ''} ${property.locality || ''}`.toLowerCase();
  if (text.includes('boisar midc') || text.includes('tarapur midc')) return 'Boisar MIDC';
  if (text.includes('boisar east')) return 'Boisar East';
  if (text.includes('boisar west')) return 'Boisar West';
  if (text.includes('vasai east')) return 'Vasai East';
  if (text.includes('vasai west')) return 'Vasai West';
  if (text.includes('nalasopara east') || text.includes('nallasopara east')) return 'Nalasopara East';
  if (text.includes('nalasopara west') || text.includes('nallasopara west')) return 'Nalasopara West';
  if (text.includes('virar east')) return 'Virar East';
  if (text.includes('virar west')) return 'Virar West';
  if (text.includes('kelva beach') || text.includes('kelve beach')) return 'Kelva Beach Belt';
  if (text.includes('kelve road east')) return 'Kelve Road East';
  if (text.includes('kelve road west')) return 'Kelve Road West';
  if (text.includes('palghar east')) return 'Palghar East';
  if (text.includes('palghar west')) return 'Palghar West';
  if (text.includes('saphale east')) return 'Saphale East';
  if (text.includes('saphale west')) return 'Saphale West';

  const locMap = {
    vasai: 'Vasai Road',
    'vasai-road': 'Vasai Road',
    nalasopara: 'Nalasopara',
    virar: 'Virar',
    saphale: 'Saphale',
    'kelve-road': 'Kelve Road',
    palghar: 'Palghar',
    boisar: 'Boisar',
    vaitarna: 'Vaitarna',
  };
  return locMap[property.locality] || property.locality || 'Vasai-Boisar';
}

/**
 * Resolves standard property type name with verified BHK if present
 */
export function resolvePropertyTypeName(property) {
  if (!property) return 'Property';
  const cat = property.category || '';
  const trans = property.transactionType || '';
  const bhk = property.bedrooms ? `${property.bedrooms} BHK ` : '';

  if (cat === 'new-flat') return bhk ? `${bhk}New Flat` : 'New Flats for Sale';
  if (cat === 'resale-flat') return bhk ? `${bhk}Resale Flat` : 'Resale Flat';
  if (cat === 'residential-property') return bhk ? `${bhk}Residential Home` : 'Residential Property';
  if (cat === 'flat-rent') return bhk ? `${bhk}Flat for Rent` : 'Rental Flat';
  if (cat === 'shop-rent') return 'Commercial Shop for Rent';
  if (cat === 'office-rent') return 'Commercial Office for Rent';
  if (cat === 'commercial-shop') return 'Commercial Shop';
  if (cat === 'commercial-office') return 'Commercial Office Space';
  if (cat === 'commercial-property') return trans === 'lease' ? 'Commercial Space on Lease' : 'Commercial Space';
  if (cat === 'residential-plot') return 'Residential Plot';
  if (cat === 'na-plot') return 'Sanctioned NA Plot';
  if (cat === 'industrial-plot') return 'Industrial Plot';
  if (cat === 'lease-property') return 'Heavy Deposit Property on Lease';

  return bhk ? `${bhk}Property` : 'Property';
}

/**
 * Builds Schema.org RealEstateListing structured data for a property detail page
 */
export function buildPropertyListingSchema(property, canonicalPath) {
  if (!property) return null;

  const url = canonicalPath
    ? (canonicalPath.startsWith('http') ? canonicalPath : `${SITE_BASE_URL}${canonicalPath.startsWith('/') ? '' : '/'}${canonicalPath}`)
    : `${SITE_BASE_URL}/properties/${property.slug || property.id}`;

  const image = property.image
    ? (property.image.startsWith('http') ? property.image : `${SITE_BASE_URL}${property.image.startsWith('/') ? '' : '/'}${property.image}`)
    : DEFAULT_OG_IMAGE;

  const isRental = property.transactionType === 'rent' || property.category?.includes('rent');
  const locality = resolvePropertyLocation(property);

  const offers = property.price ? {
    '@type': 'Offer',
    price: Number(property.price),
    priceCurrency: 'INR',
    availability: (property.status === 'sold' || property.status === 'sold_out' || property.status === 'sold-out')
      ? 'https://schema.org/SoldOut'
      : 'https://schema.org/InStock',
    businessFunction: isRental ? 'https://schema.org/LeaseOut' : 'https://schema.org/SellAction',
    validFrom: '2026-01-01',
  } : undefined;

  return {
    '@type': 'RealEstateListing',
    '@id': `${url}#listing`,
    url,
    name: property.title,
    description: property.description || `${property.title} in ${locality}`,
    image,
    datePosted: property.createdAt || '2026-01-01',
    offers,
    about: {
      '@type': property.bedrooms ? 'Apartment' : 'Place',
      name: property.title,
      numberOfRooms: property.bedrooms ? Number(property.bedrooms) : undefined,
      floorSize: property.areaSqFt ? {
        '@type': 'QuantitativeValue',
        value: Number(property.areaSqFt),
        unitCode: 'FTK', // square feet
      } : undefined,
      address: {
        '@type': 'PostalAddress',
        addressLocality: locality,
        addressRegion: 'Maharashtra',
        addressCountry: 'IN',
      },
    },
  };
}

/**
 * Generates comprehensive, technically sound, property-specific SEO metadata
 * follows formula: Property Type + Transaction Intent + Locality + Relevant Verified Attribute + Brand
 */
export function generatePropertySeo(property) {
  if (!property) {
    return {
      title: 'Property Not Found | Tomar Enterprises',
      h1: 'Property Not Found',
      subHeading: null,
      description: 'The requested real estate property could not be located in our catalog.',
      canonicalPath: '/properties',
      imageAlt: 'Property not found',
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Properties', url: '/properties' },
      ],
      schema: null,
    };
  }

  const sublocality = resolvePropertyLocation(property);
  const typeName = resolvePropertyTypeName(property);
  const baseHeading = `${typeName} in ${sublocality}`;

  const priceDisplay = property.priceDisplay || property.priceFormatted || (property.price ? `₹${property.price}` : null);
  const areaDisplay = property.areaDisplay || (property.areaSqFt ? `${property.areaSqFt} sq.ft` : null);

  // If the listing has a distinct project/property title that adds real context
  const hasDistinctTitle = property.title &&
    property.title.toLowerCase() !== baseHeading.toLowerCase() &&
    !property.title.toLowerCase().startsWith(baseHeading.toLowerCase());
  const subHeading = hasDistinctTitle ? property.title : null;

  // Title pattern: Example: "1 BHK Resale Flat in Nalasopara West | Tomar Enterprises"
  // If distinct title exists: "1 BHK Resale Flat in Nalasopara West - Sriprastha | Tomar Enterprises"
  const seoTitle = subHeading
    ? `${baseHeading} - ${subHeading} | Tomar Enterprises`
    : `${baseHeading} | Tomar Enterprises`;

  const h1 = baseHeading;

  // Natural human meta description strictly with verified attributes
  const verifiedAttrs = [];
  if (priceDisplay) verifiedAttrs.push(`Price: ${priceDisplay}`);
  if (areaDisplay) verifiedAttrs.push(`Carpet Area: ${areaDisplay}`);
  if (property.possessionDisplay || property.possessionStatus) {
    verifiedAttrs.push(`Possession: ${(property.possessionDisplay || property.possessionStatus).replace('-', ' ')}`);
  }
  const attrText = verifiedAttrs.length > 0 ? ` (${verifiedAttrs.join(', ')})` : '';

  const cleanDescription = property.description
    ? property.description.replace(/\s+/g, ' ').trim()
    : `Verified ${typeName.toLowerCase()} in ${sublocality}.`;

  const metaDescription = `${baseHeading}${attrText}. ${cleanDescription} Connect with MahaRERA registered advisor Tomar Enterprises for inspection.`
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  const canonicalPath = `/properties/${property.slug || property.id}`;
  const imageAlt = `${baseHeading}${priceDisplay ? ` - ${priceDisplay}` : ''} - Tomar Enterprises`;

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Properties', url: '/properties' },
    { name: sublocality, url: `/locations/${property.locality}` },
    { name: baseHeading, url: canonicalPath },
  ];

  return {
    title: seoTitle,
    h1,
    subHeading,
    description: metaDescription,
    canonicalPath,
    imageAlt,
    breadcrumbs,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        buildPropertyListingSchema(property, canonicalPath),
        buildBreadcrumbSchema(breadcrumbs),
      ].filter(Boolean),
    },
  };
}
