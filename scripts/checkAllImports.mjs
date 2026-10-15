// Comprehensive Import & JSX Identifier Verification Script
import fs from 'node:fs';
import path from 'node:path';
import * as lucide from 'lucide-react';

const SRC_DIR = path.join(process.cwd(), 'src');
const issues = [];

function checkFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  
  // 1. Check lucide-react imports
  const lucideMatch = code.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
  if (lucideMatch) {
    const importedIcons = lucideMatch[1]
      .split(',')
      .map((s) => s.trim().split(/\s+as\s+/)[0].trim())
      .filter(Boolean);

    for (const icon of importedIcons) {
      if (!(icon in lucide)) {
        issues.push({
          file: path.relative(process.cwd(), filePath),
          type: 'INVALID_LUCIDE_ICON',
          identifier: icon,
        });
      }
    }
  }

  // 2. Check JSX tags like <X ... />, <Icon ... /> to see if they are defined or imported
  // Match standard capitalized JSX tags: <Tag or <Tag>
  const jsxTagMatches = code.matchAll(/<([A-Z][a-zA-Z0-9]*)\b/g);
  const declaredOrImported = new Set();

  // Find all imports in file
  const importMatches = code.matchAll(/import\s+(?:([A-Za-z0-9_]+)\s*,?\s*)?(?:\{([^}]+)\})?(?:\*\s+as\s+([A-Za-z0-9_]+))?\s+from/g);
  for (const m of importMatches) {
    if (m[1]) declaredOrImported.add(m[1].trim());
    if (m[2]) {
      m[2].split(',').forEach((spec) => {
        const parts = spec.trim().split(/\s+as\s+/);
        const name = (parts[1] || parts[0]).trim();
        if (name) declaredOrImported.add(name);
      });
    }
    if (m[3]) declaredOrImported.add(m[3].trim());
  }

  // Find top-level declarations (function, class, const, let, var)
  const declMatches = code.matchAll(/(?:function|class|const|let|var)\s+([A-Za-z0-9_]+)/g);
  for (const d of declMatches) {
    declaredOrImported.add(d[1].trim());
  }

  // Add React built-ins or fragments
  declaredOrImported.add('React');
  declaredOrImported.add('Fragment');

  for (const tagMatch of jsxTagMatches) {
    const tagName = tagMatch[1];
    // If it starts with capital and not in declaredOrImported
    if (!declaredOrImported.has(tagName)) {
      issues.push({
        file: path.relative(process.cwd(), filePath),
        type: 'UNDEFINED_JSX_COMPONENT',
        identifier: tagName,
      });
    }
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      walkDir(full);
    } else if (full.endsWith('.jsx') || full.endsWith('.js')) {
      checkFile(full);
    }
  }
}

walkDir(SRC_DIR);

console.log('--- AUDIT RESULTS ---');
console.log(`Scanned all files in ${SRC_DIR}`);
if (issues.length === 0) {
  console.log('✅ No undefined JSX components or invalid lucide icons found!');
} else {
  console.log(`Found ${issues.length} issue(s):`);
  issues.forEach((iss) => {
    console.log(`- [${iss.type}] ${iss.file}: "${iss.identifier}"`);
  });
}
