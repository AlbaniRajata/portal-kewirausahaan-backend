const express = require("express");
const router = express.Router();

const {
    getPendingMahasiswa,
    getDetailMahasiswa,
    approveMahasiswaController,
    rejectMahasiswaController,
} = require("../controllers/verification.controller");

const {
  setProgramTimelineController,
} = require("../controllers/program.controller");

const {
  getProposalListController,
  getProposalDetailAdminController,
  getMonitoringDistribusiController,
} = require("../controllers/proposal.controller");

const {
  createReviewerController,
  getReviewersController,
  getReviewerDetailController
} = require("../controllers/reviewer.controller");

const {
  createJuriController,
  getJurisController,
  getJuriDetailController,
} = require("../controllers/juri.controller");

const {
  previewDistribusiTahap1Controller,
  autoDistribusiTahap1Controller,
  manualDistribusiTahap1Controller,
} = require("../controllers/distribusi.controller");

const {
  getRekapDeskEvaluasiController,
  finalisasiDeskBatchController,
} = require("../controllers/penilaian.controller");

const roleMiddleware = require("../../../middlewares/role.middleware");

router.use(roleMiddleware([2, 6])); // Admin and Super Admin

router.get("/verifikasi/mahasiswa", getPendingMahasiswa);
router.get("/verifikasi/mahasiswa/:id", getDetailMahasiswa);
router.post("/verifikasi/mahasiswa/:id/approve", approveMahasiswaController);
router.post("/verifikasi/mahasiswa/:id/reject", rejectMahasiswaController);

router.patch("/program/:id_program/timeline", setProgramTimelineController);

router.get("/proposal", getProposalListController);
router.get("/proposal/monitoring", getMonitoringDistribusiController);
router.get("/proposal/:id_proposal", getProposalDetailAdminController);

router.post("/reviewer", createReviewerController);
router.get("/reviewer", getReviewersController);
router.get("/reviewer/:id_user", getReviewerDetailController);

router.post("/juri", createJuriController);
router.get("/juri", getJurisController);
router.get("/juri/:id_user", getJuriDetailController);

router.get("/distribusi/reviewer/tahap/:tahap/preview", previewDistribusiTahap1Controller);
router.post("/distribusi/reviewer/tahap/:tahap/auto", autoDistribusiTahap1Controller);
router.post("/distribusi/reviewer/tahap/:tahap/manual", manualDistribusiTahap1Controller);

router.get("/proposal/:id_proposal/rekap-desk", getRekapDeskEvaluasiController);
router.post("/proposal/finalisasi-desk-batch", finalisasiDeskBatchController);

module.exports = router;
