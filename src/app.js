require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET tidak terdefinisi di environment variables!");
}

require("./cron/proposalStatus.cron");

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin && process.env.NODE_ENV === "development") {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Tidak diizinkan oleh kebijakan CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    exposedHeaders: ["Content-Length", "Content-Type"],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
  })
);

app.use(morgan("dev"));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
    data: { path: req.originalUrl },
  });
});

app.use((err, req, res, next) => {
  console.error("ERROR:", err.stack || err.message);

  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: `Gagal upload file: ${err.message}`,
      data: null,
    });
  }

  if (err.message && err.message.includes("Hanya file")) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak oleh kebijakan CORS",
      data: null,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada sistem",
    data:
      process.env.NODE_ENV === "development"
        ? { stack: err.stack }
        : null,
  });
});

module.exports = app;