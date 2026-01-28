const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middlewares/auth.middleware");
const roleMiddleware = require("../../../middlewares/role.middleware");

const {
  getPenugasanController,
  getDetailPenugasanController,
  acceptPenugasanController,
  rejectPenugasanController,
} = require("../controllers/penugasan.controller");

const {
  getFormPenilaianController,
  simpanNilaiController,
  submitPenilaianController,
} = require("../controllers/penilaian.controller");

router.use(authMiddleware);
router.use(roleMiddleware([5]));

router.get("/penugasan", getPenugasanController);
router.get("/penugasan/:id_distribusi", getDetailPenugasanController);
router.post("/penugasan/:id_distribusi/accept", acceptPenugasanController);
router.post("/penugasan/:id_distribusi/reject", rejectPenugasanController);

router.get("/penilaian/:id_distribusi", getFormPenilaianController);
router.post("/penilaian/:id_distribusi/simpan", simpanNilaiController);
router.post("/penilaian/:id_distribusi/submit", submitPenilaianController);

module.exports = router;
