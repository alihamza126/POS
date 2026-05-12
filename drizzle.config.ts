import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schema/*.ts',
  out: './src/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'sqlite.db', // Placeholder for kit commands, actual path handled in code
  },
} satisfies Config;
