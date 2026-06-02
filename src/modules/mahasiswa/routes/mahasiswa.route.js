const express = require("express");
const router = express.Router();
const roleMiddleware = require("../../../middlewares/role.middleware");
const { ROLE } = require("../../../constants/role");
const { uploadFotoProfil, uploadProposal, uploadLuaran } = require("../../../middlewares/upload.middleware");

const { 
  getProfileController, 
  updateProfileController, 
  updatePasswordController,
  deleteProfilePhotoController
} = require("../controllers/profile.controller");

const { 
  createTimController, 
  searchMahasiswaController, 
  acceptInviteController, 
  rejectInviteController, 
  getTimStatusController, 
  getTimDetailController,
  addAnggotaController,
  resetTimController,
  cekEligibleInbisController,
  getRiwayatTimController,
  lanjutInbisController,
} = require("../controllers/tim.controller");

const { 
  createProposalController, 
  updateProposalController, 
  submitProposalController, 
  getProposalStatusController, 
  getProposalDetailController,
  getRiwayatProposalController,
} = require("../controllers/proposal.controller");

const { 
  listDosenPembimbingController, 
  ajukanPembimbingController, 
  getStatusPembimbingController,
  getRiwayatPembimbingController,
} = require("../controllers/pembimbing.controller");

const { 
  listBimbinganController, 
  detailBimbinganController, 
  ajukanBimbinganController,
  getRiwayatBimbinganController,
} = require("../controllers/bimbingan.controller");

const { 
  getLuaranMahasiswaController, 
  submitLuaranController,
  deleteLuaranController,
  cekEligibilitasInbisController,
  getRiwayatLuaranController,
} = require("../controllers/monev.controller");

router.use(roleMiddleware([ROLE.MAHASISWA]));

const uploadFotoOptional = (req, res, next) => {
  uploadFotoProfil.single("foto")(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

router.get("/profile", getProfileController);
router.patch("/profile", uploadFotoOptional, updateProfileController);
router.delete("/profile/foto", deleteProfilePhotoController);
router.put("/password", updatePasswordController);

router.get("/tim/status", getTimStatusController);
router.get("/tim/detail", getTimDetailController);
router.get("/tim/riwayat", getRiwayatTimController);
router.post("/tim", createTimController);
router.post("/tim/anggota", addAnggotaController);
router.post("/tim/lanjut-inbis", lanjutInbisController);
router.delete("/tim", resetTimController);
router.get("/search-mahasiswa", searchMahasiswaController);
router.post("/tim/:id_tim/accept", acceptInviteController);
router.post("/tim/:id_tim/reject", rejectInviteController);
router.get("/tim/eligibilitas-inbis", cekEligibleInbisController);

router.get("/proposal/status", getProposalStatusController);
router.get("/proposal/riwayat", getRiwayatProposalController);
router.get("/proposal/:id_proposal", getProposalDetailController);
router.post("/proposal", uploadProposal.single("file_proposal"), createProposalController);
router.patch("/proposal/:id_proposal", uploadProposal.single("file_proposal"), updateProposalController);
router.post("/proposal/:id_proposal/submit", submitProposalController);

router.get("/pembimbing/dosen", listDosenPembimbingController);
router.post("/pembimbing/ajukan", ajukanPembimbingController);
router.get("/pembimbing/status", getStatusPembimbingController);
router.get("/pembimbing/riwayat", getRiwayatPembimbingController);

router.get("/bimbingan", listBimbinganController);
router.get("/bimbingan/riwayat", getRiwayatBimbinganController);
router.get("/bimbingan/:id_bimbingan", detailBimbinganController);
router.post("/bimbingan/ajukan", ajukanBimbinganController);

router.get("/monev/luaran", getLuaranMahasiswaController);
router.get("/monev/luaran/riwayat", getRiwayatLuaranController);
router.post("/monev/luaran/:id_luaran/submit", uploadLuaran.single("file_luaran"), submitLuaranController);
router.delete("/monev/luaran/:id_luaran", deleteLuaranController);
router.get("/monev/eligibilitas-inbis", cekEligibilitasInbisController);

module.exports = router;