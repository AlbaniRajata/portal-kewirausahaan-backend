const router = require("express").Router();

const auth = require("../modules/auth/routes/auth.routes");

router.use("/auth", auth);

module.exports = router;