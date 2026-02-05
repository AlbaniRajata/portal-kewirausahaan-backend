const express = require("express");
const router = express.Router();
const {
  registerMahasiswa,
  registerDosen,
  login,
} = require("../controllers/auth.controller");
const { verifyEmailController } = require("../controllers/emailVerification.controller");
const { uploadKTM } = require("../../../middlewares/upload.middleware");

router.post("/register/mahasiswa", uploadKTM.single("foto_ktm"), registerMahasiswa);
router.post("/register/dosen", registerDosen);
router.post("/login", login);
router.get("/verify-email", verifyEmailController);


module.exports = router;