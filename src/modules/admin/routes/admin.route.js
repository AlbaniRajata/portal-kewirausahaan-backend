const express = require("express");
const router = express.Router();

const {
  getPendingMahasiswaController,
  getDetailMahasiswaController,
  approveMahasiswaController,
  rejectMahasiswaController,
} = require("../controllers/verification.controller");

const {
  getAllProgramListController,
  getProgramListForNavbarController,
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
  getProposalListPembimbingController,
  updatePembimbingController,
  updateBatchPembimbingController,
  getDosenController,
  getDosenBebanController,
} = require("../controllers/pembimbing.controller");

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
  reassignReviewerTahap2Controller,
  reassignJuriTahap2Controller,
  getPanelTahap2HistoryController,
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

const {
  getHistoryPenilaianTahap1Controller,
  getHistoryPenilaianTahap2Controller,
  getHistoryDetailTahap1Controller,
  getHistoryDetailTahap2Controller,
} = require("../controllers/historyPenilaian.controller");

const {
  getLuaranProgramController,
  createLuaranController,
  updateLuaranController,
  deleteLuaranController,
  getProgressLuaranTimController,
  getDetailLuaranTimController,
  reviewLuaranTimController,
} = require("../controllers/monev.controller");

const { getDashboardAdminController } = require("../controllers/dashboard.controller");

const {
  getProfileController,
  updateProfileController,
  updatePasswordController,
} = require("../controllers/profile.controller");

const { uploadBerita, uploadFotoProfil } = require("../../../middlewares/upload.middleware");
const roleMiddleware = require("../../../middlewares/role.middleware");
const { ROLE } = require("../../../constants/role");

router.use(roleMiddleware([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

const uploadFotoOptional = (req, res, next) => {
  uploadFotoProfil.single("foto")(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

router.get("/profile", getProfileController);
router.patch("/profile", uploadFotoOptional, updateProfileController);
router.put("/password", updatePasswordController);

router.get("/verifikasi/mahasiswa", getPendingMahasiswaController);
router.get("/verifikasi/mahasiswa/:id", getDetailMahasiswaController);
router.post("/verifikasi/mahasiswa/:id/approve", approveMahasiswaController);
router.post("/verifikasi/mahasiswa/:id/reject", rejectMahasiswaController);

router.get("/program", getAllProgramListController);
router.get("/program/my", getProgramAdminController);
router.get("/program/navbar", getProgramListForNavbarController);
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

router.get("/pemerataan-pembimbing/proposal", getProposalListPembimbingController);
router.get("/pemerataan-pembimbing/dosen", getDosenController);
router.get("/pemerataan-pembimbing/dosen/beban", getDosenBebanController);
router.patch("/pemerataan-pembimbing/tim/:id_tim", updatePembimbingController);
router.post("/pemerataan-pembimbing/tim/batch", updateBatchPembimbingController);
router.post("/pemerataan-pembimbing/batch-update", updateBatchPembimbingController);

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
router.get("/program/:id_program/panel/tahap2/history", getPanelTahap2HistoryController);
router.post("/program/:id_program/panel/tahap2/reviewer/:id_distribusi/reassign", reassignReviewerTahap2Controller);
router.post("/program/:id_program/panel/tahap2/juri/:id_distribusi/reassign", reassignJuriTahap2Controller);

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
router.post("/berita", uploadBerita.fields([
  { name: "file_gambar", maxCount: 1 },
  { name: "file_pdf", maxCount: 1 },
]), createBeritaController);
router.patch("/berita/:id_berita", uploadBerita.fields([
  { name: "file_gambar", maxCount: 1 },
  { name: "file_pdf", maxCount: 1 },
]), updateBeritaController);
router.patch("/berita/:id_berita/gambar", uploadBerita.fields([
  { name: "file_gambar", maxCount: 1 },
  { name: "file_pdf", maxCount: 1 },
]), updateGambarController);
router.delete("/berita/:id_berita", deleteBeritaController);

router.get("/program/:id_program/history-penilaian/tahap1", getHistoryPenilaianTahap1Controller);
router.get("/program/:id_program/history-penilaian/tahap2", getHistoryPenilaianTahap2Controller);
router.get("/program/:id_program/proposal/:id_proposal/history-penilaian/tahap1", getHistoryDetailTahap1Controller);
router.get("/program/:id_program/proposal/:id_proposal/history-penilaian/tahap2", getHistoryDetailTahap2Controller);

router.get("/program/:id_program/luaran", getLuaranProgramController);
router.post("/program/:id_program/luaran", createLuaranController);
router.patch("/luaran/:id_luaran", updateLuaranController);
router.delete("/luaran/:id_luaran", deleteLuaranController);
router.get("/program/:id_program/monev/progress", getProgressLuaranTimController);
router.get("/program/:id_program/tim/:id_tim/monev", getDetailLuaranTimController);
router.patch("/monev/luaran-tim/:id_luaran_tim/review", reviewLuaranTimController);

router.get("/program/:id_program/dashboard", getDashboardAdminController);

module.exports = router;