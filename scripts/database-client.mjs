import pg from "pg";
import nextEnv from "@next/env";

export function createDatabaseClient() {
  nextEnv.loadEnvConfig(process.cwd());
  const connectionString = process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString) throw new Error("DATABASE_URL_UNPOOLED is required. Run neon deploy first.");
  const url = new URL(connectionString);
  if (url.hostname.includes("-pooler")) throw new Error("Use the direct URL for migrations and verification.");
  if (url.hostname.endsWith(".neon.tech")) url.searchParams.set("sslmode", "verify-full");
  return new pg.Client({ connectionString: url.toString(), connectionTimeoutMillis: 15000, query_timeout: 30000 });
}
