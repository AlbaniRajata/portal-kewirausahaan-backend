const { verifyEmail } = require("../services/emailVerification.service");

const verifyEmailController = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      message: "Token tidak ditemukan",
    });
  }

  const result = await verifyEmail(token);

  if (result.error) {
    return res.status(400).json({
      message: "Token tidak valid atau sudah kadaluarsa",
    });
  }

  res.json({
    message: "Email berhasil diverifikasi",
  });
};

module.exports = {
  verifyEmailController,
};
