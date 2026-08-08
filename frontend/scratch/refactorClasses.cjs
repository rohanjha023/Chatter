const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const replacements = [
  { regex: /\bbg-black\b/g, replacement: 'bg-white dark:bg-black' },
  { regex: /\btext-white\b/g, replacement: 'text-black dark:text-white' },
  { regex: /\bbg-gray-900\b/g, replacement: 'bg-gray-100 dark:bg-gray-900' },
  { regex: /\bborder-gray-800\b/g, replacement: 'border-gray-200 dark:border-gray-800' },
  { regex: /\btext-gray-400\b/g, replacement: 'text-gray-600 dark:text-gray-400' },
  { regex: /\bhover:bg-gray-800\b/g, replacement: 'hover:bg-gray-200 dark:hover:bg-gray-800' },
  { regex: /\bhover:bg-gray-900\b/g, replacement: 'hover:bg-gray-100 dark:hover:bg-gray-900' }
];

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replacements.forEach(r => {
      content = content.replace(r.regex, r.replacement);
    });
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
