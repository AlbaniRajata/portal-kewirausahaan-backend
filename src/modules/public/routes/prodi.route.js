const express = require("express");
const router = express.Router();

const {
    getAllProdi,
} = require("../controllers/prodi.controller");

router.get("/prodi", getAllProdi);

module.exports = router;
