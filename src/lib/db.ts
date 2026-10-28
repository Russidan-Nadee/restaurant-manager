import "server-only";
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";

const globalForDatabase = globalThis as typeof globalThis & {
  restaurantPool?: Pool;
};

export function getDatabase(): Pool {
  if (globalForDatabase.restaurantPool) return globalForDatabase.restaurantPool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is missing. Run neon deploy.");
  const url = new URL(connectionString);
  if (url.hostname.endsWith(".neon.tech")) url.searchParams.set("sslmode", "verify-full");
  const pool = new Pool({
    connectionString: url.toString(),
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 15000,
    query_timeout: 15000,
  });
  pool.on("error", () => console.error("An idle database connection failed."));
  attachDatabasePool(pool);
  globalForDatabase.restaurantPool = pool;
  return pool;
}
