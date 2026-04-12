const {
  listPendingMahasiswa,
  detailMahasiswa,
  approveMahasiswa,
  rejectMahasiswa,
} = require("../services/verification.service");

const getPendingMahasiswaController = async (req, res, next) => {
  try {
    const filters = {
      status_verifikasi: req.query.status_verifikasi !== undefined ? parseInt(req.query.status_verifikasi) : undefined,
      email_verified: req.query.email_verified !== undefined ? req.query.email_verified === "true" : undefined,
      id_prodi: req.query.id_prodi ? parseInt(req.query.id_prodi) : undefined,
      tanggal_dari: req.query.tanggal_dari || undefined,
      tanggal_sampai: req.query.tanggal_sampai || undefined,
    };

    const result = await listPendingMahasiswa(filters);
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getDetailMahasiswaController = async (req, res, next) => {
  try {
    const id_user = parseInt(req.params.id);
    if (isNaN(id_user) || id_user <= 0) {
      return res.status(400).json({ success: false, message: "ID mahasiswa tidak valid", data: null });
    }

    const result = await detailMahasiswa(id_user);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const approveMahasiswaController = async (req, res, next) => {
  try {
    const id_user = parseInt(req.params.id);
    if (isNaN(id_user) || id_user <= 0) {
      return res.status(400).json({ success: false, message: "ID mahasiswa tidak valid", data: null });
    }

    const result = await approveMahasiswa(id_user);
    if (result.error) {
      const status = result.message.includes("tidak ditemukan") ? 404 : 400;
      return res.status(status).json({ success: false, message: result.message, data: result.data });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const rejectMahasiswaController = async (req, res, next) => {
  try {
    const id_user = parseInt(req.params.id);
    if (isNaN(id_user) || id_user <= 0) {
      return res.status(400).json({ success: false, message: "ID mahasiswa tidak valid", data: null });
    }

    const catatan = req.body?.catatan;
    const result = await rejectMahasiswa(id_user, catatan);
    if (result.error) {
      const status = result.message.includes("tidak ditemukan") ? 404 : 400;
      return res.status(status).json({ success: false, message: result.message, data: result.data });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

module.exports = {
  getPendingMahasiswaController,
  getDetailMahasiswaController,
  approveMahasiswaController,
  rejectMahasiswaController,
};