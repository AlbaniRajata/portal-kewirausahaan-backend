const express = require("express");
const router = express.Router();

const { getBeritaListPublikController, getBeritaBySlugController, downloadBeritaAttachmentController } = require("../controllers/berita.controller");

router.get("/berita", getBeritaListPublikController); 
router.get("/berita/:slug", getBeritaBySlugController);
router.get("/uploads/berita/download/:filename", downloadBeritaAttachmentController);

module.exports = router;