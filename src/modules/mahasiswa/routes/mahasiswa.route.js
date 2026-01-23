const express = require("express");
const router = express.Router();
const roleMiddleware = require("../../../middlewares/role.middleware");
const { uploadFotoProfil } = require("../../../middlewares/upload.middleware");

const {
  getProfileController,
  updateProfileController,
  updatePasswordController,
} = require("../controllers/profile.controller");

router.use(roleMiddleware(["mahasiswa"]));

const uploadOptional = (req, res, next) => {
  uploadFotoProfil.single("foto")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ 
        message: err.message 
      });
    }
    next();
  });
};

router.get("/profile", getProfileController);

router.patch("/profile", uploadOptional, updateProfileController);

router.put("/password", updatePasswordController);

module.exports = router;