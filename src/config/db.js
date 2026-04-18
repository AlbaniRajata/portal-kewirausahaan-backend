const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL tidak terdefinisi di environment variables!");
}

let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  allowExitOnIdle: false,
});

const handleConnectError = async (err) => {
  console.error("❌ Database connection error:", err.message);

  if (isConnecting || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error("❌ Max reconnection attempts reached");
    process.exit(1);
    return;
  }

  isConnecting = true;
  reconnectAttempts++;

  console.log(`🔄 Attempting reconnect ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${RECONNECT_DELAY}ms...`);

  setTimeout(async () => {
    isConnecting = false;
    try {
      await pool.query("SELECT 1");
      console.log("✅ Database reconnected successfully");
      reconnectAttempts = 0;
    } catch (retryErr) {
      console.error("❌ Reconnection failed:", retryErr.message);
      await handleConnectError(retryErr);
    }
  }, RECONNECT_DELAY);
};

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err.message);
});

const connectWithRetry = async (maxRetries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      client.release();
      console.log("✅ PostgreSQL connected");
      return true;
    } catch (err) {
      console.error(`❌ Connection attempt ${attempt}/${maxRetries} failed:`, err.message);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, 10000);
      }
    }
  }
  return false;
};

(async () => {
  const connected = await connectWithRetry();
  if (!connected) {
    handleConnectError(new Error("Initial connection failed"));
  }
})();

module.exports = pool;