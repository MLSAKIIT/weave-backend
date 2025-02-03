import { sql } from 'drizzle-orm';

export const up = sql`
  DROP TABLE IF EXISTS users;
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    verification_token TEXT UNIQUE,
    verification_token_expiry TIMESTAMP
  );
`;

export const down = sql`
  DROP TABLE IF EXISTS users;
`;