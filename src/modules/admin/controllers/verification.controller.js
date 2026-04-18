const {
  listPendingMahasiswa,
  detailMahasiswa,
  approveMahasiswa,
  rejectMahasiswa,
} = require("../services/verification.service");

const getPendingMahasiswaController = async (req, res, next) => {
  try {
    const { page, limit, status_verifikasi, email_verified, id_prodi, tanggal_dari, tanggal_sampai } = req.query;
    const filters = {
      status_verifikasi: status_verifikasi !== undefined ? parseInt(status_verifikasi) : undefined,
      email_verified: email_verified !== undefined ? email_verified === "true" : undefined,
      id_prodi: id_prodi ? parseInt(id_prodi) : undefined,
      tanggal_dari: tanggal_dari || undefined,
      tanggal_sampai: tanggal_sampai || undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    };

    const result = await listPendingMahasiswa(filters);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
      pagination: result.pagination
    });
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