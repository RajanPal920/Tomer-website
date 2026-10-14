import { getAllProperties } from '../src/data/properties.js';
import { filterProperties } from '../src/services/propertySearch.js';

const props = getAllProperties();

const tests = [
  { name: 'Search "plots"', filters: { searchQuery: 'plots' } },
  { name: 'Search "plot"', filters: { searchQuery: 'plot' } },
  { name: 'Search "search of plots"', filters: { searchQuery: 'search of plots' } },
  { name: 'Search "plots in vasai"', filters: { searchQuery: 'plots in vasai' } },
  { name: 'Search "plots in palghar"', filters: { searchQuery: 'plots in palghar' } },
  { name: 'Search "na plots"', filters: { searchQuery: 'na plots' } },
  { name: 'Search "industrial plots"', filters: { searchQuery: 'industrial plots' } },
  { name: 'Search "land"', filters: { searchQuery: 'land' } },
  { name: 'Tab "plots-land"', filters: { categoryTab: 'plots-land' } },
  { name: 'Tab "plots"', filters: { categoryTab: 'plots' } },
  { name: 'Category "plots"', filters: { category: 'plots' } },
  { name: 'Category "plots-land"', filters: { category: 'plots-land' } },
  { name: 'Category "residential-plot"', filters: { category: 'residential-plot' } },
  { name: 'Plots tab with bedrooms=2', filters: { categoryTab: 'plots-land', bedrooms: 2 } },
  { name: 'Search "plots" with bedrooms=2', filters: { searchQuery: 'plots', bedrooms: 2 } },
];

console.log('--- EXECUTING REAL FILTER TEST SUITE ---');
let allPassed = true;
tests.forEach(t => {
  const res = filterProperties(props, t.filters);
  console.log(`${t.name} => ${res.length} properties found`);
  if (res.length === 0) {
    allPassed = false;
  }
});

console.log('\nAll test cases found matching properties:', allPassed);
