const express = require("express");
const router = express.Router();

const roleMiddleware = require("../../../middlewares/role.middleware");

const {
  getPengajuanMasukController,
  getDetailPengajuanController,
  approvePengajuanController,
  rejectPengajuanController,
} = require("../controllers/pembimbing.controller");

router.use(roleMiddleware([3]));

router.get("/pembimbing/pengajuan", getPengajuanMasukController);
router.get("/pembimbing/pengajuan/:id_pengajuan", getDetailPengajuanController);
router.patch("/pembimbing/pengajuan/:id_pengajuan/approve", approvePengajuanController);
router.patch("/pembimbing/pengajuan/:id_pengajuan/reject", rejectPengajuanController);

module.exports = router;
