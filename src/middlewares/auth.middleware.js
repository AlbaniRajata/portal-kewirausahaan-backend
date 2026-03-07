const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token autentikasi tidak ditemukan atau format tidak valid",
      data: null,
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token autentikasi tidak ditemukan",
      data: null,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Sesi Anda telah berakhir. Silakan login kembali.",
        data: { code: "TOKEN_EXPIRED" },
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token tidak valid",
      data: { code: "TOKEN_INVALID" },
    });
  }
};