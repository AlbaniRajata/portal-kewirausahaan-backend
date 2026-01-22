const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");
const adminVerificationRoute = require("./modules/admin/routes/adminVerification.route");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.use("/api", routes);
app.use("/api/admin", adminVerificationRoute);

module.exports = app;
