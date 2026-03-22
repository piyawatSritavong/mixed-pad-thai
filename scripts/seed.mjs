import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { scryptSync, randomBytes } from "crypto";

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Read DATABASE_URL from .env.local
const envPath = join(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf8");
const match = envContent.match(/DATABASE_URL=(.+)/);
if (!match) { console.error("❌  DATABASE_URL not found in .env.local"); process.exit(1); }
const DATABASE_URL = match[1].trim();

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10_000 });

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

const sql = readFileSync(join(__dirname, "../db/init.sql"), "utf8");

async function main() {
  console.log("🔌  Connecting to Supabase...");
  const client = await pool.connect();
  console.log("✅  Connected!");

  try {
    console.log("⚙️   Running init.sql (create tables + seed)...");
    await client.query(sql);
    console.log("✅  Tables created and data seeded.");

    // Seed default admin user (admin / admin)
    const { hash, salt } = hashPassword("admin");
    await client.query(
      `INSERT INTO admin_users (username, password_hash, password_salt, full_name, role, permissions)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (username) DO NOTHING`,
      [
        "admin", hash, salt, "System Admin", "admin",
        JSON.stringify({ dashboard: true, summary: true, inventory: true, orders: true, members: true, tables: true, settings: true }),
      ]
    );
    console.log("✅  Default admin user created (admin / admin).");

    const { rows: products } = await client.query("SELECT id, name, price FROM products ORDER BY id");
    console.log("\n📋  Products in database:");
    products.forEach((r) => console.log(`   ${r.id}. ${r.name}  –  ฿${r.price}`));

    const { rows: tables } = await client.query("SELECT table_number, capacity FROM restaurant_tables ORDER BY table_number::INTEGER NULLS LAST");
    console.log("\n🪑  Restaurant tables:");
    tables.forEach((t) => console.log(`   โต๊ะ ${t.table_number}  (${t.capacity} ที่นั่ง) → /${t.table_number}`));

    console.log("\n🔑  Admin login: http://localhost:3000/admin/login");
    console.log("   Username: admin");
    console.log("   Password: admin");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => { console.error("❌  Error:", err.message); process.exit(1); });
