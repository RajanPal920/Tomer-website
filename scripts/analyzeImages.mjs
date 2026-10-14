import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function getHash(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buf).digest('hex');
}

const dir = 'public/images/buildingImages';
const files = fs.readdirSync(dir);
const map = {};
for (const f of files) {
  const h = getHash(path.join(dir, f));
  if (!map[h]) map[h] = [];
  map[h].push(f);
}
console.log('Unique hashes in buildingImages:', Object.keys(map).length, 'out of', files.length);
for (const [h, list] of Object.entries(map)) {
  console.log(h.slice(0, 8), ':', list.join(', '));
}

// Check root files
const rootFiles = fs.readdirSync('.').filter(f => f.startsWith('WhatsApp'));
console.log('\nRoot WhatsApp images count:', rootFiles.length);
for (const f of rootFiles) {
  const h = getHash(f);
  console.log('Root:', f, '-> Hash:', h.slice(0, 8));
}
