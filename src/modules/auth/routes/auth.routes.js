const express = require("express");
const router = express.Router();
const { loginHandler, refreshHandler, logoutHandler } = require("../controllers/auth.controller");
const registerMahasiswa = require("../controllers/registerMahasiswa.controller");
const registerDosen = require("../controllers/registerDosen.controller");
const { verifyEmailController } = require("../controllers/emailVerification.controller");
const { uploadKTM } = require("../../../middlewares/upload.middleware");
const authMiddleware = require("../../../middlewares/auth.middleware");
const {
  loginLimiter,
  registerLimiter,
  verifyEmailLimiter,
} = require("../../../middlewares/ratelimit.middleware");

router.post("/register/mahasiswa", registerLimiter, uploadKTM.single("foto_ktm"), registerMahasiswa);
router.post("/register/dosen", registerLimiter, express.json(), registerDosen);
router.post("/login", loginLimiter, express.json(), loginHandler);
router.get("/verify-email", verifyEmailLimiter, verifyEmailController);
router.post("/refresh", refreshHandler);
router.post("/logout", authMiddleware, logoutHandler);

module.exports = router;