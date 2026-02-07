const express = require("express");
const router = express.Router();

const {
    getAllJurusanController,
} = require("../controllers/jurusan.controller");

router.get("/jurusan", getAllJurusanController);

module.exports = router;