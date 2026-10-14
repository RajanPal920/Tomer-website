import fs from 'fs';
import path from 'path';

function getPngDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  // PNG signature is 8 bytes. IHDR starts at byte 12 (0-indexed byte 16 has width, 20 has height)
  if (buf.toString('ascii', 1, 4) === 'PNG') {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    return { width, height, type: 'png' };
  }
  return { width: 0, height: 0, type: 'unknown' };
}

const dir = 'public/images/buildingImages';
const files = fs.readdirSync(dir);
const list = [];
for (const f of files) {
  const p = path.join(dir, f);
  const dims = getPngDimensions(p);
  const sizeKb = Math.round(fs.statSync(p).size / 1024);
  list.push({ file: f, ...dims, sizeKb });
}

console.table(list);
