/**
 * Local development migration runner.
 * Usage: npm run db:migrate
 * Requires DATABASE_URL env variable (or falls back to local default).
 */
import { Pool } from "pg";
import fs from "fs";
import path from "path";

async function run() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:password@localhost:5432/foodstore",
  });

  const files = [
    path.join(process.cwd(), "db", "migrations", "001_create_tables.sql"),
    path.join(process.cwd(), "db", "seeds", "001_products.sql"),
  ];

  try {
    for (const file of files) {
      const label = path.basename(file);
      console.log(`Running ${label}…`);
      const sql = fs.readFileSync(file, "utf-8");
      await pool.query(sql);
      console.log(`  ✓ ${label}`);
    }
    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
