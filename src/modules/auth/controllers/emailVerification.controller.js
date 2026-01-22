const { verifyEmail } = require("../services/emailVerification.service");

const verifyEmailController = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      message: "Token verifikasi tidak ditemukan. Silakan gunakan link verifikasi yang valid dari email Anda.",
    });
  }

  const result = await verifyEmail(token);

  if (result.error) {
    return res.status(400).json({
      message: "Token verifikasi tidak valid atau sudah kadaluarsa. Silakan lakukan registrasi ulang atau hubungi administrator.",
    });
  }

  res.json({
    message: "Email berhasil diverifikasi. Anda sekarang dapat melakukan login ke sistem.",
  });
};

module.exports = {
  verifyEmailController,
};
