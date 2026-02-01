const express = require("express");
const router = express.Router();
const roleMiddleware = require("../../../middlewares/role.middleware");
const {
  uploadFotoProfil,
  uploadProposal,
} = require("../../../middlewares/upload.middleware");

const {
  getProfileController,
  updateProfileController,
  updatePasswordController,
} = require("../controllers/profile.controller");

const {
  createTimController,
  searchMahasiswaController,
  acceptInviteController,
  rejectInviteController,
} = require("../controllers/tim.controller");

const {
  createProposalController,
  updateProposalController,
  submitProposalController,
} = require("../controllers/proposal.controller");

const {
  listDosenPembimbingController,
  ajukanPembimbingController,
  getStatusPembimbingController,
} = require("../controllers/pembimbing.controller");

const {
  listBimbinganController,
  detailBimbinganController,
  ajukanBimbinganController,
} = require("../controllers/bimbingan.controller");

router.use(roleMiddleware([1]));

const uploadOptional = (req, res, next) => {
  uploadFotoProfil.single("foto")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        data: {},
        meta: {},
      });
    }
    next();
  });
};

router.get("/profile", getProfileController);
router.patch("/profile", uploadOptional, updateProfileController);
router.put("/password", updatePasswordController);

router.post("/tim", createTimController);
router.get("/search", searchMahasiswaController);
router.post("/tim/:id_tim/accept", acceptInviteController);
router.post("/tim/:id_tim/reject", rejectInviteController);

router.post("/proposal", uploadProposal.single("file_proposal"), createProposalController);
router.patch("/proposal/:id_proposal",uploadProposal.single("file_proposal"), updateProposalController);
router.post("/proposal/:id_proposal/submit", submitProposalController);

router.get("/pembimbing/dosen", listDosenPembimbingController);
router.post("/pembimbing/ajukan", ajukanPembimbingController);
router.get("/pembimbing/status", getStatusPembimbingController);

router.get("/bimbingan", listBimbinganController);
router.get("/bimbingan/:id_bimbingan", detailBimbinganController);
router.post("/bimbingan/ajukan", ajukanBimbinganController);

module.exports = router;