const {
  getProfile,
  updateBiodata,
  updatePassword,
} = require("../services/profile.service");

const getProfileController = async (req, res) => {
  try {
    const { id_user } = req.user;

    const result = await getProfile(id_user);

    if (result.error === "PROFILE_NOT_FOUND") {
      return res.status(404).json({
        message: "Profil tidak ditemukan",
      });
    }

    return res.json({
      message: "Profil berhasil diambil",
      data: result,
    });
  } catch (err) {
    console.error("ERROR GET PROFILE:", err);
    return res.status(500).json({
      message: "Terjadi kesalahan pada sistem",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const updateProfileController = async (req, res) => {
  try {
    const { id_user } = req.user;
    const { nama_lengkap, username, no_hp, alamat } = req.body;

    const dataToUpdate = {};

    if (nama_lengkap !== undefined) dataToUpdate.nama_lengkap = nama_lengkap;
    if (username !== undefined) dataToUpdate.username = username;
    if (no_hp !== undefined) dataToUpdate.no_hp = no_hp;
    if (alamat !== undefined) dataToUpdate.alamat = alamat;

    if (req.file) {
      dataToUpdate.foto = req.file.filename;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({
        message: "Tidak ada data yang diubah",
      });
    }

    const result = await updateBiodata(id_user, dataToUpdate);

    if (result.error) {
      return res.status(400).json({
        message: result.error,
      });
    }

    return res.json({
      message: "Profil berhasil diperbarui",
      data: result,
    });
  } catch (err) {
    console.error("ERROR UPDATE PROFILE:", err);
    return res.status(500).json({
      message: "Terjadi kesalahan pada sistem",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const updatePasswordController = async (req, res) => {
  try {
    const { id_user } = req.user;
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
        fields: ["current_password", "new_password", "confirm_password"],
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        message: "Password baru dan konfirmasi password tidak cocok",
        field: "confirm_password",
      });
    }

    const result = await updatePassword(id_user, {
      current_password,
      new_password,
    });

    if (result.error) {
      if (result.error === "USER_NOT_FOUND") {
        return res.status(404).json({
          message: "Pengguna tidak ditemukan",
        });
      }

      return res.status(400).json({
        message: result.error,
      });
    }

    return res.json({
      message: "Password berhasil diubah",
    });
  } catch (err) {
    console.error("ERROR UPDATE PASSWORD:", err);
    return res.status(500).json({
      message: "Terjadi kesalahan pada sistem",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = {
  getProfileController,
  updateProfileController,
  updatePasswordController,
};