import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(Bun.env.DATABASE_URL!);
