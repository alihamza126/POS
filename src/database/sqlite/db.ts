import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import * as authSchema from '../schema/auth';
import * as inventorySchema from '../schema/inventory';
import * as salesSchema from '../schema/sales';
import * as auditSchema from '../schema/audit';
import * as syncSchema from '../schema/sync';
import * as customersSchema from '../schema/customers';
import * as categoriesSchema from '../schema/categories';
import * as suppliersSchema from '../schema/suppliers';

const schema = {
  ...authSchema,
  ...inventorySchema,
  ...salesSchema,
  ...auditSchema,
  ...syncSchema,
  ...customersSchema,
  ...categoriesSchema,
  ...suppliersSchema,
};

// Ensure this runs only in the main process or during testing
const dbPath = process.env.DATABASE_URL || 
  (app ? path.join(app.getPath('userData'), 'pos-v1.db') : path.join(process.cwd(), 'pos-v1.db'));
const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

export type DbType = typeof db;
