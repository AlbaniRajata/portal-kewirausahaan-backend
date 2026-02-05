const express = require("express");
const router = express.Router();
const login = require("../controllers/auth.controller");
const registerMahasiswa = require("../../auth/controllers/registerMahasiswa.controller");
const registerDosen = require("../../auth/controllers/registerDosen.controller");
const { verifyEmailController } = require("../controllers/emailVerification.controller");
const { uploadKTM, } = require("../../../middlewares/upload.middleware");

router.post("/register/mahasiswa", uploadKTM.single("foto_ktm"), registerMahasiswa);
router.post("/register/dosen", express.json(), registerDosen);
router.post("/login", express.json(), login);
router.get("/verify-email", verifyEmailController);

module.exports = router;