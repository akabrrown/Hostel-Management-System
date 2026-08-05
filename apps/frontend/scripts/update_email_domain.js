const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'docs/SECURITY.md',
  'docs/TROUBLESHOOTING.md',
  'docs/ENVIRONMENT_SETUP.md',
  'docs/COMPONENTS.md',
  'docs/DATABASE_SCHEMA.md',
  'docs/API.md'
];

const rootDir = path.join(__dirname, '..');

console.log('Updating email domain from @upsa.edu.gh to @upsamail.edu.gh...\n');

filesToUpdate.forEach(file => {
  const filePath = path.join(rootDir, file);
  
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      content = content.replace(/@upsa\.edu\.gh/g, '@upsamail.edu.gh');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Updated: ${file}`);
      } else {
        console.log(`- No changes needed: ${file}`);
      }
    } else {
      console.log(`✗ File not found: ${file}`);
    }
  } catch (error) {
    console.error(`✗ Error updating ${file}:`, error.message);
  }
});

console.log('\nEmail domain update complete!');
