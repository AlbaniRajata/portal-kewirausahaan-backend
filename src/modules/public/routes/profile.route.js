const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middlewares/auth.middleware");

const {
  getProfileController,
} = require("../controllers/profile.controller");

router.get("/profile", authMiddleware, getProfileController);

module.exports = router;