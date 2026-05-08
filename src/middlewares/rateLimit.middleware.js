const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.body?.email ? req.body.email.toLowerCase().trim() : req.ip;
  },
  message: {
    success: false,
    message:
      "Terlalu banyak percobaan login. Silahkan coba lagi setelah 5 menit.",
    data: null,
  },
  skipSuccessfulRequests: true,
});

const registerLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.body?.email ? req.body.email.toLowerCase().trim() : req.ip;
  },
  message: {
    success: false,
    message:
      "Terlalu banyak percobaan registrasi. Silahkan coba lagi setelah 5 menit.",
    data: null,
  },
  skipSuccessfulRequests: true,
});

const verifyEmailLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.body?.email ? req.body.email.toLowerCase().trim() : req.ip;
  },
  message: {
    success: false,
    message: 
      "Terlalu banyak percobaan verifikasi. Silahkan coba lagi setelah 5 menit.",
    data: null,
  },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.body?.email ? req.body.email.toLowerCase().trim() : req.ip;
  },
  message: {
    success: false,
    message:
      "Terlalu banyak permintaan reset password. Silahkan coba lagi setelah 5 menit.",
    data: null,
  },
});

module.exports = {
  loginLimiter,
  registerLimiter,
  verifyEmailLimiter,
  forgotPasswordLimiter,
};