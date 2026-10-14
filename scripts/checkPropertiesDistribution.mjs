import { sampleProperties } from '../src/data/properties.js';

console.log('Total properties in sampleProperties:', sampleProperties.length);
const categoriesCount = {};
const localitiesCount = {};
const transactionsCount = {};

sampleProperties.forEach(p => {
  categoriesCount[p.category] = (categoriesCount[p.category] || 0) + 1;
  localitiesCount[p.locality] = (localitiesCount[p.locality] || 0) + 1;
  transactionsCount[p.transactionType] = (transactionsCount[p.transactionType] || 0) + 1;
});

console.log('Categories:', categoriesCount);
console.log('Localities:', localitiesCount);
console.log('Transactions:', transactionsCount);
