const bcrypt = require("bcrypt");
const {
  getProfileDb,
  updateBiodataDb,
  updatePasswordDb,
  getPasswordHashDb,
  checkDuplicateBiodataDb,
} = require("../db/profile.db");

const getProfile = async (id_user) => {
  const profile = await getProfileDb(id_user);

  if (!profile) {
    return { error: "PROFILE_NOT_FOUND" };
  }

  return profile;
};

const updateBiodata = async (id_user, data) => {
  if (data.nama_lengkap !== undefined) {
    if (!data.nama_lengkap || data.nama_lengkap.trim() === "") {
      return { error: "Nama lengkap tidak boleh kosong" };
    }
    data.nama_lengkap = data.nama_lengkap.trim();
  }

  if (data.username !== undefined) {
    if (!data.username || data.username.trim() === "") {
      return { error: "Username tidak boleh kosong" };
    }
    data.username = data.username.trim();
  }

  if (data.no_hp !== undefined) {
    if (!data.no_hp || data.no_hp.trim() === "") {
      return { error: "Nomor HP tidak boleh kosong" };
    }

    const phoneRegex = /^08[0-9]{8,11}$/;
    if (!phoneRegex.test(data.no_hp.trim())) {
      return {
        error: "Format nomor HP tidak valid. Harus diawali 08 dan terdiri dari 10-13 digit",
      };
    }

    data.no_hp = data.no_hp.trim();
  }

  const duplicate = await checkDuplicateBiodataDb(id_user, {
    username: data.username,
    no_hp: data.no_hp,
  });

  if (duplicate) {
    if (duplicate.username === data.username) {
      return { error: "Username sudah digunakan oleh pengguna lain" };
    }

    if (duplicate.no_hp === data.no_hp) {
      return { error: "Nomor HP sudah digunakan oleh pengguna lain" };
    }
  }

  const updated = await updateBiodataDb(id_user, data);
  return updated;
};

const updatePassword = async (id_user, { current_password, new_password }) => {
  if (!current_password || current_password.trim() === "") {
    return { error: "Password lama wajib diisi" };
  }

  if (!new_password || new_password.trim() === "") {
    return { error: "Password baru wajib diisi" };
  }

  if (new_password.length < 8) {
    return { error: "Password baru minimal 8 karakter" };
  }

  const password_hash = await getPasswordHashDb(id_user);

  if (!password_hash) {
    return { error: "USER_NOT_FOUND" };
  }

  const match = await bcrypt.compare(current_password, password_hash);
  if (!match) {
    return { error: "Password lama tidak sesuai" };
  }

  const new_password_hash = await bcrypt.hash(new_password, 10);

  await updatePasswordDb(id_user, new_password_hash);

  return { success: true };
};

module.exports = {
  getProfile,
  updateBiodata,
  updatePassword,
};