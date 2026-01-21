const express = require("express");
const router = express.Router();
const {
  register,
  login,
} = require("../controllers/auth.controller");
const { verifyEmailController } = require("../controllers/emailVerification.controller");
const upload = require("../middlewares/upload.middleware");

router.post("/register", upload.single("foto_ktm"), register);

router.post("/login", login);

router.get("/verify-email", verifyEmailController);

module.exports = router;
