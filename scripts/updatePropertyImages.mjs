// Update property image mapping to eliminate duplicate image clusters
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROPS_FILE = path.join(__dirname, '..', 'src', 'data', 'properties.js');

const mapping = {
  // Lease / Heavy Deposit
  'demo-nalasopara-heavy-dep-003': '/images/buildingImages/image copy 5.png',
  'demo-nalasopara-lease-prop-001': '/images/buildingImages/image copy 6.png',
  'demo-vasai-lease-prop-002': '/images/hero/hero-interior.jpg',
  'demo-virar-lease-prop-003': '/images/buildingImages/image copy 2.png',
  'demo-vasai-lease-shop-001': '/images/buildingImages/image copy 5.png',
  'demo-virar-lease-shop-002': '/images/buildingImages/image copy 6.png',
  'demo-nalasopara-lease-shop-003': '/images/buildingImages/image copy 27.png',
  'demo-vasai-lease-off-001': '/images/hero/hero-interior.jpg',
  'demo-virar-lease-off-002': '/images/hero/hero-apartments.jpg',
  'demo-boisar-lease-off-003': '/images/buildingImages/image copy 2.png',
  'demo-vasai-lease-comm-001': '/images/hero/hero-commercial.jpg',
  'demo-virar-lease-comm-002': '/images/hero/hero-apartments.jpg',
  'demo-boisar-lease-comm-003': '/images/buildingImages/image copy 6.png',

  // Commercial Shops & Offices
  'demo-vasai-shop-002': '/images/hero/hero-commercial.jpg',
  'demo-nalasopara-shop-001': '/images/buildingImages/image copy 2.png',
  'demo-vasai-office-001': '/images/hero/hero-interior.jpg',
  'demo-virar-office-002': '/images/hero/hero-commercial.jpg',
  'demo-boisar-office-003': '/images/hero/hero-development.jpg',
  'demo-vasai-comm-prop-001': '/images/hero/hero-development.jpg',
  'demo-virar-comm-prop-002': '/images/buildingImages/image copy 5.png',
  'demo-palghar-comm-prop-003': '/images/buildingImages/image copy 6.png',

  // Plots & Land
  'demo-boisar-na-plot-002': '/images/buildingImages/image copy 22.png',
  'demo-virar-na-plot-003': '/images/buildingImages/image copy 23.png',
  'demo-boisar-ind-001': '/images/hero/hero-land.jpg',
  'demo-boisar-ind-002': '/images/buildingImages/image copy 22.png',
  'demo-palghar-ind-003': '/images/hero/hero-land.jpg',
};

let content = fs.readFileSync(PROPS_FILE, 'utf-8');

// For each id in mapping, find its block and update "image": "..."
for (const [id, newImg] of Object.entries(mapping)) {
  // Find id in content
  const idIndex = content.indexOf(`"id": "${id}"`);
  if (idIndex === -1) {
    console.warn(`Could not find id "${id}"`);
    continue;
  }
  // Find "image": "..." after idIndex
  const imgMatch = content.slice(idIndex, idIndex + 1200).match(/"image":\s*"([^"]+)"/);
  if (imgMatch) {
    const oldImgStr = imgMatch[0];
    const newImgStr = `"image": "${newImg}"`;
    const targetSub = content.slice(idIndex, idIndex + 1200);
    const updatedSub = targetSub.replace(oldImgStr, newImgStr);
    content = content.slice(0, idIndex) + updatedSub + content.slice(idIndex + 1200);
    console.log(`Updated ${id} -> ${newImg}`);
  }
}

fs.writeFileSync(PROPS_FILE, content, 'utf-8');
console.log('Successfully updated properties.js with deduplicated images.');
