const router = require("express").Router();

const { versionValidatorMiddleware } = require("../middlewares/compatibility.middleware");
const authMiddleware = require("../middlewares/auth.middleware");

const authRoutes = require("../modules/auth/routes/auth.routes");
const mahasiswaRoutes = require("../modules/mahasiswa/routes/mahasiswa.route");
const adminRoutes = require("../modules/admin/routes/admin.route");
const dosenRoutes = require("../modules/dosen/routes/dosen.route");
const reviewerRoutes = require("../modules/reviewer/routes/reviewer.route");
const juriRoutes = require("../modules/juri/routes/juri.route");

router.use("/v1", versionValidatorMiddleware);

router.use("/v1/auth", authRoutes);
router.use("/v1/mahasiswa", authMiddleware, mahasiswaRoutes);
router.use("/v1/admin", authMiddleware, adminRoutes);
router.use("/v1/dosen", authMiddleware, dosenRoutes);
router.use("/v1/reviewer", authMiddleware, reviewerRoutes);
router.use("/v1/juri", authMiddleware, juriRoutes);
router.use("/v1/public", require("../modules/public/routes/prodi.route"));
router.use("/v1/public", require("../modules/public/routes/jurusan.route"));
router.use("/v1/public", require("../modules/public/routes/program.route"));
router.use("/v1/public", require("../modules/public/routes/kategori.route"));
router.use("/v1/public", require("../modules/public/routes/profile.route"));
router.use("/v1", require("../modules/public/routes/berita.route"));

const redirectToV1 = (req, res, next) => {
  const oldRoutes = ["auth", "mahasiswa", "admin", "dosen", "reviewer", "juri"];
  const pathParts = req.originalUrl.split("/");
  if (pathParts.length >= 3 && oldRoutes.includes(pathParts[2])) {
    const newPath = req.originalUrl.replace(/^\/api\//, "/api/v1/");
    return res.redirect(301, newPath);
  }
  next();
};

router.use("/", redirectToV1);

module.exports = router;