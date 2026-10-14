import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const propertiesFile = path.resolve(__dirname, '../src/data/properties.js');

const module = await import('../src/data/properties.js');
const sampleProperties = module.sampleProperties;

// Categorized asset pools
const flatElevations = [
  '/images/buildingImages/build1.png',
  '/images/buildingImages/build2.png',
  '/images/buildingImages/image copy 10.png',
  '/images/buildingImages/image copy 11.png',
  '/images/buildingImages/image copy 12.png',
  '/images/buildingImages/image copy 13.png',
  '/images/buildingImages/image copy 14.png',
  '/images/buildingImages/image copy 15.png',
  '/images/buildingImages/image copy 28.png',
  '/images/buildingImages/image.png',
  '/images/buildingImages/image copy.png',
  '/images/buildingImages/image copy 3.png',
  '/images/buildingImages/image copy 4.png',
];

const interiorPool = [
  '/images/buildingImages/image copy 2.png',
  '/images/buildingImages/image copy 5.png',
  '/images/buildingImages/image copy 6.png',
  '/images/buildingImages/image copy 9.png',
  '/images/buildingImages/image copy 22.png',
  '/images/buildingImages/image copy 23.png',
];

const shopPool = [
  '/images/buildingImages/image copy 16.png',
  '/images/buildingImages/image copy 27.png',
  '/images/buildingImages/image copy 8.png',
  '/images/buildingImages/image copy 7.png',
];

const officePool = [
  '/images/buildingImages/image copy 17.png',
  '/images/buildingImages/image copy 9.png',
  '/images/buildingImages/image copy 7.png',
  '/images/buildingImages/image copy 8.png',
];

const villaPool = [
  '/images/buildingImages/image copy 18.png',
  '/images/buildingImages/image copy 19.png',
  '/images/buildingImages/image copy 26.png',
];

const plotPool = [
  '/images/buildingImages/image copy 20.png',
  '/images/buildingImages/image copy 24.png',
  '/images/buildingImages/image copy 25.png',
  '/images/buildingImages/image copy 21.png',
];

let flatIdx = 0;
let shopIdx = 0;
let officeIdx = 0;
let villaIdx = 0;
let plotIdx = 0;

const updated = sampleProperties.map((p) => {
  const item = { ...p };

  if (item.category === 'residential-property') {
    const primary = villaPool[villaIdx % villaPool.length];
    villaIdx++;
    item.image = primary;
    item.gallery = [primary, ...villaPool.filter(img => img !== primary), ...interiorPool.slice(0, 2)];
  } else if (item.category === 'commercial-shop' || item.category === 'shop-rent') {
    const primary = shopPool[shopIdx % shopPool.length];
    shopIdx++;
    item.image = primary;
    item.gallery = [primary, ...shopPool.filter(img => img !== primary)];
  } else if (item.category === 'commercial-office' || item.category === 'office-rent') {
    const primary = officePool[officeIdx % officePool.length];
    officeIdx++;
    item.image = primary;
    item.gallery = [primary, ...officePool.filter(img => img !== primary)];
  } else if (item.category === 'commercial-property') {
    const pool = [...shopPool, ...officePool];
    const primary = pool[(shopIdx + officeIdx) % pool.length];
    item.image = primary;
    item.gallery = [primary, ...pool.filter(img => img !== primary)];
  } else if (item.category === 'residential-plot' || item.category === 'na-plot' || item.category === 'industrial-plot') {
    const primary = plotPool[plotIdx % plotPool.length];
    plotIdx++;
    item.image = primary;
    item.gallery = [primary, ...plotPool.filter(img => img !== primary)];
  } else {
    // Residential flats
    const primary = flatElevations[flatIdx % flatElevations.length];
    flatIdx++;
    const gInts = [
      interiorPool[(flatIdx) % interiorPool.length],
      interiorPool[(flatIdx + 1) % interiorPool.length],
      interiorPool[(flatIdx + 2) % interiorPool.length],
    ];
    item.image = primary;
    item.gallery = [primary, ...gInts];
  }

  return item;
});

const header = `// Centralized Property Dataset for Tomar Enterprises
// Standardized schema covering Vasai to Palghar corridor (Vasai, Nalasopara, Virar, Vaitarna, Saphale, Kelve Road, Palghar)
// Sourced from client assets & curated catalog for Tomar Enterprises.

export const TRANSACTION_TYPES = ${JSON.stringify(module.TRANSACTION_TYPES, null, 2)};

export const CATEGORIES_BY_TRANSACTION = ${JSON.stringify(module.CATEGORIES_BY_TRANSACTION, null, 2)};

export const sampleProperties = ${JSON.stringify(updated, null, 2)};
`;

fs.writeFileSync(propertiesFile, header, 'utf8');
console.log(`Successfully redistributed images across ${updated.length} properties.`);
