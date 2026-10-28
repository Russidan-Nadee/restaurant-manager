import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { createDatabaseClient } from "./database-client.mjs";

const client = createDatabaseClient();
try {
  await client.connect();
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(16300508)");
  await client.query(`CREATE TABLE IF NOT EXISTS public.restaurant_manager_migrations (
    name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const directory = path.join(process.cwd(), "db/migrations");
  for (const name of (await readdir(directory)).filter(name => name.endsWith(".sql")).sort()) {
    const sql = (await readFile(path.join(directory, name), "utf8")).replace(/\r\n/g, "\n");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const existing = await client.query("SELECT checksum FROM public.restaurant_manager_migrations WHERE name = $1", [name]);
    if (existing.rows.length) {
      if (existing.rows[0].checksum !== checksum) throw new Error("Applied migration was modified: " + name);
      console.log("Already applied: " + name);
      continue;
    }
    await client.query("SET LOCAL search_path TO public");
    await client.query(sql);
    await client.query("INSERT INTO public.restaurant_manager_migrations (name, checksum) VALUES ($1, $2)", [name, checksum]);
    console.log("Applied: " + name);
  }
  await client.query("COMMIT");
  console.log("Database migrations complete.");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("Migration failed:", error.code || "", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
