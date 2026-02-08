const express = require("express");
const router = express.Router();

const {
    getAllKategoriController,
} = require("../controllers/kategori.controller");

router.get("/kategori", getAllKategoriController);

module.exports = router;