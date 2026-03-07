const { verifyEmail } = require("../services/emailVerification.service");

const verifyEmailController = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message:
          "Token verifikasi tidak ditemukan. Silakan gunakan link verifikasi yang valid dari email Anda.",
        data: null,
      });
    }

    if (token.length !== 64 || !/^[a-f0-9]+$/.test(token)) {
      return res.status(400).json({
        success: false,
        message:
          "Token verifikasi tidak valid. Silakan gunakan link dari email Anda.",
        data: null,
      });
    }

    const result = await verifyEmail(token);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message:
          "Token verifikasi tidak valid atau sudah kadaluarsa. Silakan registrasi ulang atau hubungi administrator.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Email berhasil diverifikasi. Anda sekarang dapat melakukan login ke sistem.",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { verifyEmailController };