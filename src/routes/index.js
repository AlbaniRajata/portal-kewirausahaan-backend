const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");

const authRoutes = require("../modules/auth/routes/auth.routes");
router.use("/auth", authRoutes);

const mahasiswaRoutes = require("../modules/mahasiswa/routes/mahasiswa.route");
const adminRoutes = require("../modules/admin/routes/admin.route");
const reviewerRoutes = require("../modules/reviewer/routes/reviewer.route");
const juriRoutes = require("../modules/juri/routes/juri.route");

router.use("/mahasiswa", authMiddleware, mahasiswaRoutes);

router.use("/admin", authMiddleware, adminRoutes);
// router.use("/dosen", authMiddleware, dosenRoutes);
router.use("/reviewer", authMiddleware, reviewerRoutes);
router.use("/juri", authMiddleware, juriRoutes);

module.exports = router;