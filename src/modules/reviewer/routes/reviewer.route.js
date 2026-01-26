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

router.use(authMiddleware);
router.use(roleMiddleware([4])); // Reviewer

router.get("/penugasan", getPenugasanController);
router.get("/penugasan/:id_distribusi", getDetailPenugasanController);
router.post("/penugasan/:id_distribusi/accept", acceptPenugasanController);
router.post("/penugasan/:id_distribusi/reject", rejectPenugasanController);

module.exports = router;
