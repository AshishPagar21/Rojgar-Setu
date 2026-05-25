#!/usr/bin/env node
/**
 * Database Connection Test Utility
 * Run this to verify your DATABASE_URL is valid
 */

require("dotenv").config();
const { Pool } = require("pg");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set in .env file");
  process.exit(1);
}

console.log("🔍 Testing database connection...");
console.log(`📍 Host: ${new URL(databaseUrl).hostname}`);

const pool = new Pool({
  connectionString: databaseUrl,
  statement_timeout: 10000,
  connectionTimeoutMillis: 10000,
});

pool.query("SELECT NOW() as current_time", (err, res) => {
  if (err) {
    console.error("❌ Connection failed:");
    console.error(`   Error: ${err.message}`);

    if (err.message.includes("password")) {
      console.error(
        "\n💡 This looks like an authentication error. Your DATABASE_URL credentials may be invalid or expired.",
      );
      console.error(
        "   → Go to https://console.neon.tech and get fresh credentials",
      );
    } else if (err.message.includes("Can't reach")) {
      console.error("\n💡 Database server is unreachable. Possible causes:");
      console.error("   → Neon database is paused (free tier auto-pauses)");
      console.error(
        "   → Check https://console.neon.tech and resume if needed",
      );
    }

    pool.end();
    process.exit(1);
  } else {
    console.log("✅ Connection successful!");
    console.log(`✓ Database time: ${res.rows[0].current_time}`);
    pool.end();
    process.exit(0);
  }
});
