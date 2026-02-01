const express = require("express");
const router = express.Router();

const roleMiddleware = require("../../../middlewares/role.middleware");

const {
  getPengajuanMasukController,
  getDetailPengajuanController,
  approvePengajuanController,
  rejectPengajuanController,
} = require("../controllers/pembimbing.controller");

const {
  getBimbinganMasukController,
  getDetailBimbinganController,
  approveBimbinganController,
  rejectBimbinganController,
} = require("../controllers/bimbingan.controller");

router.use(roleMiddleware([3]));

router.get("/pembimbing/pengajuan", getPengajuanMasukController);
router.get("/pembimbing/pengajuan/:id_pengajuan", getDetailPengajuanController);
router.patch("/pembimbing/pengajuan/:id_pengajuan/approve", approvePengajuanController);
router.patch("/pembimbing/pengajuan/:id_pengajuan/reject", rejectPengajuanController);

router.get("/bimbingan/pengajuan", getBimbinganMasukController);
router.get("/bimbingan/pengajuan/:id_bimbingan", getDetailBimbinganController);
router.patch("/bimbingan/pengajuan/:id_bimbingan/approve", approveBimbinganController);
router.patch("/bimbingan/pengajuan/:id_bimbingan/reject", rejectBimbinganController);

module.exports = router;
