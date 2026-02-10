const express = require("express");
const router = express.Router();

const {
    getPendingMahasiswa,
    getDetailMahasiswa,
    approveMahasiswaController,
    rejectMahasiswaController,
    getPendingDosen,
    getDetailDosen,
    approveDosenController,
    rejectDosenController,
} = require("../controllers/verification.controller");

const {
  setProgramTimelineController,
  getTahapProgramController,
  createTahapProgramController,
  updateJadwalTahapController
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
  bulkDistribusiTahap1Controller,
  getDistribusiHistoryController,
  getDistribusiDetailController,
  reassignReviewerController,
} = require("../controllers/distribusiTahap1.controller");

const {
  getRekapDeskEvaluasiController,
  finalisasiDeskBatchController,
  getRekapWawancaraTahap2Controller,
  finalisasiWawancaraBatchController,
} = require("../controllers/penilaian.controller");

const {
  scheduleWawancaraController,
  scheduleWawancaraBulkController,
} = require("../controllers/wawancara.controller");

const {
  previewDistribusiTahap2Controller,
  autoDistribusiTahap2Controller,
  manualDistribusiTahap2Controller,
} = require("../controllers/distribusiTahap2.controller");

const roleMiddleware = require("../../../middlewares/role.middleware");

router.use(roleMiddleware([2, 6])); // Admin and Super Admin

router.get("/verifikasi/mahasiswa", getPendingMahasiswa);
router.get("/verifikasi/mahasiswa/:id", getDetailMahasiswa);
router.post("/verifikasi/mahasiswa/:id/approve", approveMahasiswaController);
router.post("/verifikasi/mahasiswa/:id/reject", rejectMahasiswaController);

router.get("/verifikasi/dosen", getPendingDosen);
router.get("/verifikasi/dosen/:id", getDetailDosen);
router.post("/verifikasi/dosen/:id/approve", approveDosenController);
router.post("/verifikasi/dosen/:id/reject", rejectDosenController);

router.patch("/program/:id_program/timeline", setProgramTimelineController);

router.get("/program/:id_program/tahap", getTahapProgramController);
router.post("/program/:id_program/tahap", createTahapProgramController);
router.patch("/tahap/:id_tahap", updateJadwalTahapController);

router.get("/proposal", getProposalListController);
router.get("/proposal/monitoring", getMonitoringDistribusiController);
router.get("/proposal/:id_proposal", getProposalDetailAdminController);

router.post("/reviewer", createReviewerController);
router.get("/reviewer", getReviewersController);
router.get("/reviewer/:id_user", getReviewerDetailController);

router.post("/juri", createJuriController);
router.get("/juri", getJurisController);
router.get("/juri/:id_user", getJuriDetailController);

router.get("/program/:id_program/distribusi/reviewer/tahap/:tahap/preview", previewDistribusiTahap1Controller);
router.post("/program/:id_program/distribusi/reviewer/tahap/:tahap/auto", autoDistribusiTahap1Controller);
router.post("/program/:id_program/distribusi/reviewer/tahap/:tahap/manual", manualDistribusiTahap1Controller);
router.post("/program/:id_program/distribusi/reviewer/tahap/:tahap/bulk", bulkDistribusiTahap1Controller);
router.get("/program/:id_program/distribusi/reviewer/tahap/:tahap/history", getDistribusiHistoryController);
router.get("/program/:id_program/distribusi/reviewer/tahap/:tahap/:id_distribusi", getDistribusiDetailController);
router.post("/program/:id_program/distribusi/reviewer/tahap/:tahap/:id_distribusi/reassign", reassignReviewerController);

router.get("/program/:id_program/proposal/:id_proposal/rekap-desk", getRekapDeskEvaluasiController);
router.post("/program/:id_program/proposal/finalisasi-desk-batch", finalisasiDeskBatchController);
router.get("/program/:id_program/proposal/:id_proposal/rekap-wawancara", getRekapWawancaraTahap2Controller);
router.post("/program/:id_program/proposal/finalisasi-wawancara", finalisasiWawancaraBatchController);

router.patch("/proposal/:id_proposal/wawancara", scheduleWawancaraController);
router.patch("/proposal/wawancara/bulk", scheduleWawancaraBulkController);

router.get("/program/:id_program/panel/tahap2/preview", previewDistribusiTahap2Controller);
router.post("/program/:id_program/panel/tahap2/auto", autoDistribusiTahap2Controller);
router.post("/program/:id_program/panel/tahap2/manual", manualDistribusiTahap2Controller);

module.exports = router;
