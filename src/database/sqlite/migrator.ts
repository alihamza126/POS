import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import { db } from './db';

export async function runMigrations() {
  try {
    let migrationsPath: string;

    if (process.env.NODE_ENV === 'production') {
      // In packaged app, migrations are copied to resources/migrations via extraResources
      migrationsPath = path.join(process.resourcesPath, 'migrations');
    } else {
      // In development, __dirname is .erb/dll/ — navigate up to project root
      migrationsPath = path.join(__dirname, '../../../src/database/migrations');
    }

    console.log('[DB] Running migrations from:', migrationsPath);

    await migrate(db, { migrationsFolder: migrationsPath });
    console.log('[DB] Migrations completed successfully');
  } catch (error) {
    console.error('[DB] Migration failed:', error);
    throw error;
  }
}
