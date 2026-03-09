const fs = require("fs");
const { getProfile, updateBiodata, updatePassword } = require("../services/profile.service");

const getProfileController = async (req, res, next) => {
  try {
    const { id_user } = req.user;
    const result = await getProfile(id_user);

    if (result.error === "PROFILE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Profil tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profil berhasil diambil",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const updateProfileController = async (req, res, next) => {
  try {
    const { id_user } = req.user;
    const { nama_lengkap, no_hp, alamat, institusi, bidang_keahlian } = req.body;

    const dataToUpdate = {};
    if (nama_lengkap !== undefined) dataToUpdate.nama_lengkap = nama_lengkap;
    if (no_hp !== undefined) dataToUpdate.no_hp = no_hp;
    if (alamat !== undefined) dataToUpdate.alamat = alamat;
    if (institusi !== undefined) dataToUpdate.institusi = institusi;
    if (bidang_keahlian !== undefined) dataToUpdate.bidang_keahlian = bidang_keahlian;
    if (req.file) dataToUpdate.foto = req.file.filename;

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada data yang diubah",
        data: null,
      });
    }

    const result = await updateBiodata(id_user, dataToUpdate);

    if (result?.error) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        message: result.error,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: result,
    });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
};

const updatePasswordController = async (req, res, next) => {
  try {
    const { id_user } = req.user;
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
        data: {
          missing_fields: [
            ...(!current_password ? ["current_password"] : []),
            ...(!new_password ? ["new_password"] : []),
            ...(!confirm_password ? ["confirm_password"] : []),
          ],
        },
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "Password baru dan konfirmasi password tidak cocok",
        data: { field: "confirm_password" },
      });
    }

    if (new_password.length < 8 || new_password.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Password baru harus antara 8 hingga 255 karakter",
        data: { field: "new_password" },
      });
    }

    const result = await updatePassword(id_user, { current_password, new_password });

    if (result.error) {
      if (result.error === "USER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Pengguna tidak ditemukan",
          data: null,
        });
      }
      return res.status(400).json({
        success: false,
        message: result.error,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password berhasil diubah",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfileController,
  updateProfileController,
  updatePasswordController,
};