const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");

const authRoutes = require("../modules/auth/routes/auth.routes");
router.use("/auth", authRoutes);

const mahasiswaRoutes = require("../modules/mahasiswa/routes/mahasiswa.route");
const adminRoutes = require("../modules/admin/routes/admin.route");
const reviewerRoutes = require("../modules/reviewer/routes/reviewer.route");
const juriRoutes = require("../modules/juri/routes/juri.route");
const dosenRoutes = require("../modules/dosen/routes/dosen.route");

router.use("/mahasiswa", authMiddleware, mahasiswaRoutes);
router.use("/admin", authMiddleware, adminRoutes);
router.use("/dosen", authMiddleware, dosenRoutes);
router.use("/reviewer", authMiddleware, reviewerRoutes);
router.use("/juri", authMiddleware, juriRoutes);

router.use("/public", require("../modules/public/routes/prodi.route"));
router.use("/public", require("../modules/public/routes/jurusan.route"));
router.use("/public", require("../modules/public/routes/program.route"));
router.use("/public", require("../modules/public/routes/kategori.route"));

module.exports = router;