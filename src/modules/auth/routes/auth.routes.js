const express = require("express");
const router = express.Router();
const {
  loginHandler,
  refreshHandler,
  logoutHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} = require("../controllers/auth.controller");
const registerMahasiswa = require("../controllers/registerMahasiswa.controller");
const registerDosen = require("../controllers/registerDosen.controller");
const {
  verifyEmailController,
  resendVerificationController,
  cancelRegistrasiController,
} = require("../controllers/emailVerification.controller");
const { uploadKTM } = require("../../../middlewares/upload.middleware");
const authMiddleware = require("../../../middlewares/auth.middleware");
const {
  loginLimiter,
  registerLimiter,
  verifyEmailLimiter,
  forgotPasswordLimiter,
} = require("../../../middlewares/rateLimit.middleware");

router.post("/register/mahasiswa", registerLimiter, uploadKTM.single("foto_ktm"), registerMahasiswa);
router.post("/register/dosen", registerLimiter, express.json(), registerDosen);
router.post("/login", loginLimiter, express.json(), loginHandler);
router.post("/forgot-password", forgotPasswordLimiter, express.json(), forgotPasswordHandler);
router.post("/reset-password", forgotPasswordLimiter, express.json(), resetPasswordHandler);
router.post("/verify-email", verifyEmailLimiter, verifyEmailController);
router.post("/resend-verification", verifyEmailLimiter, resendVerificationController);
router.post("/cancel-registration", verifyEmailLimiter, cancelRegistrasiController);
router.post("/refresh", refreshHandler);
router.post("/logout", authMiddleware, logoutHandler);

module.exports = router;