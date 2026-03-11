const express = require("express");
const router = express.Router();

const { getBeritaListPublikController, getBeritaBySlugController } = require("../controllers/berita.controller");

router.get("/berita", getBeritaListPublikController); 
router.get("/berita/:slug", getBeritaBySlugController);

module.exports = router;