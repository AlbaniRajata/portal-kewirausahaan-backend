const express = require("express");
const router = express.Router();
const roleMiddleware = require("../../../middlewares/role.middleware");
const { 
  uploadFotoProfil, 
  uploadProposal 
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
} = require("../controllers/proposal.controller");

router.use(roleMiddleware([1])); // Mahasiswa

const uploadOptional = (req, res, next) => {
  uploadFotoProfil.single("foto")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message
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
router.patch("/proposal/:id_proposal", uploadProposal.single("file_proposal"), updateProposalController);

module.exports = router;