const express = require("express");
const router = express.Router();

const {
    getAllProgramController,
} = require("../controllers/program.controller");

router.get("/program", getAllProgramController);

module.exports = router;