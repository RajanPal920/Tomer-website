import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, get, run } from '../server/db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newPalgharProperties = [
  {
    id: "demo-palghar-plot-004",
    title: "Palghar Green Acres Gated NA Plotted Scheme",
    slug: "palghar-green-acres-gated-na-plotted-scheme",
    category: "residential-plot",
    transactionType: "plots-land",
    locality: "palghar",
    subLocation: "Manor-Palghar Road, Palghar East",
    price: 1950000,
    priceDisplay: "₹19.50 Lakh",
    priceNumber: 1950000,
    pricePerSqft: "₹1,344 / sq.ft",
    areaSqFt: 1450,
    areaDisplay: "1,450 sq.ft (approx. 1.33 Guntha)",
    bedrooms: null,
    bathrooms: 0,
    balcony: 0,
    floor: "Gated Residential NA Plot",
    furnishing: "unfurnished",
    possessionStatus: "ready-to-move",
    possessionDisplay: "Immediate Registry & Demarcation",
    parking: "Internal Tar Road Access",
    image: "/images/properties/prop-palghar-green-acres.jpg",
    gallery: [
      "/images/properties/prop-palghar-green-acres.jpg",
      "/images/properties/prop-palghar-manor-highway.jpg"
    ],
    features: [
      "Palghar Collector Sanctioned Residential NA Order",
      "Individual 7/12 Extract with Clear Title",
      "Gated Perimeter Wall & Demarcation Boundary Stones",
      "Internal Asphalt Road, Street Lights & Water Point"
    ],
    description: "Clear-title collector sanctioned residential NA plot in Palghar Green Acres along the expanding Manor-Palghar Road. Fully demarcated with boundary stones, tar road access, and verified 7/12 document.",
    featured: true,
    isDemo: false
  },
  {
    id: "demo-palghar-plot-005",
    title: "Palghar Manor Highway Plotted Layout & Agro Land",
    slug: "palghar-manor-highway-plotted-layout-agro-land",
    category: "na-plot",
    transactionType: "plots-land",
    locality: "palghar",
    subLocation: "NH-48 Link Road, Palghar East",
    price: 2200000,
    priceDisplay: "₹22.00 Lakh",
    priceNumber: 2200000,
    pricePerSqft: "₹1,222 / sq.ft",
    areaSqFt: 1800,
    areaDisplay: "1,800 sq.ft (approx. 1.65 Guntha)",
    bedrooms: null,
    bathrooms: 0,
    balcony: 0,
    floor: "Collector Approved NA Plot",
    furnishing: "unfurnished",
    possessionStatus: "ready-to-move",
    possessionDisplay: "Immediate Handover & 7/12",
    parking: "Direct 40-Ft Highway Approach Road",
    image: "/images/properties/prop-palghar-manor-highway.jpg",
    gallery: [
      "/images/properties/prop-palghar-manor-highway.jpg",
      "/images/properties/prop-palghar-green-acres.jpg"
    ],
    features: [
      "Direct Highway Approach with High Capital Growth",
      "Scenic Sahyadri Mountain Views",
      "Individual Electricity Feeder & Sweet Borewell Water",
      "Ready for Immediate Bungalow Construction"
    ],
    description: "Spacious 1,800 sq.ft collector NA plot with scenic Sahyadri mountain views. Prime access to Manor-Palghar highway, ideal for immediate villa construction or long-term capital appreciation.",
    featured: true,
    isDemo: false
  },
  {
    id: "demo-palghar-plot-006",
    title: "Palghar Mahim Road Collector Approved NA Plot",
    slug: "palghar-mahim-road-collector-approved-na-plot",
    category: "residential-plot",
    transactionType: "plots-land",
    locality: "palghar",
    subLocation: "Mahim Road, Palghar West",
    price: 2800000,
    priceDisplay: "₹28.00 Lakh",
    priceNumber: 2800000,
    pricePerSqft: "₹1,513 / sq.ft",
    areaSqFt: 1850,
    areaDisplay: "1,850 sq.ft (approx. 1.7 Guntha)",
    bedrooms: null,
    bathrooms: 0,
    balcony: 0,
    floor: "Independent NA Land Parcel",
    furnishing: "unfurnished",
    possessionStatus: "ready-to-move",
    possessionDisplay: "Immediate Registry & Physical Handover",
    parking: "Dedicated Car Driveway & Gate",
    image: "/images/buildingImages/image copy 20.png",
    gallery: [
      "/images/buildingImages/image copy 20.png",
      "/images/properties/prop-palghar-green-acres.jpg"
    ],
    features: [
      "7 Mins from Palghar Railway Station & Collectorate",
      "Collector Sanctioned Plan with Clear Zone Conversion",
      "Municipal Water Connection Feasibility",
      "Bank Loan Availability from Nationalized Banks"
    ],
    description: "Prime residential NA plot on Mahim Road, Palghar West, within 7 minutes of the district administrative collectorate and Palghar railway station. Excellent residential neighborhood with municipal water provision.",
    featured: false,
    isDemo: false
  },
  {
    id: "demo-palghar-plot-007",
    title: "Palghar Hillview Country Villa Plotted Estate",
    slug: "palghar-hillview-country-villa-plotted-estate",
    category: "residential-plot",
    transactionType: "plots-land",
    locality: "palghar",
    subLocation: "Tembhode, Palghar West",
    price: 2650000,
    priceDisplay: "₹26.50 Lakh",
    priceNumber: 2650000,
    pricePerSqft: "₹1,261 / sq.ft",
    areaSqFt: 2100,
    areaDisplay: "2,100 sq.ft (approx. 1.93 Guntha)",
    bedrooms: null,
    bathrooms: 0,
    balcony: 0,
    floor: "Gated Villa Layout Plot",
    furnishing: "unfurnished",
    possessionStatus: "ready-to-move",
    possessionDisplay: "Immediate Registry",
    parking: "Private Compound Entry",
    image: "/images/buildingImages/image copy 22.png",
    gallery: [
      "/images/buildingImages/image copy 22.png",
      "/images/properties/prop-palghar-manor-highway.jpg"
    ],
    features: [
      "Gated Community with 24x7 Security & Caretaker",
      "Tranquil Green Environment with Fruit Trees",
      "Wide Internal Concrete Roads & Drainage",
      "Independent Water Borewell & Power Supply"
    ],
    description: "Serene 2,100 sq.ft residential villa plot in a gated countryside layout at Tembhode, Palghar West. Fully fenced with concrete poles, landscaped tree lines, and peaceful natural surroundings.",
    featured: false,
    isDemo: false
  },
  {
    id: "demo-palghar-plot-008",
    title: "Palghar Station Enclave High-Potential Plotted Layout",
    slug: "palghar-station-enclave-high-potential-plotted-layout",
    category: "na-plot",
    transactionType: "plots-land",
    locality: "palghar",
    subLocation: "Station Road Belt, Palghar East",
    price: 2950000,
    priceDisplay: "₹29.50 Lakh",
    priceNumber: 2950000,
    pricePerSqft: "₹1,787 / sq.ft",
    areaSqFt: 1650,
    areaDisplay: "1,650 sq.ft (approx. 1.51 Guntha)",
    bedrooms: null,
    bathrooms: 0,
    balcony: 0,
    floor: "Collector Approved NA Plot",
    furnishing: "unfurnished",
    possessionStatus: "ready-to-move",
    possessionDisplay: "Immediate Possession & Transfer",
    parking: "Tar Road Frontage",
    image: "/images/buildingImages/image copy 24.png",
    gallery: [
      "/images/buildingImages/image copy 24.png",
      "/images/properties/prop-palghar-green-acres.jpg"
    ],
    features: [
      "Only 8 Minutes to Palghar Railway Station",
      "High Resale Liquidity & Rapid Urban Development",
      "Collector Approved Clear-Title NA Sanction",
      "Underground Electric Cabling & Water Supply Ready"
    ],
    description: "Strategically positioned 1,650 sq.ft collector NA plot just 8 minutes from Palghar Railway Station. Outstanding connectivity to express trains, educational institutions, and district court.",
    featured: false,
    isDemo: false
  }
];

async function updatePropertiesFile() {
  const filePath = path.resolve(__dirname, '../src/data/properties.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Fix the 10 string prices in Saphale/Kelve Road
  const priceFixes = [
    { id: 'demo-saphale-villa-004', price: 6800000 },
    { id: 'demo-saphale-farm-005', price: 2650000 },
    { id: 'demo-saphale-residency-006', price: 2450000 },
    { id: 'demo-saphale-comm-007', price: 3800000 },
    { id: 'demo-saphale-retreat-008', price: 4950000 },
    { id: 'demo-kelve-coastal-003', price: 8500000 },
    { id: 'demo-kelve-resort-plot-004', price: 3850000 },
    { id: 'demo-kelve-enclave-005', price: 2900000 },
    { id: 'demo-kelve-cafe-006', price: 4200000 },
    { id: 'demo-kelve-na-plot-007', price: 3150000 },
  ];

  for (const pf of priceFixes) {
    const idIdx = content.indexOf(`"id": "${pf.id}"`);
    if (idIdx !== -1) {
      const nextEnd = content.indexOf('},', idIdx);
      const block = content.slice(idIdx, nextEnd);
      const updatedBlock = block.replace(/"price":\s*"[^"]+"/, `"price": ${pf.price}`);
      content = content.slice(0, idIdx) + updatedBlock + content.slice(nextEnd);
    }
  }

  // 2. Check if Palghar plots already present
  if (!content.includes('"id": "demo-palghar-plot-004"')) {
    const lastArrayClose = content.lastIndexOf('];');
    const newItemsJson = newPalgharProperties.map(p => JSON.stringify(p, null, 2)).join(',\n  ');
    content = content.slice(0, lastArrayClose) + ',\n  ' + newItemsJson + '\n' + content.slice(lastArrayClose);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated src/data/properties.js');
}

async function updateDatabase() {
  await initDatabase();

  // Fix existing string prices in SQLite DB
  const priceFixes = [
    { id: 'demo-saphale-villa-004', price: 6800000 },
    { id: 'demo-saphale-farm-005', price: 2650000 },
    { id: 'demo-saphale-residency-006', price: 2450000 },
    { id: 'demo-saphale-comm-007', price: 3800000 },
    { id: 'demo-saphale-retreat-008', price: 4950000 },
    { id: 'demo-kelve-coastal-003', price: 8500000 },
    { id: 'demo-kelve-resort-plot-004', price: 3850000 },
    { id: 'demo-kelve-enclave-005', price: 2900000 },
    { id: 'demo-kelve-cafe-006', price: 4200000 },
    { id: 'demo-kelve-na-plot-007', price: 3150000 },
  ];

  for (const pf of priceFixes) {
    await run('UPDATE properties SET price = ? WHERE id = ?', [pf.price, pf.id]);
  }

  // Insert new Palghar properties
  let inserted = 0;
  for (const p of newPalgharProperties) {
    const existing = await get('SELECT id FROM properties WHERE id = ?', [p.id]);
    if (!existing) {
      await run(
        `INSERT INTO properties (
          id, slug, title, category, transaction_type, locality, sub_location,
          price, price_display, price_number, price_per_sqft, area_sqft, area_display,
          bedrooms, bathrooms, possession_status, image, gallery, features,
          description, status, featured, is_demo, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.slug,
          p.title,
          p.category,
          p.transactionType,
          p.locality,
          p.subLocation,
          p.price,
          p.priceDisplay,
          p.priceNumber || null,
          p.pricePerSqft || null,
          p.areaSqFt || null,
          p.areaDisplay || null,
          p.bedrooms || null,
          p.bathrooms || null,
          p.possessionStatus || 'ready-to-move',
          p.image,
          JSON.stringify(p.gallery || [p.image]),
          JSON.stringify(p.features || []),
          p.description,
          'published',
          p.featured ? 1 : 0,
          0,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );
      inserted++;
    }
  }

  const total = await get('SELECT count(*) as count FROM properties');
  console.log('Inserted new Palghar properties into DB:', inserted);
  console.log('Total properties now in DB:', total.count);
}

async function main() {
  await updatePropertiesFile();
  await updateDatabase();
  console.log('All updates completed successfully.');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
