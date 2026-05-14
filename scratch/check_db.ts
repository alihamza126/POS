import Database from 'better-sqlite3';
import path from 'path';

const dbPath = 'sqlite.db';
const db = new Database(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables);

for (const table of tables as any[]) {
    console.log(`\nColumns for ${table.name}:`);
    const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
    console.log(columns);
}

db.close();
