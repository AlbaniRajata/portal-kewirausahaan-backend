require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
const routes = require("./routes");
const pool = require("./config/db");
const { requestSizeLimiter, sqlInjectionProtectionMiddleware, blockSuspiciousInput } = require("./middlewares/security.middleware");
const { apiVersionMiddleware, contentNegotiationMiddleware: contentNeg, requestIdMiddleware } = require("./middlewares/compatibility.middleware");
const { formatApiInfo } = require("./utils/response");

const swaggerSpec = require("./config/swagger");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET tidak terdefinisi di environment variables!");
}

require("./cron/proposalStatus.cron");

const app = express();

app.use(compression());

app.use(apiVersionMiddleware);
app.use(contentNeg);
app.use(requestIdMiddleware);

app.use(sqlInjectionProtectionMiddleware);
app.use(blockSuspiciousInput);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

app.use(sqlInjectionProtectionMiddleware);
app.use(morgan("dev"));

const UPLOADS_DIR = path.join(__dirname, "../uploads");
app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    maxAge: "1d",
    etag: true,
  })
);

app.get("/uploads/proposal/:filename", (req, res, next) => {
  const filePath = path.join(UPLOADS_DIR, "proposal", req.params.filename);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.setHeader("Content-Disposition", `attachment; filename="${req.params.filename}"`);
    res.setHeader("Content-Type", "application/pdf");
    return res.sendFile(filePath);
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (!res.headersSent) {
      const duration = Date.now() - start;
      res.setHeader("X-Response-Time", `${duration}ms`);
    }
  });
  next();
});

app.use(requestSizeLimiter(15 * 1024 * 1024));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.get("/health", async (req, res) => {
  let dbStatus = "unknown";
  let dbLatency = null;

  try {
    const start = Date.now();
    await pool.query("SELECT 1");
    dbLatency = Date.now() - start;
    dbStatus = "healthy";
  } catch (err) {
    dbStatus = "unhealthy";
  }

  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    version: formatApiInfo().version,
    environment: process.env.NODE_ENV || "development",
    database: {
      status: dbStatus,
      latency_ms: dbLatency
    }
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

const logger = require("./utils/logger");

app.use((err, req, res, next) => {
  logger.error("Request error", {
    error: err.message,
    stack: err.stack,
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
  });

  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: `Gagal upload file: ${err.message}`,
      data: null,
    });
  }

  const isFileValidationError =
    err.message &&
    (err.message.includes("Hanya file") ||
      err.message.includes("Format nama file") ||
      err.message.includes("File proposal") ||
      err.message.includes("Bagian "));
  if (isFileValidationError) {
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