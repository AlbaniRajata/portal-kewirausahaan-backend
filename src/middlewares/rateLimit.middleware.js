const rateLimit = require("express-rate-limit");

const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: options.max || 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: options.message || "Terlalu banyak permintaan. Silahkan coba lagi nanti.",
      data: { code: "RATE_LIMITED" }
    },
    skipSuccessfulRequests: options.skipSuccessful || false,
    keyGenerator: (req) => {
      return req.ip + ":" + (req.user?.id_user || "anonymous");
    }
  });
};

const loginLimiter = createRateLimiter({
  max: 10,
  message: "Terlalu banyak percobaan login. Silahkan coba lagi setelah 15 menit.",
  skipSuccessful: true
});

const registerLimiter = createRateLimiter({
  max: 5,
  message: "Terlalu banyak percobaan registrasi. Silahkan coba lagi setelah 15 menit."
});

const verifyEmailLimiter = createRateLimiter({
  max: 10,
  message: "Terlalu banyak percobaan verifikasi. Silahkan coba lagi setelah 15 menit."
});

const forgotPasswordLimiter = createRateLimiter({
  max: 5,
  message: "Terlalu banyak permintaan reset password. Silahkan coba lagi setelah 15 menit."
});

const apiLimiter = createRateLimiter({
  max: 100,
  message: "Terlalu banyak permintaan API. Silahkan coba lagi nanti."
});

const uploadLimiter = createRateLimiter({
  max: 20,
  message: "Terlalu banyak upload file. Silahkan coba lagi nanti."
});

const criticalActionLimiter = createRateLimiter({
  max: 30,
  message: "Terlalu banyak aksi. Silahkan coba lagi nanti."
});

module.exports = {
  createRateLimiter,
  loginLimiter,
  registerLimiter,
  verifyEmailLimiter,
  forgotPasswordLimiter,
  apiLimiter,
  uploadLimiter,
  criticalActionLimiter,
};