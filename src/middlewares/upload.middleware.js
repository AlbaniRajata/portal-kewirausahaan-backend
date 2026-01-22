const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ktmDir = "uploads/ktm";
if (!fs.existsSync(ktmDir)) {
  fs.mkdirSync(ktmDir, { recursive: true });
}

const storageKTM = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ktmDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `ktm-${Date.now()}${ext}`);
  },
});

const uploadKTM = multer({
  storage: storageKTM,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file JPG, PNG, atau PDF yang diperbolehkan"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const profilDir = "uploads/profil";
if (!fs.existsSync(profilDir)) {
  fs.mkdirSync(profilDir, { recursive: true });
}

const storageProfil = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profil-${uniqueSuffix}${ext}`);
  },
});

const uploadFotoProfil = multer({
  storage: storageProfil,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file JPG atau PNG yang diperbolehkan untuk foto profil"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = {
  uploadKTM,
  uploadFotoProfil,
};