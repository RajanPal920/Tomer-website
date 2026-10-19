import assert from 'node:assert';
import { APPROVED_STATIONS, LOCATION_DROPDOWN_OPTIONS, resolveCanonicalLocation } from '../src/data/locations.js';
import { LOCALITY_OPTIONS } from '../src/data/localities.js';
import { sampleProperties } from '../src/data/properties.js';
import { filterProperties } from '../src/services/propertySearch.js';
import fs from 'node:fs';

console.log('--- VERIFYING SEARCH PANEL, BOISAR AND TYPOGRAPHY ---');

// 1. Verify Vaitarna is NOT in LOCATION_DROPDOWN_OPTIONS
const dropdownIds = LOCATION_DROPDOWN_OPTIONS.map(o => o.id);
console.log('Location Dropdown Options:', dropdownIds);
assert(!dropdownIds.includes('vaitarna'), 'Vaitarna should NOT be in LOCATION_DROPDOWN_OPTIONS');
assert(dropdownIds.includes('boisar'), 'Boisar must be in LOCATION_DROPDOWN_OPTIONS');
assert.strictEqual(dropdownIds.length, 8, 'Expected "all" + 7 approved stations');
console.log('✅ LOCATION_DROPDOWN_OPTIONS correctly has 7 corridor stations including Boisar, and excludes Vaitarna');

// 2. Verify LOCALITY_OPTIONS in localities.js mirrors LOCATION_DROPDOWN_OPTIONS
const localityOptionIds = LOCALITY_OPTIONS.map(o => o.id);
assert(!localityOptionIds.includes('vaitarna'), 'Vaitarna should NOT be in LOCALITY_OPTIONS');
assert(localityOptionIds.includes('boisar'), 'Boisar must be in LOCALITY_OPTIONS');
console.log('✅ LOCALITY_OPTIONS correctly updated');

// 3. Verify backward-compatibility: resolveCanonicalLocation still resolves historical vaitarna
const histVaitarna = resolveCanonicalLocation('vaitarna');
assert(histVaitarna !== null && histVaitarna.canonicalName === 'Vaitarna', 'Historical Vaitarna must resolve for backward compatibility');
console.log('✅ Historical Vaitarna resolves cleanly for backward compatibility');

// 4. Verify Boisar search in filterProperties
const boisarProps = filterProperties(sampleProperties, { locality: 'boisar' });
console.log(`Boisar Properties found in catalog: ${boisarProps.length}`);
assert(boisarProps.length > 0, 'Should find Boisar properties in catalog');

// 5. Verify Quick Searches:
// "Virar Available Flats"
const virarFlats = filterProperties(sampleProperties, { transactionType: 'buy', locality: 'virar', category: 'flats', availabilityStatus: 'available' });
assert(virarFlats.length > 0, 'Virar Available Flats should return properties');
console.log(`✅ Quick Search 1 "Virar Available Flats" returns ${virarFlats.length} properties`);

// "Boisar Industrial Plots"
const boisarIndPlots = filterProperties(sampleProperties, { transactionType: 'buy', locality: 'boisar', category: 'industrial-plot' });
assert(boisarIndPlots.length > 0, 'Boisar Industrial Plots should return properties');
console.log(`✅ Quick Search 2 "Boisar Industrial Plots" returns ${boisarIndPlots.length} properties`);

// "Vasai Rental Flats"
const vasaiRent = filterProperties(sampleProperties, { transactionType: 'rent', locality: 'vasai-road', category: 'flats' });
assert(vasaiRent.length > 0, 'Vasai Rental Flats should return properties');
console.log(`✅ Quick Search 3 "Vasai Rental Flats" returns ${vasaiRent.length} properties`);

// "Palghar Ready NA Plots"
const palgharPlots = filterProperties(sampleProperties, { transactionType: 'buy', locality: 'palghar', category: 'na-plot', availabilityStatus: 'ready-to-move' });
assert(palgharPlots.length > 0, 'Palghar Ready NA Plots should return properties');
console.log(`✅ Quick Search 4 "Palghar Ready NA Plots" returns ${palgharPlots.length} properties`);

// 6. Verify Industrial Plot Image File
const imgPath = 'public/images/categories/cat-industrial-plots.jpg';
assert(fs.existsSync(imgPath), 'Industrial plot image must exist on disk');
const stats = fs.statSync(imgPath);
assert(stats.size > 100000, `Industrial plot image size is valid (${stats.size} bytes)`);
console.log(`✅ Industrial Plot Image verified on disk (${stats.size} bytes)`);

// 7. Verify SearchPanel content checks
const searchPanelCode = fs.readFileSync('src/components/SearchPanel.jsx', 'utf-8');
assert(searchPanelCode.includes('Search Any Property from Vasai to Palghar'), 'Heading text must match prompt exactly');
assert(searchPanelCode.includes('Find your ideal home, rental apartment, commercial space, or land with one simple search.'), 'Subtitle must match prompt exactly');
assert(searchPanelCode.includes('LOOKING FOR:'), 'LOOKING FOR label must exist');
assert(searchPanelCode.includes('PROPERTY TYPE'), 'PROPERTY TYPE label must exist');
assert(searchPanelCode.includes('LOCATION'), 'LOCATION label must exist');
assert(searchPanelCode.includes('AVAILABILITY / STATUS'), 'AVAILABILITY / STATUS label must exist');
assert(searchPanelCode.includes('KEYWORD SEARCH'), 'KEYWORD SEARCH label must exist');
assert(searchPanelCode.includes('Search Properties'), 'Search Properties button text must exist');
assert(searchPanelCode.includes('Clear Filters'), 'Clear Filters button text must exist');
assert(searchPanelCode.includes('Boisar Industrial Plots'), 'Boisar Industrial Plots quick search chip must exist');
console.log('✅ SearchPanel.jsx contains all requested elements, labels, heading, and quick search chips');

console.log('--- ALL VERIFICATION CHECKS PASSED SUCCESSFULLY ---');
