import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { Pool } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read DATABASE_URL from .env.local
const envPath = join(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf8");
const match = envContent.match(/DATABASE_URL=(.+)/);
if (!match) {
  console.error("❌  DATABASE_URL not found in .env.local");
  process.exit(1);
}
const DATABASE_URL = match[1].trim();

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10_000,
});

const sql = readFileSync(join(__dirname, "../db/init.sql"), "utf8");

async function main() {
  console.log("🔌  Connecting to Supabase...");
  const client = await pool.connect();
  console.log("✅  Connected!");

  try {
    console.log("⚙️   Running init.sql (create tables + seed)...");
    await client.query(sql);
    console.log("✅  Tables created and data seeded.");

    const { rows } = await client.query("SELECT id, name, price FROM products ORDER BY id");
    console.log("\n📋  Products in database:");
    rows.forEach((r) => console.log(`   ${r.id}. ${r.name}  –  ฿${r.price}`));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});
