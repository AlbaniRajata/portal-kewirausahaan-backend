const express = require("express");
const router = express.Router();

const { getBeritaListPublikController, getBeritaBySlugController } = require("../controllers/berita.controller");

router.get("/", getBeritaListPublikController);
router.get("/:slug", getBeritaBySlugController);

module.exports = router;