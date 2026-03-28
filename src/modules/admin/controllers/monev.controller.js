const {
  getLuaranProgram,
  createLuaran,
  updateLuaran,
  deleteLuaran,
  getProgressLuaranTim,
  getDetailLuaranTim,
  reviewLuaranTim,
} = require("../services/monev.service");

const getLuaranProgramController = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await getLuaranProgram(req.user.id_user, id_program);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const createLuaranController = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await createLuaran(req.user.id_user, id_program, req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const updateLuaranController = async (req, res, next) => {
  try {
    const id_luaran = parseInt(req.params.id_luaran);
    if (isNaN(id_luaran) || id_luaran <= 0) {
      return res.status(400).json({ success: false, message: "ID luaran tidak valid", data: null });
    }
    const result = await updateLuaran(req.user.id_user, id_luaran, req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const deleteLuaranController = async (req, res, next) => {
  try {
    const id_luaran = parseInt(req.params.id_luaran);
    if (isNaN(id_luaran) || id_luaran <= 0) {
      return res.status(400).json({ success: false, message: "ID luaran tidak valid", data: null });
    }
    const result = await deleteLuaran(req.user.id_user, id_luaran);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getProgressLuaranTimController = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await getProgressLuaranTim(req.user.id_user, id_program);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getDetailLuaranTimController = async (req, res, next) => {
  try {
    const id_tim = parseInt(req.params.id_tim);
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_tim) || id_tim <= 0 || isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID tidak valid", data: null });
    }
    const result = await getDetailLuaranTim(req.user.id_user, id_tim, id_program);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const reviewLuaranTimController = async (req, res, next) => {
  try {
    const id_luaran_tim = parseInt(req.params.id_luaran_tim);
    if (isNaN(id_luaran_tim) || id_luaran_tim <= 0) {
      return res.status(400).json({ success: false, message: "ID luaran tim tidak valid", data: null });
    }
    const result = await reviewLuaranTim(req.user.id_user, id_luaran_tim, req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

module.exports = {
  getLuaranProgramController,
  createLuaranController,
  updateLuaranController,
  deleteLuaranController,
  getProgressLuaranTimController,
  getDetailLuaranTimController,
  reviewLuaranTimController,
};