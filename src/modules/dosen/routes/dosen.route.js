const express = require("express");
const router = express.Router();
const roleMiddleware = require("../../../middlewares/role.middleware");
const { ROLE } = require("../../../constants/role");
const { uploadFotoProfil } = require("../../../middlewares/upload.middleware");

const { 
  getProfileController, 
  updateProfileController, 
  updatePasswordController 
} = require("../controllers/profile.controller");
const { 
  getPengajuanMasukController, 
  getDetailPengajuanController, 
  approvePengajuanController, 
  rejectPengajuanController 
} = require("../controllers/pembimbing.controller");
const { 
  getBimbinganMasukController, 
  getDetailBimbinganController, 
  approveBimbinganController, 
  rejectBimbinganController 
} = require("../controllers/bimbingan.controller");

router.use(roleMiddleware([ROLE.DOSEN]));

const uploadFotoOptional = (req, res, next) => {
  uploadFotoProfil.single("foto")(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

router.get("/profile", getProfileController);
router.patch("/profile", uploadFotoOptional, updateProfileController);
router.put("/password", updatePasswordController);

router.get("/pembimbing/pengajuan", getPengajuanMasukController);
router.get("/pembimbing/pengajuan/:id_pengajuan", getDetailPengajuanController);
router.patch("/pembimbing/pengajuan/:id_pengajuan/approve", approvePengajuanController);
router.patch("/pembimbing/pengajuan/:id_pengajuan/reject", rejectPengajuanController);

router.get("/bimbingan/pengajuan", getBimbinganMasukController);
router.get("/bimbingan/pengajuan/:id_bimbingan", getDetailBimbinganController);
router.patch("/bimbingan/pengajuan/:id_bimbingan/approve", approveBimbinganController);
router.patch("/bimbingan/pengajuan/:id_bimbingan/reject", rejectBimbinganController);

module.exports = router;