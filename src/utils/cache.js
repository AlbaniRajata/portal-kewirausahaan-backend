const cacheStore = new Map();

const DEFAULT_TTL = 60 * 1000;

const get = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    cacheStore.delete(key);
    return null;
  }

  return entry.value;
};

const set = (key, value, ttl = DEFAULT_TTL) => {
  cacheStore.set(key, {
    value,
    expiry: Date.now() + ttl,
  });
};

const del = (key) => {
  cacheStore.delete(key);
};

const clear = () => {
  cacheStore.clear();
};

const invalidatePrefix = (prefix) => {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
};

const getOrSet = async (key, fetchFn, ttl = DEFAULT_TTL) => {
  const cached = get(key);
  if (cached !== null) return cached;

  const value = await fetchFn();
  set(key, value, ttl);
  return value;
};

const getCacheStats = () => {
  let valid = 0;
  let expired = 0;
  const now = Date.now();

  for (const entry of cacheStore.values()) {
    if (now > entry.expiry) expired++;
    else valid++;
  }

  return {
    total: cacheStore.size,
    valid,
    expired,
  };
};

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cacheStore.entries()) {
    if (now > entry.expiry) cacheStore.delete(key);
  }
}, 60000);

if (typeof cleanupTimer.unref === "function") {
  cleanupTimer.unref();
}

module.exports = {
  get,
  set,
  del,
  clear,
  invalidatePrefix,
  getOrSet,
  getCacheStats,
  DEFAULT_TTL,
};