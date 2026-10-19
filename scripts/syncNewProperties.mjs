import { initDatabase, get, run } from '../server/db/index.js';
import { sampleProperties } from '../src/data/properties.js';

async function main() {
  await initDatabase();
  let inserted = 0;
  for (const p of sampleProperties) {
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
  console.log('Inserted new properties into DB:', inserted);
  console.log('Total properties now in DB:', total.count);
  process.exit(0);
}

main().catch(err => {
  console.error('Sync error:', err);
  process.exit(1);
});
