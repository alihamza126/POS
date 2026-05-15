import { db } from '../sqlite/db';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';

async function init() {
  console.log('Initializing database and running migrations...');
  try {
    migrate(db, {
      migrationsFolder: path.join(__dirname, '../migrations'),
    });
    console.log('✅ Database initialized successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

init();
