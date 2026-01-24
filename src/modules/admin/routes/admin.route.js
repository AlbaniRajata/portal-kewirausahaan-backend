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

const authMiddleware = require("../../../middlewares/auth.middleware");
const roleMiddleware = require("../../../middlewares/role.middleware");

router.use(authMiddleware);
router.use(roleMiddleware(["admin inbis", "admin pmw", "super admin"]));

router.get("/verifikasi/mahasiswa", getPendingMahasiswa);
router.get("/verifikasi/mahasiswa/:id", getDetailMahasiswa);
router.post("/verifikasi/mahasiswa/:id/approve", approveMahasiswaController);
router.post("/verifikasi/mahasiswa/:id/reject", rejectMahasiswaController);

router.patch("/program/:id_program/timeline", setProgramTimelineController);

module.exports = router;
