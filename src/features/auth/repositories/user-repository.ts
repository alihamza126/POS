import { eq } from 'drizzle-orm';
import { db } from '../../../database/sqlite/db';
import { users } from '../../../database/schema/auth';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: 'owner' | 'admin' | 'manager' | 'cashier' | 'accountant';
  active: boolean;
}

export class UserRepository {
  static async findByUsername(username: string): Promise<User | undefined> {
    const result = db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();
    return result as User | undefined;
  }

  static async createUser(
    username: string,
    passwordHash: string,
    role: User['role'] = 'cashier',
  ): Promise<User> {
    const newUser: User = {
      id: uuidv4(),
      username,
      passwordHash,
      role,
      active: true,
    };

    db.insert(users).values(newUser).run();
    return newUser;
  }

  static async count(): Promise<number> {
    const result = db.select({ count: users.id }).from(users).all();
    return result.length;
  }
}
