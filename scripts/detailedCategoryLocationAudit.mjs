import { getAllProperties } from '../src/data/properties.js';
import { APPROVED_STATIONS } from '../src/data/locations.js';
import { filterProperties, isCategoryMatch, isLocalityMatch } from '../src/services/propertySearch.js';
import { query } from '../server/db/index.js';

// The 9 base property categories + 3 rollups:
export const AUDIT_CATEGORIES = [
  { id: 'all', label: 'All Properties', isRollup: true },
  { id: 'flats', label: 'Flats / Apartments', isRollup: true },
  { id: 'new-flat', label: 'New Flats / New Homes', isRollup: false, transactionType: 'buy' },
  { id: 'resale-flat', label: 'Resale Properties', isRollup: false, transactionType: 'buy' },
  { id: 'flat-rent', label: 'Rental Properties', isRollup: false, transactionType: 'rent' },
  { id: 'commercial-shop', label: 'Commercial Shops', isRollup: false, transactionType: 'commercial' },
  { id: 'commercial-office', label: 'Offices', isRollup: false, transactionType: 'commercial' },
  { id: 'commercial', label: 'Commercial Spaces', isRollup: true, transactionType: 'commercial' },
  { id: 'residential-plot', label: 'Residential Plots', isRollup: false, transactionType: 'plots-land' },
  { id: 'industrial-plot', label: 'Industrial Plots', isRollup: false, transactionType: 'plots-land' },
  { id: 'na-plot', label: 'Land / NA Plots', isRollup: false, transactionType: 'plots-land' },
  { id: 'lease-property', label: 'Lease / Heavy Deposit', isRollup: false, transactionType: 'lease' },
];

async function main() {
  const allProps = getAllProperties();
  const dbProps = await query('SELECT * FROM properties');

  console.log(`\nCatalog properties count: ${allProps.length}`);
  console.log(`Database properties count: ${dbProps.length}`);

  const report = [];

  for (const st of APPROVED_STATIONS) {
    for (const cat of AUDIT_CATEGORIES) {
      // Find matches in catalog
      const matchesCatalog = allProps.filter((p) => {
        // Exclude archived/sold/draft unless public
        const s = String(p.status || '').toLowerCase();
        if (s === 'archived' || s === 'draft') return false;
        if (!isLocalityMatch(p.locality, st.locationId)) return false;
        return isCategoryMatch(p, cat.id);
      });

      const count = matchesCatalog.length;
      const needed = Math.max(0, 2 - count);

      report.push({
        locationId: st.locationId,
        locationName: st.canonicalName,
        categoryId: cat.id,
        categoryLabel: cat.label,
        isRollup: cat.isRollup,
        currentCount: count,
        needed,
        existingIds: matchesCatalog.map(m => m.id),
      });
    }
  }

  console.log('\n--- BASE CATEGORIES AUDIT TABLE (Needs to be >= 2) ---');
  const baseCategories = report.filter(r => !r.isRollup);
  
  const summaryByLoc = {};
  let totalNewNeeded = 0;

  for (const r of baseCategories) {
    if (!summaryByLoc[r.locationName]) {
      summaryByLoc[r.locationName] = { location: r.locationName, totalNeeded: 0, deficientCategories: [] };
    }
    if (r.needed > 0) {
      summaryByLoc[r.locationName].totalNeeded += r.needed;
      summaryByLoc[r.locationName].deficientCategories.push(`${r.categoryLabel}: have ${r.currentCount}, need +${r.needed}`);
      totalNewNeeded += r.needed;
    }
  }

  console.table(Object.values(summaryByLoc).map(s => ({
    Location: s.location,
    'Total New Needed': s.totalNeeded,
    'Deficient Categories': s.deficientCategories.join(' | ')
  })));

  console.log(`\nTOTAL NEW DEMO PROPERTIES NEEDED: ${totalNewNeeded}`);
}

main().catch(console.error);
