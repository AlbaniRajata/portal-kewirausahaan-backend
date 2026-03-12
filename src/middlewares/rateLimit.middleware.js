const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.",
    data: null,
  },
  skipSuccessfulRequests: true,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Terlalu banyak percobaan registrasi. Silakan coba lagi setelah 1 jam.",
    data: null,
  },
});

const verifyEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak percobaan verifikasi. Silakan coba lagi nanti.",
    data: null,
  },
});

module.exports = {
  loginLimiter,
  registerLimiter,
  verifyEmailLimiter,
};