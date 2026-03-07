const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL tidak terdefinisi di environment variables!");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err.message);
});

// Test koneksi
pool.connect()
  .then((client) => {
    console.log("✅ PostgreSQL connected");
    client.release();
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  });

module.exports = pool;