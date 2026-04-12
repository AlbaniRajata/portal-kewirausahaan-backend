const {
  verifyEmail,
  resendVerification,
  cancelRegistrasi,
} = require("../services/emailVerification.service");

const verifyEmailController = async (req, res, next) => {
  try {
    const { id_user, kode } = req.body;

    if (!id_user || !kode) {
      return res.status(400).json({
        success: false,
        message: "ID user dan kode verifikasi wajib diisi.",
        data: null,
      });
    }

    if (!/^\d{6}$/.test(kode)) {
      return res.status(400).json({
        success: false,
        message: "Format kode verifikasi tidak valid. Kode harus 6 digit angka.",
        data: null,
      });
    }

    const result = await verifyEmail(parseInt(id_user), kode);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        data: null,
      });
    }

    const successMessage =
      result.role === "dosen"
        ? "Email berhasil diverifikasi. Akun dosen Anda sudah aktif dan dapat langsung login."
        : "Email berhasil diverifikasi. Silahkan tunggu verifikasi dari admin.";

    return res.status(200).json({
      success: true,
      message: successMessage,
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

const resendVerificationController = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email wajib diisi.",
        data: null,
      });
    }

    const result = await resendVerification(email);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Kode verifikasi baru telah dikirim ke email Anda.",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

const cancelRegistrasiController = async (req, res, next) => {
  try {
    const { id_user } = req.body;

    if (!id_user) {
      return res.status(400).json({
        success: false,
        message: "ID user wajib diisi.",
        data: null,
      });
    }

    const result = await cancelRegistrasi(parseInt(id_user));

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Registrasi berhasil dibatalkan.",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  verifyEmailController,
  resendVerificationController,
  cancelRegistrasiController,
};