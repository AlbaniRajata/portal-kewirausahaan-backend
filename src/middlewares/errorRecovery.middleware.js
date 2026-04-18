const pool = require("../config/db");

const errorRecoveryMiddleware = async (err, req, res, next) => {
  if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
    return res.status(503).json({
      success: false,
      message: "Layanan database sementara tidak tersedia. Silakan coba beberapa saat lagi.",
      data: { code: "DB_UNAVAILABLE", retry: true }
    });
  }

  if (err.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "Data sudah ada atau дубликат.",
      data: { code: "DUPLICATE_ENTRY" }
    });
  }

  if (err.code === "23503") {
    return res.status(400).json({
      success: false,
      message: "Referensi data tidak ditemukan atau sudah dihapus.",
      data: { code: "FOREIGN_KEY_VIOLATION" }
    });
  }

  if (err.code === "22001") {
    return res.status(400).json({
      success: false,
      message: "Nilai yang diberikan melebihi batas panjang data.",
      data: { code: "STRING_DATA_TRUNCATED" }
    });
  }

  if (err.code === "23502") {
    return res.status(400).json({
      success: false,
      message: "Field wajib tidak boleh kosong.",
      data: { code: "NOT_NULL_VIOLATION" }
    });
  }

  if (err.message && err.message.includes("connection")) {
    return res.status(503).json({
      success: false,
      message: "Koneksi database terputus. Mencoba menghubungkan ulang...",
      data: { code: "DB_CONNECTION_LOST", retry: true }
    });
  }

  next(err);
};

module.exports = errorRecoveryMiddleware;