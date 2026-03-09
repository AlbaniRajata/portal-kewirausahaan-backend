const express = require("express");
const router = express.Router();

const {
  getPendingMahasiswaController,
  getDetailMahasiswaController,
  approveMahasiswaController,
  rejectMahasiswaController,
  getPendingDosenController,
  getDetailDosenController,
  approveDosenController,
  rejectDosenController,
} = require("../controllers/verification.controller");

const {
  getProgramAdminController,
  setProgramTimelineController,
  getTahapProgramController,
  createTahapProgramController,
  updateJadwalTahapController,
  deleteTahapController,
  getKriteriaPenilaianController,
  createKriteriaPenilaianController,
  updateKriteriaPenilaianController,
  deleteKriteriaPenilaianController,
} = require("../controllers/program.controller");

const {
  getProposalListController,
  getProposalDetailAdminController,
  getMonitoringDistribusiController,
} = require("../controllers/proposal.controller");

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
  getListProposalRekapTahap1Controller,
  getListProposalRekapTahap2Controller,
  getRekapDeskEvaluasiController,
  finalisasiDeskBatchController,
  getRekapWawancaraTahap2Controller,
  finalisasiWawancaraBatchController,
} = require("../controllers/penilaian.controller");

const {
  previewDistribusiTahap2Controller,
  autoDistribusiTahap2Controller,
  manualDistribusiTahap2Controller,
  getDistribusiReviewerHistoryTahap2Controller,
  getDistribusiJuriHistoryTahap2Controller,
} = require("../controllers/distribusiTahap2.controller");

const {
  getDashboardPengajuanPembimbingController,
  getDashboardBimbinganController,
} = require("../controllers/bimbingan.controller");

const {
  getKampusController,
  getKampusByIdController,
  createKampusController,
  updateKampusController,
  deleteKampusController,
  getJurusanController,
  getJurusanByIdController,
  createJurusanController,
  updateJurusanController,
  deleteJurusanController,
  getProdiController,
  getProdiByIdController,
  createProdiController,
  updateProdiController,
  deleteProdiController,
} = require("../controllers/akademik.controller");

const {
  getKategoriController,
  getKategoriByIdController,
  createKategoriController,
  updateKategoriController,
  deleteKategoriController,
} = require("../controllers/kategori.controller");

const {
  getMahasiswaListController,
  getDosenListController,
  getReviewerListController,
  getJuriListController,
  createMahasiswaController,
  createDosenController,
  createReviewerController,
  createJuriController,
  updateMahasiswaController,
  updateDosenController,
  updateReviewerController,
  updateJuriController,
  toggleUserActiveController,
  resetPasswordController,
} = require("../controllers/pengguna.controller");

const {
  getTimListController,
  getTimDetailController,
  getPesertaListController,
  getPesertaDetailController,
} = require("../controllers/timpeserta.controller");

const {
  getBeritaListAdminController,
  getBeritaDetailAdminController,
  createBeritaController,
  updateBeritaController,
  updateGambarController,
  deleteBeritaController,
} = require("../controllers/berita.controller");

const { uploadBerita } = require("../../../middlewares/upload.middleware");
const roleMiddleware = require("../../../middlewares/role.middleware");
const { ROLE } = require("../../../constants/role");

router.use(roleMiddleware([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

router.get("/verifikasi/mahasiswa", getPendingMahasiswaController);
router.get("/verifikasi/mahasiswa/:id", getDetailMahasiswaController);
router.post("/verifikasi/mahasiswa/:id/approve", approveMahasiswaController);
router.post("/verifikasi/mahasiswa/:id/reject", rejectMahasiswaController);

router.get("/verifikasi/dosen", getPendingDosenController);
router.get("/verifikasi/dosen/:id", getDetailDosenController);
router.post("/verifikasi/dosen/:id/approve", approveDosenController);
router.post("/verifikasi/dosen/:id/reject", rejectDosenController);

router.get("/program/my", getProgramAdminController);
router.patch("/program/:id_program/timeline", setProgramTimelineController);
router.get("/program/:id_program/tahap", getTahapProgramController);
router.post("/program/:id_program/tahap", createTahapProgramController);
router.patch("/tahap/:id_tahap", updateJadwalTahapController);
router.delete("/tahap/:id_tahap", deleteTahapController);
router.get("/tahap/:id_tahap/kriteria", getKriteriaPenilaianController);
router.post("/tahap/:id_tahap/kriteria", createKriteriaPenilaianController);
router.patch("/kriteria/:id_kriteria", updateKriteriaPenilaianController);
router.delete("/kriteria/:id_kriteria", deleteKriteriaPenilaianController);

router.get("/proposal", getProposalListController);
router.get("/proposal/monitoring", getMonitoringDistribusiController);
router.get("/proposal/:id_proposal", getProposalDetailAdminController);

router.get("/program/:id_program/distribusi/reviewer/tahap/:tahap/preview", previewDistribusiTahap1Controller);
router.post("/program/:id_program/distribusi/reviewer/tahap/:tahap/auto", autoDistribusiTahap1Controller);
router.post("/program/:id_program/distribusi/reviewer/tahap/:tahap/manual", manualDistribusiTahap1Controller);
router.post("/program/:id_program/distribusi/reviewer/tahap/:tahap/bulk", bulkDistribusiTahap1Controller);
router.get("/program/:id_program/distribusi/reviewer/tahap/:tahap/history", getDistribusiHistoryController);
router.get("/program/:id_program/distribusi/reviewer/tahap/:tahap/:id_distribusi", getDistribusiDetailController);
router.post("/program/:id_program/distribusi/reviewer/tahap/:tahap/:id_distribusi/reassign", reassignReviewerController);

router.get("/program/:id_program/rekap-tahap1/list", getListProposalRekapTahap1Controller);
router.get("/program/:id_program/rekap-tahap2/list", getListProposalRekapTahap2Controller);
router.get("/program/:id_program/proposal/:id_proposal/rekap-desk", getRekapDeskEvaluasiController);
router.post("/program/:id_program/proposal/finalisasi-desk-batch", finalisasiDeskBatchController);
router.get("/program/:id_program/proposal/:id_proposal/rekap-wawancara", getRekapWawancaraTahap2Controller);
router.post("/program/:id_program/proposal/finalisasi-wawancara-batch", finalisasiWawancaraBatchController);

router.get("/program/:id_program/panel/tahap2/preview", previewDistribusiTahap2Controller);
router.post("/program/:id_program/panel/tahap2/auto", autoDistribusiTahap2Controller);
router.post("/program/:id_program/panel/tahap2/manual", manualDistribusiTahap2Controller);
router.get("/program/:id_program/distribusi/reviewer/tahap/2/history", getDistribusiReviewerHistoryTahap2Controller);
router.get("/program/:id_program/distribusi/juri/tahap/2/history", getDistribusiJuriHistoryTahap2Controller);

router.get("/bimbingan/pengajuan", getDashboardPengajuanPembimbingController);
router.get("/bimbingan/jadwal", getDashboardBimbinganController);

router.get("/kampus", getKampusController);
router.get("/kampus/:id_kampus", getKampusByIdController);
router.post("/kampus", createKampusController);
router.patch("/kampus/:id_kampus", updateKampusController);
router.delete("/kampus/:id_kampus", deleteKampusController);

router.get("/jurusan", getJurusanController);
router.get("/jurusan/:id_jurusan", getJurusanByIdController);
router.post("/jurusan", createJurusanController);
router.patch("/jurusan/:id_jurusan", updateJurusanController);
router.delete("/jurusan/:id_jurusan", deleteJurusanController);

router.get("/prodi", getProdiController);
router.get("/prodi/:id_prodi", getProdiByIdController);
router.post("/prodi", createProdiController);
router.patch("/prodi/:id_prodi", updateProdiController);
router.delete("/prodi/:id_prodi", deleteProdiController);

router.get("/kategori", getKategoriController);
router.get("/kategori/:id_kategori", getKategoriByIdController);
router.post("/kategori", createKategoriController);
router.patch("/kategori/:id_kategori", updateKategoriController);
router.delete("/kategori/:id_kategori", deleteKategoriController);

router.get("/pengguna/mahasiswa", getMahasiswaListController);
router.post("/pengguna/mahasiswa", createMahasiswaController);
router.patch("/pengguna/mahasiswa/:id_user", updateMahasiswaController);

router.get("/pengguna/dosen", getDosenListController);
router.post("/pengguna/dosen", createDosenController);
router.patch("/pengguna/dosen/:id_user", updateDosenController);

router.get("/pengguna/reviewer", getReviewerListController);
router.post("/pengguna/reviewer", createReviewerController);
router.patch("/pengguna/reviewer/:id_user", updateReviewerController);

router.get("/pengguna/juri", getJuriListController);
router.post("/pengguna/juri", createJuriController);
router.patch("/pengguna/juri/:id_user", updateJuriController);

router.patch("/pengguna/:id_user/toggle-active", toggleUserActiveController);
router.patch("/pengguna/:id_user/reset-password", resetPasswordController);

router.get("/tim-peserta/tim", getTimListController);
router.get("/tim-peserta/tim/:id_tim", getTimDetailController);
router.get("/tim-peserta/peserta", getPesertaListController);
router.get("/tim-peserta/peserta/:id_user/:id_program", getPesertaDetailController);

router.get("/berita", getBeritaListAdminController);
router.get("/berita/:id_berita", getBeritaDetailAdminController);
router.post("/berita", uploadBerita.single("file_gambar"), createBeritaController);
router.patch("/berita/:id_berita", uploadBerita.single("file_gambar"), updateBeritaController);
router.patch("/berita/:id_berita/gambar", uploadBerita.single("file_gambar"), updateGambarController);
router.delete("/berita/:id_berita", deleteBeritaController);

module.exports = router;