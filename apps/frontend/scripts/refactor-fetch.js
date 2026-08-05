const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function findAndReplaceFetch(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findAndReplaceFetch(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Match fetch('/api/... or fetch("/api/... or fetch(`/api/...
      const fetchRegex = /fetch\(\s*(['"`]\/api\/[^'"`]*['"`])/g;
      
      if (fetchRegex.test(content)) {
        // Add import if not present
        if (!content.includes('import { fetchApi }')) {
          // Find the last import statement or put at top
          const importIndex = content.lastIndexOf('import ');
          if (importIndex !== -1) {
            const endOfLine = content.indexOf('\n', importIndex);
            content = content.slice(0, endOfLine + 1) + "import { fetchApi } from '@/lib/apiClient';\n" + content.slice(endOfLine + 1);
          } else {
            content = "import { fetchApi } from '@/lib/apiClient';\n" + content;
          }
        }

        // Replace fetch with fetchApi
        content = content.replace(fetchRegex, 'fetchApi($1');
        
        fs.writeFileSync(fullPath, content);
        console.log(`Refactored ${fullPath}`);
      }
    }
  }
}

findAndReplaceFetch(srcDir);
console.log('Finished refactoring fetch calls to fetchApi.');
