import fs from 'fs';

const content = fs.readFileSync('src/data/properties.js', 'utf-8');
const matches = [...content.matchAll(/image:\s*["']([^"']+)["']/g)].map(m => m[1]);
console.log('Total property image entries:', matches.length);
const local = matches.filter(m => m.startsWith('/images'));
const remote = matches.filter(m => m.startsWith('http'));
console.log('Local images:', local.length);
console.log('Remote images:', remote.length);
if (local.length > 0) console.log('Sample local:', local.slice(0, 3));
if (remote.length > 0) console.log('Sample remote:', remote.slice(0, 3));
