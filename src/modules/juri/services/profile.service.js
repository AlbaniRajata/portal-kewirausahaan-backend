const { hashPassword, comparePassword } = require("../../../helpers/password.helper");
const {
  getProfileDb,
  updateBiodataDb,
  getPasswordHashDb,
  updatePasswordDb,
  checkDuplicateBiodataDb,
} = require("../db/profile.db");

const getProfile = async (id_user) => {
  const profile = await getProfileDb(id_user);
  if (!profile) return { error: "PROFILE_NOT_FOUND" };
  return profile;
};

const updateBiodata = async (id_user, data) => {
  if (data.nama_lengkap !== undefined) {
    data.nama_lengkap = data.nama_lengkap.trim();
    if (!data.nama_lengkap) return { error: "Nama lengkap tidak boleh kosong" };
  }

  if (data.no_hp !== undefined) {
    data.no_hp = data.no_hp.trim();
    if (!data.no_hp) return { error: "Nomor HP tidak boleh kosong" };
    if (!/^08[0-9]{8,11}$/.test(data.no_hp)) {
      return { error: "Format nomor HP tidak valid. Harus diawali 08 dan terdiri dari 10-13 digit" };
    }
  }

  if (data.alamat !== undefined) {
    data.alamat = data.alamat.trim() || null;
  }

  if (data.institusi !== undefined) {
    data.institusi = data.institusi.trim() || null;
  }

  if (data.bidang_keahlian !== undefined) {
    data.bidang_keahlian = data.bidang_keahlian.trim() || null;
  }

  const duplicate = await checkDuplicateBiodataDb(id_user, { no_hp: data.no_hp });
  if (duplicate) {
    return { error: "Nomor HP sudah digunakan oleh pengguna lain" };
  }

  const updated = await updateBiodataDb(id_user, data);
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

  return { success: true };
};

module.exports = { getProfile, updateBiodata, updatePassword };