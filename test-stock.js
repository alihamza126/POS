const Database = require('./release/app/node_modules/better-sqlite3');
const os = require('os');
const path = require('path');
const dbPath = path.join(os.homedir(), '.config', 'electron-react-boilerplate', 'pos-v1.db');
const db = new Database(dbPath);

const stock = db.prepare('SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 5').all();
console.log('Total movements:', stock);

const prods = db.prepare('SELECT id, name FROM products LIMIT 5').all();
console.log('Products:', prods);
