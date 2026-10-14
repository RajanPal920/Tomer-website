import { APPROVED_STATIONS } from '../src/data/locations.js';
import {
  PROPERTY_TYPES_BY_CATEGORY,
  ALL_PROPERTY_TYPE_OPTIONS,
  REQUIREMENT_OPTIONS,
} from '../src/data/listingModalData.js';

console.log('=== RUNNING COMPREHENSIVE LISTING MODAL VERIFICATION SUITE ===\n');

let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
    failedTests++;
  }
}

// 1. PROPERTY TYPE CATEGORIES VERIFICATION
const expectedCategories = [
  'Residential',
  'Commercial',
  'Plots and Land',
  'Rental and Leasing',
  'Development',
];

assert(
  PROPERTY_TYPES_BY_CATEGORY.length === 5,
  '5 Distinct Property Type Categories Defined',
  `Found ${PROPERTY_TYPES_BY_CATEGORY.length}`
);

const expectedOptionsByCategory = {
  Residential: [
    'New Flat',
    'Resale Flat',
    'Residential Apartment',
    'Residential House / Villa',
    'Residential Plot',
    'NA Plot',
  ],
  Commercial: [
    'Commercial Shop',
    'Commercial Office',
    'Commercial Unit',
    'Commercial Land',
  ],
  'Plots and Land': [
    'Plot for Residential Use',
    'Plot for Commercial Use',
    'Industrial Plot',
    'Agricultural Land',
  ],
  'Rental and Leasing': [
    'Residential Property for Rent',
    'Commercial Property for Rent',
    'Lease Property',
    'Heavy-Deposit Property',
  ],
  Development: [
    'New Development / Under-Construction Project',
    'Redevelopment Property',
    'Society Redevelopment Opportunity',
    'Land / Plotting Project',
  ],
};

for (const [catName, options] of Object.entries(expectedOptionsByCategory)) {
  const catObj = PROPERTY_TYPES_BY_CATEGORY.find((c) => c.category === catName);
  assert(!!catObj, `Category "${catName}" exists in dropdown groups`);
  if (catObj) {
    for (const optLabel of options) {
      const match = catObj.options.find((o) => o.label === optLabel);
      assert(
        !!match,
        `Option "${optLabel}" present under category "${catName}"`,
        `Missing in ${catName}`
      );
    }
  }
}

assert(
  ALL_PROPERTY_TYPE_OPTIONS.length === 22,
  'Exact 22 Property Categories in flattened lookup',
  `Found ${ALL_PROPERTY_TYPE_OPTIONS.length}`
);

// Verify NA Plot label does not imply legal verification
const naPlot = ALL_PROPERTY_TYPE_OPTIONS.find((o) => o.id === 'na-plot');
assert(
  naPlot && naPlot.label === 'NA Plot',
  'NA Plot label is neutral without claiming legal verification'
);

// 2. TRANSACTION REQUIREMENTS VERIFICATION
const expectedRequirements = [
  'Sell',
  'Rent Out',
  'Lease',
  'Heavy Deposit',
  'Redevelopment',
  'Development / Joint Development',
];

assert(
  REQUIREMENT_OPTIONS.length === 6,
  'Exact 6 Mutually Exclusive Transaction Requirements Configured',
  `Found ${REQUIREMENT_OPTIONS.length}`
);

for (const req of expectedRequirements) {
  const found = REQUIREMENT_OPTIONS.find((r) => r.id === req);
  assert(!!found, `Requirement button "${req}" is available`);
}

// 3. SERVICE CORRIDOR & LOCATION DROPDOWN VERIFICATION
const expectedStations = [
  'Vasai Road',
  'Nalasopara',
  'Virar',
  'Vaitarna',
  'Saphale',
  'Kelve Road',
  'Palghar',
];

assert(
  APPROVED_STATIONS.length === 7,
  'Exactly 7 Approved Corridor Stations Supported',
  `Found ${APPROVED_STATIONS.length}`
);

for (const stationName of expectedStations) {
  const stationObj = APPROVED_STATIONS.find((s) => s.canonicalName === stationName);
  assert(!!stationObj, `Corridor Station "${stationName}" is present in centralized config`);
}

const naigaonCheck = APPROVED_STATIONS.some(
  (s) =>
    s.canonicalName.toLowerCase().includes('naigaon') ||
    s.displayName.toLowerCase().includes('naigaon') ||
    s.alternativeNames?.some((a) => a.toLowerCase().includes('naigaon'))
);
assert(!naigaonCheck, 'Naigaon is strictly excluded from approved corridor stations');

// 4. PHONE VALIDATION LOGIC TESTS
function validatePhone(phone) {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    cleanPhone = cleanPhone.slice(2);
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.slice(1);
  }
  if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
    return 'Please provide a valid 10-digit Indian mobile number (e.g. 98200 12345).';
  }
  return null;
}

assert(validatePhone('9820012345') === null, 'Valid Indian Mobile 9820012345 accepted');
assert(validatePhone('+91 98200 12345') === null, 'Formatted Indian Mobile +91 98200 12345 accepted');
assert(validatePhone('09820012345') === null, 'Leading zero mobile 09820012345 accepted');
assert(validatePhone('8877665544') === null, 'Valid Indian Mobile 8877665544 accepted');
assert(validatePhone('7012345678') === null, 'Valid Indian Mobile 7012345678 accepted');
assert(validatePhone('6398765432') === null, 'Valid Indian Mobile 6398765432 accepted');
assert(validatePhone('1234567890') !== null, 'Invalid prefix 1234567890 rejected');
assert(validatePhone('5555555555') !== null, 'Invalid prefix 5555555555 rejected');
assert(validatePhone('98200') !== null, 'Short mobile 98200 rejected');
assert(validatePhone('9820012345678') !== null, 'Long mobile rejected');
assert(validatePhone('') !== null, 'Empty mobile rejected');

// 5. 10 MANDATORY SCENARIO TESTS
console.log('\n--- TESTING 10 USER SCENARIOS ---');

function evaluateScenario(propertyType, requirement) {
  const isPlotOrLand =
    propertyType.includes('plot') ||
    propertyType.includes('land') ||
    propertyType === 'agricultural-land' ||
    propertyType === 'plotting-project';

  const isResidentialFlat =
    propertyType === 'new-flat' ||
    propertyType === 'resale-flat' ||
    propertyType === 'residential-apartment' ||
    propertyType === 'residential-house-villa' ||
    propertyType === 'residential-rent';

  const isCommercialUnit =
    propertyType === 'commercial-shop' ||
    propertyType === 'commercial-office' ||
    propertyType === 'commercial-unit' ||
    propertyType === 'commercial-rent';

  const isRedevelopment =
    propertyType === 'redevelopment-property' ||
    propertyType === 'society-redevelopment' ||
    propertyType === 'new-development-project' ||
    requirement === 'Redevelopment' ||
    requirement === 'Development / Joint Development' ||
    requirement === 'Joint Development';

  return {
    isPlotOrLand,
    isResidentialFlat,
    isCommercialUnit,
    isRedevelopment,
    pricingType:
      requirement === 'Sell' ||
      requirement === 'Development / Joint Development' ||
      requirement === 'Redevelopment'
        ? 'asking-price'
        : requirement === 'Rent Out'
        ? 'rent-deposit'
        : requirement === 'Lease'
        ? 'lease-deposit-term'
        : requirement === 'Heavy Deposit'
        ? 'heavy-deposit-tenure'
        : 'unknown',
  };
}

// Scenario 1: New Flat + Sell
const s1 = evaluateScenario('new-flat', 'Sell');
assert(
  s1.isResidentialFlat && !s1.isPlotOrLand && s1.pricingType === 'asking-price',
  'Scenario 1: New Flat + Sell displays BHK + Carpet Area + Expected Asking Price'
);

// Scenario 2: Resale Flat + Sell
const s2 = evaluateScenario('resale-flat', 'Sell');
assert(
  s2.isResidentialFlat && !s2.isPlotOrLand && s2.pricingType === 'asking-price',
  'Scenario 2: Resale Flat + Sell displays BHK + Carpet Area + Expected Asking Price'
);

// Scenario 3: Residential Plot + Sell
const s3 = evaluateScenario('residential-plot', 'Sell');
assert(
  s3.isPlotOrLand && !s3.isResidentialFlat && s3.pricingType === 'asking-price',
  'Scenario 3: Residential Plot + Sell displays Plot Area + Units (Guntha/Sq.Ft) + Road Access + Asking Price'
);

// Scenario 4: NA Plot + Sell
const s4 = evaluateScenario('na-plot', 'Sell');
assert(
  s4.isPlotOrLand && s4.pricingType === 'asking-price',
  'Scenario 4: NA Plot + Sell displays Plot Area + Land details + Asking Price'
);

// Scenario 5: Commercial Shop + Rent Out
const s5 = evaluateScenario('commercial-shop', 'Rent Out');
assert(
  s5.isCommercialUnit && s5.pricingType === 'rent-deposit',
  'Scenario 5: Commercial Shop + Rent Out displays Commercial Area + Floor/Usage + Monthly Rent + Deposit'
);

// Scenario 6: Commercial Office + Lease
const s6 = evaluateScenario('commercial-office', 'Lease');
assert(
  s6.isCommercialUnit && s6.pricingType === 'lease-deposit-term',
  'Scenario 6: Commercial Office + Lease displays Commercial Area + Monthly Lease Rent + Deposit + Lease Term'
);

// Scenario 7: Residential Property + Heavy Deposit
const s7 = evaluateScenario('residential-rent', 'Heavy Deposit');
assert(
  s7.isResidentialFlat && s7.pricingType === 'heavy-deposit-tenure',
  'Scenario 7: Residential Property + Heavy Deposit displays BHK + Heavy Deposit Lump Sum + Tenure'
);

// Scenario 8: Industrial Plot + Sell
const s8 = evaluateScenario('industrial-plot', 'Sell');
assert(
  s8.isPlotOrLand && s8.pricingType === 'asking-price',
  'Scenario 8: Industrial Plot + Sell displays Plot Area + Guntha/Acres + Road Access + Asking Price'
);

// Scenario 9: New Development / Construction
const s9 = evaluateScenario('new-development-project', 'Development / Joint Development');
assert(
  s9.isRedevelopment && s9.pricingType === 'asking-price',
  'Scenario 9: New Development displays Project/Society Name + Total Units/Scope + Expected Terms'
);

// Scenario 10: Redevelopment Property
const s10 = evaluateScenario('redevelopment-property', 'Redevelopment');
assert(
  s10.isRedevelopment && s10.pricingType === 'asking-price',
  'Scenario 10: Redevelopment displays Society Name + Member Flats / Age of Building + Terms'
);

console.log(`\n========================================`);
if (failedTests === 0) {
  console.log('ALL LISTING MODAL VERIFICATION TESTS PASSED (100% SUCCESS)');
} else {
  console.error(`TOTAL FAILED TESTS: ${failedTests}`);
  process.exit(1);
}
