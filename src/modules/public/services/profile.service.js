
const { getProfileByIdDb } = require("../db/profile.db");
const cache = require("../../../utils/cache");

const PROFILE_CACHE_TTL = 5 * 60 * 1000;

const getProfile = async (id_user) => {
  const cacheKey = `profile:${id_user}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    return {
      error: false,
      message: "Profile user",
      data: cached,
    };
  }

  const user = await getProfileByIdDb(id_user);

  if (!user) {
    return {
      error: true,
      message: "User tidak ditemukan",
      data: null,
    };
  }

  cache.set(cacheKey, user, PROFILE_CACHE_TTL);

  return {
    error: false,
    message: "Profile user",
    data: user,
  };
};

const invalidateProfileCache = (id_user) => {
  cache.del(`profile:${id_user}`);
};

module.exports = {
  getProfile,
  invalidateProfileCache,
};