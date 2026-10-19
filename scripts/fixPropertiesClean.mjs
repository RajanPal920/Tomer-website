import fs from 'fs';

let content = fs.readFileSync('src/data/properties.js', 'utf8');

const palgharMarker = '"id": "demo-palghar-plot-004"';
const palgharPos = content.indexOf(palgharMarker);

if (palgharPos !== -1) {
  const startObj = content.lastIndexOf('{', palgharPos);
  const endObj = content.indexOf('}\n];\n  return _livePropertiesCache', palgharPos);
  const palgharJson = content.slice(startObj, endObj + 1);

  // Restore getSimilarProperties
  const badReturn = 'if (!property) return [,\n  ' + palgharJson + '\n];';
  content = content.replace(badReturn, 'if (!property) return [];');

  // Insert palgharJson into sampleProperties before ];
  const kelveMarker = '"id": "demo-kelve-na-plot-007"';
  const kelvePos = content.indexOf(kelveMarker);
  const kelveEnd = content.indexOf('}\n];\n\nlet _livePropertiesCache', kelvePos);
  
  content = content.slice(0, kelveEnd + 1) + ',\n  ' + palgharJson + content.slice(kelveEnd + 1);

  fs.writeFileSync('src/data/properties.js', content, 'utf8');
  console.log('Fixed properties.js cleanly!');
} else {
  console.log('Not found');
}
