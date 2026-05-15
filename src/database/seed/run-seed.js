const { execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

// 1. Generate the SQL file first
console.log('🔄 Generating SQL data...');
try {
  execSync(`node "${path.join(__dirname, 'generate-sql.js')}"`, { stdio: 'inherit' });
} catch (e) {
  console.error('❌ Failed to generate SQL:', e.message);
  process.exit(1);
}

// 2. Find the database path
const possiblePaths = [
  path.join(os.homedir(), '.config', 'A POS', 'pos-v1.db'),
  path.join(os.homedir(), '.config', 'a-pos', 'pos-v1.db'),
  path.join(os.homedir(), '.config', 'electron-react-boilerplate', 'pos-v1.db'),
];

let dbPath = '';
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    dbPath = p;
    break;
  }
}

if (!dbPath) {
  console.error('❌ Could not find database file. Please make sure the app has been run at least once.');
  process.exit(1);
}

const sqlFile = path.join(__dirname, 'dummy-data.sql');

console.log(`🌱 Seeding database at: ${dbPath}`);

try {
  // Use sqlite3 command to execute the SQL file
  execSync(`sqlite3 "${dbPath}" < "${sqlFile}"`);
  console.log('✅ Seeding completed successfully!');
  console.log('Summary: 10 Categories, 50 Customers, 50 Products added.');
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}
