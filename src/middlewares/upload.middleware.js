const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createFileFilter = (allowedMimes, errorMsg) => {
  return (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(errorMsg));
    }
  };
};

const createFilename = (prefix) => {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  };
};

const validateProposalFilename = (filename) => {
  const nameWithoutExt = path.basename(filename, path.extname(filename));
  const parts = nameWithoutExt.split("_");

  if (parts.length !== 3) {
    return {
      valid: false,
      message:
        'Format nama file tidak valid. Gunakan format: "Program_Nama Tim_Judul Proposal" (dipisahkan tepat 2 underscore). Contoh: "PKM-K_Tim Inovasi_Alat Pembersih Otomatis.pdf"',
    };
  }

  for (let i = 0; i < parts.length; i++) {
    if (parts[i].trim() === "") {
      const labels = ["Program", "Nama Tim", "Judul Proposal"];
      return {
        valid: false,
        message: `Bagian "${labels[i]}" pada nama file tidak boleh kosong. Format: "Program_Nama Tim_Judul Proposal"`,
      };
    }
  }

  return { valid: true };
};

const ktmDir = "uploads/ktm";
ensureDir(ktmDir);

const uploadKTM = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, ktmDir),
    filename: createFilename("ktm"),
  }),
  fileFilter: createFileFilter(
    ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
    "Hanya file JPG, PNG, atau PDF yang diperbolehkan"
  ),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const profilDir = "uploads/profil";
ensureDir(profilDir);

const uploadFotoProfil = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, profilDir),
    filename: createFilename("profil"),
  }),
  fileFilter: createFileFilter(
    ["image/jpeg", "image/jpg", "image/png"],
    "Hanya file JPG atau PNG yang diperbolehkan untuk foto profil"
  ),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const proposalDir = "uploads/proposal";
ensureDir(proposalDir);

const uploadProposal = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, proposalDir),
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("File proposal harus berupa PDF"));
    }

    const result = validateProposalFilename(file.originalname);
    if (!result.valid) {
      return cb(new Error(result.message));
    }

    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

const beritaDir = "uploads/berita";
ensureDir(beritaDir);

const uploadBerita = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, beritaDir),
    filename: createFilename("berita"),
  }),
  fileFilter: createFileFilter(
    ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    "Hanya file JPG, PNG, atau WebP yang diperbolehkan untuk gambar berita"
  ),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const luaranDir = "uploads/luaran";
ensureDir(luaranDir);

const uploadLuaran = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, luaranDir),
    filename: createFilename("luaran"),
  }),
  fileFilter: createFileFilter(
    ["application/pdf"],
    "File luaran harus berupa PDF"
  ),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

module.exports = {
  uploadKTM,
  uploadFotoProfil,
  uploadProposal,
  uploadBerita,
  uploadLuaran,
};