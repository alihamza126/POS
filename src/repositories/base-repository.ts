import { eq } from 'drizzle-orm';
import { db } from '../database/sqlite/db';

export default class BaseRepository<T extends { id: string }> {
  constructor(protected table: any) {
    this.db = db;
  }

  protected db;

  async findById(id: string): Promise<T | null> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id));
    return (results[0] as T) || null;
  }

  async findAll(): Promise<T[]> {
    return (await this.db.select().from(this.table)) as T[];
  }
}
