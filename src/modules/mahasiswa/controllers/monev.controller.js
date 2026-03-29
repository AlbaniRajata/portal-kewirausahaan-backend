const fs = require("fs");
const { getLuaranMahasiswa, submitLuaran } = require("../services/monev.service");
const { cekEligibilitasInbis } = require("../services/monev.service");

const getLuaranMahasiswaController = async (req, res, next) => {
  try {
    const result = await getLuaranMahasiswa(req.user.id_user);
    if (result.error) {
      return res.status(400).json({ success: false, message: result.message, data: null });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const submitLuaranController = async (req, res, next) => {
  try {
    const id_luaran = parseInt(req.params.id_luaran);
    if (isNaN(id_luaran) || id_luaran <= 0) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: "ID luaran tidak valid", data: null });
    }

    const result = await submitLuaran(req.user.id_user, id_luaran, req.body, req.file);

    if (result.error) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: result.message, data: null });
    }

    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
};

const cekEligibilitasInbisController = async (req, res, next) => {
  try {
    const result = await cekEligibilitasInbis(req.user.id_user);
    if (result.error) {
      return res.status(400).json({ success: false, message: result.message, data: null });
    }
    return res.status(200).json({ success: true, message: "Cek eligibilitas berhasil", data: result.data });
  } catch (err) { next(err); }
};

module.exports = {
  getLuaranMahasiswaController,
  submitLuaranController,
  cekEligibilitasInbisController,
};