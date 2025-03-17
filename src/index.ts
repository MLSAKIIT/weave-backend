import app from "./app";
import {websocket} from "./server";
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { Pool } from 'pg';
import * as schema from './db/schema';
const host = Bun.env.HOST || "localhost";
const port = Bun.env.PORT || 3000;


console.log(`Server running at http://${host}:${port}`);
Bun.serve({
  fetch: app.fetch,
  websocket,
  hostname: host,
  port: port,
});

const pool = new Pool({
  connectionString: Bun.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function setupDatabase() {
  try {
    console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: './src/drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

setupDatabase();
