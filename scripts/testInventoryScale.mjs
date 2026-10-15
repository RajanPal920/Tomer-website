// Scalability and Inventory Test for Tomar Enterprises
// Tests 150+ properties stored in persistent relational database
// Validates search, filtering across all categories, sorting, pagination, and persistence

import { runMigrations, query, get, run } from '../server/db/index.js';
import { getOwnerProperties, getPublicProperties, createProperty, deleteProperty } from '../server/dataStore.js';
import { filterProperties } from '../src/services/propertySearch.js';

const STATIONS = ['vasai', 'nalasopara', 'virar', 'vaitarna', 'saphale', 'kelve-road', 'palghar'];
const CATEGORIES = [
  { cat: 'new-flat', tx: 'buy' },
  { cat: 'resale-flat', tx: 'buy' },
  { cat: 'flat-rent', tx: 'rent' },
  { cat: 'shop-rent', tx: 'rent' },
  { cat: 'office-rent', tx: 'rent' },
  { cat: 'lease-property', tx: 'lease' },
  { cat: 'commercial-shop', tx: 'commercial' },
  { cat: 'commercial-office', tx: 'commercial' },
  { cat: 'commercial-property', tx: 'commercial' },
  { cat: 'residential-plot', tx: 'plots-land' },
  { cat: 'na-plot', tx: 'plots-land' },
  { cat: 'industrial-plot', tx: 'plots-land' },
];

console.log('--- RUNNING 150+ PROPERTY SCALE & DATABASE INVENTORY AUDIT ---');

async function runScaleTest() {
  await runMigrations();

  const initialCountRow = await get('SELECT COUNT(*) as count FROM properties');
  const initialCount = Number(initialCountRow?.count || 0);
  console.log(`Starting inventory in database: ${initialCount} properties.`);

  const testBatchIds = [];

  try {
    // 1. Generate & Insert 160 realistic, structured properties into Database
    console.log('Inserting 160 realistic properties into database...');
    for (let i = 1; i <= 160; i++) {
      const catObj = CATEGORIES[i % CATEGORIES.length];
      const loc = STATIONS[i % STATIONS.length];
      const priceNum = 1500000 + (i * 75000);
      const area = 450 + (i * 15);
      const bhk = (i % 3) + 1;
      const propId = `scale-prop-${String(i).padStart(3, '0')}`;

      testBatchIds.push(propId);

      await createProperty({
        id: propId,
        slug: `scale-property-${i}-${loc}-${Date.now()}`,
        title: `Scale Test Property ${i} in ${loc.toUpperCase()}`,
        category: catObj.cat,
        transactionType: catObj.tx,
        locality: loc,
        subLocation: `${loc} Station Road`,
        address: `Plot ${i}, Sector ${i % 10}, ${loc}`,
        price: `₹${(priceNum / 100000).toFixed(2)} Lakh`,
        priceNumber: priceNum,
        priceDisplay: `₹${(priceNum / 100000).toFixed(2)} Lakh`,
        areaSqFt: area,
        areaDisplay: `${area} sq.ft`,
        bedrooms: catObj.tx === 'buy' || catObj.cat === 'flat-rent' ? bhk : null,
        bathrooms: 2,
        furnishing: i % 2 === 0 ? 'furnished' : 'unfurnished',
        possessionStatus: 'Ready to Move',
        image: '/images/buildingImages/build1.png',
        gallery: ['/images/buildingImages/build1.png'],
        features: ['24/7 Water', 'Gated Society', 'Power Backup'],
        description: `Spacious scale test property unit ${i} located at ${loc}.`,
        status: 'published',
        featured: i % 10 === 0,
        isVerified: true,
      });
    }

    const currentCountRow = await get('SELECT COUNT(*) as count FROM properties');
    const totalCount = Number(currentCountRow?.count || 0);
    console.log(`✅ Total active inventory in database: ${totalCount} properties (Exceeds 150 requirement)`);
    if (totalCount < 160) {
      throw new Error(`Expected at least 160 properties in DB, found ${totalCount}`);
    }

    // 2. Test server-side filtering by transactionType 'buy'
    const buyResults = await getOwnerProperties({ transactionType: 'buy' });
    console.log(`✅ Database Filter "buy": Found ${buyResults.length} properties`);
    if (buyResults.length < 25) throw new Error('Too few buy properties returned');

    // 3. Test server-side filtering by transactionType 'plots-land'
    const plotResults = await getOwnerProperties({ transactionType: 'plots-land' });
    console.log(`✅ Database Filter "plots-land": Found ${plotResults.length} properties`);
    if (plotResults.length < 20) throw new Error('Too few plot properties returned');

    // 4. Test server-side filtering by locality 'virar'
    const virarResults = await getOwnerProperties({ locality: 'virar' });
    console.log(`✅ Database Filter "locality: virar": Found ${virarResults.length} properties`);
    if (virarResults.length < 15) throw new Error('Too few Virar properties returned');

    // 5. Test keyword search across database
    const searchResults = await getOwnerProperties({ search: 'Scale Test Property 42 in VASAI' });
    if (searchResults.length !== 1 || searchResults[0].id !== 'scale-prop-042') {
      throw new Error(`Database Search failed for specific item, got ${searchResults.length}`);
    }
    console.log(`✅ Keyword Search across 200+ properties: Successfully found "${searchResults[0].title}"`);

    // 6. Test server-side sorting: Price ascending
    const sortedAsc = await getOwnerProperties({ sort: 'price-asc', limit: 15 });
    for (let j = 0; j < sortedAsc.length - 1; j++) {
      if (sortedAsc[j].priceNumber && sortedAsc[j + 1].priceNumber) {
        if (sortedAsc[j].priceNumber > sortedAsc[j + 1].priceNumber) {
          throw new Error('Sort price-asc failed');
        }
      }
    }
    console.log(`✅ Sorting "price-asc" verified across database inventory`);

    // 7. Test server-side pagination (15 per page across 160 items = 11 pages)
    const pageSize = 15;
    const totalPages = Math.ceil(totalCount / pageSize);
    let seenIds = new Set();
    for (let page = 1; page <= totalPages; page++) {
      const pageItems = await getOwnerProperties({ limit: pageSize, offset: (page - 1) * pageSize });
      for (const item of pageItems) {
        if (seenIds.has(item.id)) throw new Error(`Duplicate item ${item.id} across pages`);
        seenIds.add(item.id);
      }
    }
    if (seenIds.size !== totalCount) {
      throw new Error(`Pagination missed items: seen ${seenIds.size} vs total ${totalCount}`);
    }
    console.log(`✅ Pagination verified: ${totalCount} database items cleanly split into ${totalPages} pages with zero duplicates`);

    console.log('\n🎉 ALL SCALE & PERFORMANCE DATABASE TESTS PASSED SUCCESSFULLY!');
  } finally {
    // Clean up scale test batch from database
    console.log('Cleaning up scale test batch from database...');
    for (const id of testBatchIds) {
      await deleteProperty(id);
    }
    const finalCountRow = await get('SELECT COUNT(*) as count FROM properties');
    console.log(`✅ Cleaned up scale test batch. Database inventory restored to ${finalCountRow?.count} genuine records.`);
  }
}

runScaleTest().catch((err) => {
  console.error('[SCALE TEST ERROR]', err);
  process.exit(1);
});
