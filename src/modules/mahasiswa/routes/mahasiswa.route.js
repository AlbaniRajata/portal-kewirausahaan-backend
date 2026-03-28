const express = require("express");
const router = express.Router();
const roleMiddleware = require("../../../middlewares/role.middleware");
const { ROLE } = require("../../../constants/role");
const { uploadFotoProfil, uploadProposal, uploadLuaran } = require("../../../middlewares/upload.middleware");

const { 
  getProfileController, 
  updateProfileController, 
  updatePasswordController
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
} = require("../controllers/tim.controller");

const { 
  createProposalController, 
  updateProposalController, 
  submitProposalController, 
  getProposalStatusController, 
  getProposalDetailController 
} = require("../controllers/proposal.controller");

const { 
  listDosenPembimbingController, 
  ajukanPembimbingController, 
  getStatusPembimbingController 
} = require("../controllers/pembimbing.controller");

const { 
  listBimbinganController, 
  detailBimbinganController, 
  ajukanBimbinganController 
} = require("../controllers/bimbingan.controller");

const { 
  getLuaranMahasiswaController, 
  submitLuaranController 
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
router.put("/password", updatePasswordController);

router.get("/tim/status", getTimStatusController);
router.get("/tim/detail", getTimDetailController);
router.post("/tim", createTimController);
router.post("/tim/anggota", addAnggotaController);
router.delete("/tim", resetTimController);
router.get("/search-mahasiswa", searchMahasiswaController);
router.post("/tim/:id_tim/accept", acceptInviteController);
router.post("/tim/:id_tim/reject", rejectInviteController);

router.get("/proposal/status", getProposalStatusController);
router.get("/proposal/:id_proposal", getProposalDetailController);
router.post("/proposal", uploadProposal.single("file_proposal"), createProposalController);
router.patch("/proposal/:id_proposal", uploadProposal.single("file_proposal"), updateProposalController);
router.post("/proposal/:id_proposal/submit", submitProposalController);

router.get("/pembimbing/dosen", listDosenPembimbingController);
router.post("/pembimbing/ajukan", ajukanPembimbingController);
router.get("/pembimbing/status", getStatusPembimbingController);

router.get("/bimbingan", listBimbinganController);
router.get("/bimbingan/:id_bimbingan", detailBimbinganController);
router.post("/bimbingan/ajukan", ajukanBimbinganController);

router.get("/monev/luaran", getLuaranMahasiswaController);
router.post("/monev/luaran/:id_luaran/submit", uploadLuaran.single("file_luaran"), submitLuaranController);
module.exports = router;