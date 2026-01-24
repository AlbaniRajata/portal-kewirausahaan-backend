const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");

require("./cron/proposalStatus.cron");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

app.get("/health", (req, res) => {
  res.json({ 
    message: "API is running",
    timestamp: new Date().toISOString()
  });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ 
    message: "Endpoint tidak ditemukan",
    path: req.originalUrl
  });
});

app.use((err, req, res, next) => {
  console.error("ERROR:", err.stack);
  
  res.status(err.status || 500).json({
    message: err.message || "Terjadi kesalahan pada sistem",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

module.exports = app;