const pool = require("../config/db");

let isHealthy = true;
let lastHealthCheck = null;
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 5;

const HEALTH_CHECK_INTERVAL = 30000;

const performHealthCheck = async () => {
  try {
    const start = Date.now();
    await pool.query("SELECT 1");
    const latency = Date.now() - start;

    isHealthy = true;
    consecutiveFailures = 0;
    lastHealthCheck = { status: "healthy", latency, timestamp: new Date() };

    return lastHealthCheck;
  } catch (err) {
    consecutiveFailures++;
    isHealthy = consecutiveFailures < MAX_CONSECUTIVE_FAILURES;

    lastHealthCheck = {
      status: "unhealthy",
      error: err.message,
      consecutiveFailures,
      timestamp: new Date()
    };

    return lastHealthCheck;
  }
};

const getHealthStatus = () => {
  return {
    isHealthy,
    lastCheck: lastHealthCheck,
    ready: isHealthy && consecutiveFailures < MAX_CONSECUTIVE_FAILURES
  };
};

setInterval(async () => {
  await performHealthCheck();
}, HEALTH_CHECK_INTERVAL);

const retryOperation = async (operation, options = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 100,
    maxDelay = 3000,
    backoffMultiplier = 2,
    shouldRetry = (err) => {
      if (err.code === "ECONNREFUSED") return true;
      if (err.code === "ETIMEDOUT") return true;
      if (err.code === "23505") return false;
      if (err.code === "23503") return false;
      if (err.message?.includes("connection")) return true;
      return false;
    }
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;

      if (attempt === maxRetries || !shouldRetry(err)) {
        throw err;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
};

const executeWithRetry = async (query, params, options = {}) => {
  return retryOperation(
    () => pool.query(query, params),
    options
  );
};

module.exports = {
  performHealthCheck,
  getHealthStatus,
  retryOperation,
  executeWithRetry,
  isHealthy: () => isHealthy,
  lastHealthCheck: () => lastHealthCheck
};