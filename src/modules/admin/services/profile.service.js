const { hashPassword, comparePassword } = require("../../../helpers/password.helper");
const {
  getProfileDb,
  updateBiodataDb,
  getPasswordHashDb,
  updatePasswordDb,
  checkDuplicateBiodataDb,
} = require("../db/profile.db");
const cache = require("../../../utils/cache");

const PROFILE_CACHE_TTL = 5 * 60 * 1000;

const getProfile = async (id_user) => {
  const cacheKey = `profile:${id_user}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const profile = await getProfileDb(id_user);
  if (!profile) return { error: "PROFILE_NOT_FOUND" };

  cache.set(cacheKey, profile, PROFILE_CACHE_TTL);
  return profile;
};

const updateBiodata = async (id_user, data) => {
  if (data.nama_lengkap !== undefined) {
    data.nama_lengkap = data.nama_lengkap.trim();
    if (!data.nama_lengkap) return { error: "Nama lengkap tidak boleh kosong" };
  }

  if (data.username !== undefined) {
    data.username = data.username.trim();
    if (!data.username) return { error: "Username tidak boleh kosong" };
    if (data.username.length < 3 || data.username.length > 50) {
      return { error: "Username harus antara 3 hingga 50 karakter" };
    }
  }

  if (data.no_hp !== undefined) {
    data.no_hp = data.no_hp.trim();
    if (!data.no_hp) return { error: "Nomor HP tidak boleh kosong" };
    if (!/^08[0-9]{8,11}$/.test(data.no_hp)) {
      return { error: "Format nomor HP tidak valid. Harus dimulai 08 dan terdiri dari 10-13 digit" };
    }
  }

  if (data.alamat !== undefined) {
    data.alamat = data.alamat.trim() || null;
  }

  const duplicate = await checkDuplicateBiodataDb(id_user, {
    username: data.username,
    no_hp: data.no_hp,
  });

  if (duplicate) {
    if (data.username && duplicate.username === data.username) {
      return { error: "Username sudah digunakan oleh pengguna lain" };
    }
    if (data.no_hp && duplicate.no_hp === data.no_hp) {
      return { error: "Nomor HP sudah digunakan oleh pengguna lain" };
    }
  }

  const updated = await updateBiodataDb(id_user, data);

  cache.del(`profile:${id_user}`);

  return updated;
};

const updatePassword = async (id_user, { current_password, new_password }) => {
  const password_hash = await getPasswordHashDb(id_user);
  if (!password_hash) return { error: "USER_NOT_FOUND" };

  const match = await comparePassword(current_password, password_hash);
  if (!match) return { error: "Password lama tidak sesuai" };

  if (new_password === current_password) {
    return { error: "Password baru tidak boleh sama dengan password lama" };
  }

  const new_hash = await hashPassword(new_password);
  await updatePasswordDb(id_user, new_hash);

  cache.del(`profile:${id_user}`);

  return { success: true };
};

module.exports = { getProfile, updateBiodata, updatePassword };
