import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import { db } from './db';

export async function runMigrations() {
  try {
    // In production, migrations should be bundled or copied to a reachable location
    // For development, we point to the source folder
    const migrationsPath =
      process.env.NODE_ENV === 'production'
        ? path.join(process.resourcesPath, 'migrations')
        : path.join(__dirname, '../../src/database/migrations');

    console.log('Running migrations from:', migrationsPath);

    await migrate(db, { migrationsFolder: migrationsPath });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
