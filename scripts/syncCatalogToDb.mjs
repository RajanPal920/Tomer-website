import { sampleProperties } from '../src/data/properties.js';
import { query, get, run } from '../server/db/index.js';

async function main() {
  console.log('[SYNC] Starting catalog sync to database...');
  let inserted = 0;
  let updated = 0;

  for (const p of sampleProperties) {
    const existing = await get('SELECT id, slug FROM properties WHERE id = ?', [p.id]);
    const gallery = Array.isArray(p.gallery) ? JSON.stringify(p.gallery) : JSON.stringify([p.image || '']);
    const features = Array.isArray(p.features) ? JSON.stringify(p.features) : JSON.stringify([]);

    if (!existing) {
      await run(
        `INSERT INTO properties (
          id, slug, title, category, transaction_type, locality, sub_location, address,
          price, price_display, price_per_sqft, price_number, monthly_rent, deposit_amount,
          lease_term, area_sqft, area_display, area_unit, bedrooms, bathrooms, furnishing,
          possession_status, image, gallery, features, description, status, featured,
          is_demo, is_verified, internal_notes, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )`,
        [
          p.id,
          p.slug,
          p.title,
          p.category,
          p.transactionType,
          p.locality,
          p.subLocation,
          p.address || '',
          p.price || '',
          p.priceDisplay || p.price || 'Price on Request',
          p.pricePerSqft || null,
          p.price ? Number(p.price) : null,
          null,
          null,
          null,
          p.areaSqFt || null,
          p.areaDisplay || null,
          p.areaUnit || 'sq.ft',
          p.bedrooms || null,
          p.bathrooms || null,
          p.furnishing || null,
          p.possessionStatus || 'Ready to Move',
          p.image,
          gallery,
          features,
          p.description || '',
          'published',
          p.featured ? 1 : 0,
          1,
          1,
          '',
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
      inserted++;
    } else {
      // Keep title, description, locality, and subLocation up to date
      await run(
        `UPDATE properties SET
          title = ?,
          description = ?,
          locality = ?,
          sub_location = ?,
          category = ?,
          transaction_type = ?,
          price_display = ?,
          image = ?,
          gallery = ?,
          features = ?,
          updated_at = ?
         WHERE id = ?`,
        [
          p.title,
          p.description || '',
          p.locality,
          p.subLocation,
          p.category,
          p.transactionType,
          p.priceDisplay || p.price || 'Price on Request',
          p.image,
          gallery,
          features,
          new Date().toISOString(),
          p.id,
        ]
      );
      updated++;
    }
  }

  console.log(`[SYNC] Done! Inserted: ${inserted}, Updated: ${updated}`);

  const counts = await query(
    'SELECT locality, COUNT(*) as count FROM properties WHERE status = ? GROUP BY locality ORDER BY count DESC',
    ['published']
  );
  console.log('[SYNC] Current Database published inventory by locality:');
  counts.forEach((c) => console.log(`  - ${c.locality}: ${c.count} properties`));

  process.exit(0);
}

main().catch((err) => {
  console.error('[SYNC ERROR]:', err);
  process.exit(1);
});
