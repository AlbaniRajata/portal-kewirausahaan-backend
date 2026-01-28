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
  previewDistribusiController,
  autoDistribusiController,
  manualDistribusiController,
} = require("../controllers/distribusi.controller");

const {
  getRekapPenilaianController,
} = require("../controllers/penilaian.controller");

const authMiddleware = require("../../../middlewares/auth.middleware");
const roleMiddleware = require("../../../middlewares/role.middleware");

router.use(authMiddleware);
router.use(roleMiddleware([2, 6])); // Admin and Super Admin

router.get("/verifikasi/mahasiswa", getPendingMahasiswa);
router.get("/verifikasi/mahasiswa/:id", getDetailMahasiswa);
router.post("/verifikasi/mahasiswa/:id/approve", approveMahasiswaController);
router.post("/verifikasi/mahasiswa/:id/reject", rejectMahasiswaController);

router.patch("/program/:id_program/timeline", setProgramTimelineController);

router.get("/proposal", getProposalListController);
router.get("/proposal/:id_proposal", getProposalDetailAdminController);
router.get("/proposal/monitoring", getMonitoringDistribusiController);

router.post("/reviewer", createReviewerController);
router.get("/reviewer", getReviewersController);
router.get("/reviewer/:id_user", getReviewerDetailController);

router.post("/juri", createJuriController);
router.get("/juri", getJurisController);
router.get("/juri/:id_user", getJuriDetailController);

router.get("/proposal/distribusi/preview", previewDistribusiController);
router.post("/proposal/distribusi/auto", autoDistribusiController);
router.post("/proposal/distribusi/manual", manualDistribusiController);

router.get("/penilaian/:id_proposal/:id_tahap", getRekapPenilaianController);

module.exports = router;
