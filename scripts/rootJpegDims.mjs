import fs from 'fs';
import path from 'path';

function getJpegDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  let offset = 2;
  while (offset < buf.length) {
    if (buf[offset] !== 0xFF) break;
    const marker = buf[offset + 1];
    if (marker === 0xC0 || marker === 0xC2) {
      const height = buf.readUInt16BE(offset + 5);
      const width = buf.readUInt16BE(offset + 7);
      return { width, height };
    }
    const len = buf.readUInt16BE(offset + 2);
    offset += 2 + len;
  }
  return { width: 0, height: 0 };
}

const rootFiles = fs.readdirSync('.').filter(f => f.startsWith('WhatsApp'));
const list = rootFiles.map(f => {
  const dims = getJpegDimensions(f);
  const sizeKb = Math.round(fs.statSync(f).size / 1024);
  return { file: f, ...dims, sizeKb };
});
console.table(list);
