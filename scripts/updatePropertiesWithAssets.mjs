import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const propertiesFile = path.resolve(__dirname, '../src/data/properties.js');

// Dynamic import the current properties
const module = await import('../src/data/properties.js');
const sampleProperties = module.sampleProperties;

// Verified asset pools
const flatElevations = [
  '/images/buildingImages/build1.png',
  '/images/buildingImages/build2.png',
  '/images/buildingImages/image copy 15.png',
  '/images/buildingImages/image copy 28.png',
  '/images/buildingImages/image copy 14.png',
];

const flatInteriors = [
  '/images/buildingImages/image copy.png',     // Living room
  '/images/buildingImages/image copy 2.png',   // Modular kitchen
  '/images/buildingImages/image.png',          // Master bedroom
  '/images/buildingImages/image copy 3.png',   // Suite bedroom
  '/images/buildingImages/image copy 4.png',   // Guest bedroom
  '/images/buildingImages/image copy 5.png',   // Bathroom
  '/images/buildingImages/image copy 9.png',   // Dining lounge
  '/images/buildingImages/image copy 11.png',  // Balcony deck
  '/images/buildingImages/image copy 12.png',  // Kitchen
  '/images/buildingImages/image copy 13.png',  // Master bath
  '/images/buildingImages/image copy 22.png',  // Rooftop gym
  '/images/buildingImages/image copy 23.png',  // Yoga deck
  '/images/buildingImages/image copy 26.png',  // Living hall balcony
];

const villaImages = [
  '/images/buildingImages/image copy 18.png',  // Standalone villa elevation
  '/images/buildingImages/image copy 19.png',  // High ceiling bungalow hall
  '/images/buildingImages/image copy 3.png',   // Suite bedroom
  '/images/buildingImages/image copy 23.png',  // Garden deck
];

const shopImages = [
  '/images/buildingImages/image copy 16.png',  // Shopping arcade retail
  '/images/buildingImages/image copy 27.png',  // High street retail plaza
  '/images/buildingImages/image copy 7.png',   // Commercial lobby
  '/images/buildingImages/image copy 8.png',   // Concourse
];

const officeImages = [
  '/images/buildingImages/image copy 17.png',  // Corporate office suite
  '/images/buildingImages/image copy 7.png',   // Reception lobby
  '/images/buildingImages/image copy 8.png',   // Lift lobby
];

const commPropImages = [
  '/images/buildingImages/image copy 27.png',
  '/images/buildingImages/image copy 16.png',
  '/images/buildingImages/image copy 17.png',
  '/images/buildingImages/image copy 7.png',
];

const plotImages = [
  '/images/buildingImages/image copy 20.png',  // Sanctioned NA plot layout
  '/images/buildingImages/image copy 24.png',  // Grand entrance gate
  '/images/buildingImages/image copy 25.png',  // Surrounding nature/podium
];

const industrialImages = [
  '/images/buildingImages/image copy 21.png',  // Industrial plot boundary
  '/images/buildingImages/image copy 20.png',
  '/images/buildingImages/image copy 24.png',
];

let flatIdx = 0;
let shopIdx = 0;
let officeIdx = 0;
let plotIdx = 0;
let indIdx = 0;
let villaIdx = 0;

const updatedProperties = sampleProperties.map((p, index) => {
  const item = { ...p };

  // Adjust any 'boisar' to Palghar or Saphale within the approved corridor
  if (item.locality === 'boisar') {
    if (item.category === 'residential-property' || item.title.includes('Row House')) {
      item.locality = 'saphale';
      item.subLocation = item.subLocation.replace(/Boisar/gi, 'Saphale');
      item.slug = item.slug.replace(/boisar/gi, 'saphale');
    } else {
      item.locality = 'palghar';
      item.subLocation = item.subLocation.replace(/Boisar/gi, 'Palghar');
      item.slug = item.slug.replace(/boisar/gi, 'palghar');
    }
  }

  // Assign appropriate asset according to category
  if (item.category === 'residential-property') {
    item.image = villaImages[0];
    item.gallery = villaImages;
  } else if (item.category === 'commercial-shop' || item.category === 'shop-rent') {
    const primary = shopImages[shopIdx % shopImages.length];
    shopIdx++;
    item.image = primary;
    item.gallery = [primary, ...shopImages.filter(img => img !== primary)];
  } else if (item.category === 'commercial-office' || item.category === 'office-rent') {
    const primary = officeImages[officeIdx % officeImages.length];
    officeIdx++;
    item.image = primary;
    item.gallery = [primary, ...officeImages.filter(img => img !== primary)];
  } else if (item.category === 'commercial-property') {
    const primary = commPropImages[shopIdx % commPropImages.length];
    shopIdx++;
    item.image = primary;
    item.gallery = [primary, ...commPropImages.filter(img => img !== primary)];
  } else if (item.category === 'residential-plot' || item.category === 'na-plot') {
    const primary = plotImages[plotIdx % plotImages.length];
    plotIdx++;
    item.image = primary;
    item.gallery = [primary, ...plotImages.filter(img => img !== primary)];
  } else if (item.category === 'industrial-plot') {
    const primary = industrialImages[indIdx % industrialImages.length];
    indIdx++;
    item.image = primary;
    item.gallery = [primary, ...industrialImages.filter(img => img !== primary)];
  } else {
    // Residential flats (new-flat, resale-flat, flat-rent, lease-property)
    const elev = flatElevations[flatIdx % flatElevations.length];
    flatIdx++;
    // Pick 3-4 distinct interior images for gallery
    const int1 = flatInteriors[(flatIdx * 2) % flatInteriors.length];
    const int2 = flatInteriors[(flatIdx * 2 + 1) % flatInteriors.length];
    const int3 = flatInteriors[(flatIdx * 2 + 2) % flatInteriors.length];
    const int4 = flatInteriors[(flatIdx * 2 + 3) % flatInteriors.length];
    
    item.image = elev;
    item.gallery = [elev, int1, int2, int3, int4].filter((v, i, a) => a.indexOf(v) === i);
  }

  return item;
});

// Write updated properties.js
const header = `// Centralized Property Dataset for Tomar Enterprises
// Standardized schema covering Vasai to Palghar corridor (Vasai, Nalasopara, Virar, Vaitarna, Saphale, Kelve Road, Palghar)
// Sourced from client assets & curated catalog for Tomar Enterprises.

export const TRANSACTION_TYPES = ${JSON.stringify(module.TRANSACTION_TYPES, null, 2)};

export const CATEGORIES_BY_TRANSACTION = ${JSON.stringify(module.CATEGORIES_BY_TRANSACTION, null, 2)};

export const sampleProperties = ${JSON.stringify(updatedProperties, null, 2)};
`;

fs.writeFileSync(propertiesFile, header, 'utf8');
console.log(`Successfully updated ${updatedProperties.length} properties with local client assets.`);
