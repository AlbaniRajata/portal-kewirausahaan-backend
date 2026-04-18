const {
  getAllProgramList,
  getProgramListForNavbar,
  getProgramAdmin,
  setProgramTimeline,
  getTahapProgram,
  createTahapProgram,
  updateJadwalTahap,
  deleteTahap,
  getKriteriaPenilaian,
  createKriteriaPenilaian,
  updateKriteriaPenilaian,
  deleteKriteriaPenilaian,
} = require("../services/program.service");

const getAllProgramListController = async (req, res, next) => {
  try {
    const result = await getAllProgramList();
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getProgramListForNavbarController = async (req, res, next) => {
  try {
    const result = await getProgramListForNavbar(req.user.id_user);
    if (result.error) return res.status(403).json({ success: false, message: result.message, data: null });
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (err) { next(err); }
};

const getProgramAdminController = async (req, res, next) => {
  try {
    const result = await getProgramAdmin(req.user.id_user);
    if (result.error) return res.status(403).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const setProgramTimelineController = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await setProgramTimeline(req.user.id_user, id_program, req.body);
    if (result.error) {
      const status = result.message.includes("ditolak") || result.message.includes("tidak ditemukan") ? 403 : 400;
      return res.status(status).json({ success: false, message: result.message, data: null });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getTahapProgramController = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await getTahapProgram(req.user.id_user, id_program);
    if (result.error) return res.status(403).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const createTahapProgramController = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await createTahapProgram(req.user.id_user, id_program, req.body);
    if (result.error) {
      const status = result.message.includes("ditolak") || result.message.includes("tidak ditemukan") ? 403 : 400;
      return res.status(status).json({ success: false, message: result.message, data: result.data });
    }
    return res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const updateJadwalTahapController = async (req, res, next) => {
  try {
    const id_tahap = parseInt(req.params.id_tahap);
    if (isNaN(id_tahap) || id_tahap <= 0) {
      return res.status(400).json({ success: false, message: "ID tahap tidak valid", data: null });
    }
    const result = await updateJadwalTahap(req.user.id_user, id_tahap, req.body);
    if (result.error) {
      const status = result.message.includes("tidak ditemukan") ? 404 : result.message.includes("ditolak") ? 403 : 400;
      return res.status(status).json({ success: false, message: result.message, data: null });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const deleteTahapController = async (req, res, next) => {
  try {
    const id_tahap = parseInt(req.params.id_tahap);
    if (isNaN(id_tahap) || id_tahap <= 0) {
      return res.status(400).json({ success: false, message: "ID tahap tidak valid", data: null });
    }
    const result = await deleteTahap(req.user.id_user, id_tahap);
    if (result.error) {
      const status = result.message.includes("tidak ditemukan") ? 404 : 403;
      return res.status(status).json({ success: false, message: result.message, data: null });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getKriteriaPenilaianController = async (req, res, next) => {
  try {
    const id_tahap = parseInt(req.params.id_tahap);
    if (isNaN(id_tahap) || id_tahap <= 0) {
      return res.status(400).json({ success: false, message: "ID tahap tidak valid", data: null });
    }
    const result = await getKriteriaPenilaian(req.user.id_user, id_tahap);
    if (result.error) {
      const status = result.message.includes("tidak ditemukan") ? 404 : 403;
      return res.status(status).json({ success: false, message: result.message, data: null });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const createKriteriaPenilaianController = async (req, res, next) => {
  try {
    const id_tahap = parseInt(req.params.id_tahap);
    if (isNaN(id_tahap) || id_tahap <= 0) {
      return res.status(400).json({ success: false, message: "ID tahap tidak valid", data: null });
    }
    const result = await createKriteriaPenilaian(req.user.id_user, id_tahap, req.body);
    if (result.error) {
      const status = result.message.includes("tidak ditemukan") ? 404 : result.message.includes("ditolak") ? 403 : 400;
      return res.status(status).json({ success: false, message: result.message, data: result.data });
    }
    return res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const updateKriteriaPenilaianController = async (req, res, next) => {
  try {
    const id_kriteria = parseInt(req.params.id_kriteria);
    if (isNaN(id_kriteria) || id_kriteria <= 0) {
      return res.status(400).json({ success: false, message: "ID kriteria tidak valid", data: null });
    }
    const result = await updateKriteriaPenilaian(req.user.id_user, id_kriteria, req.body);
    if (result.error) {
      const status = result.message.includes("tidak ditemukan") ? 404 : result.message.includes("ditolak") ? 403 : 400;
      return res.status(status).json({ success: false, message: result.message, data: result.data });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const deleteKriteriaPenilaianController = async (req, res, next) => {
  try {
    const id_kriteria = parseInt(req.params.id_kriteria);
    if (isNaN(id_kriteria) || id_kriteria <= 0) {
      return res.status(400).json({ success: false, message: "ID kriteria tidak valid", data: null });
    }
    const result = await deleteKriteriaPenilaian(req.user.id_user, id_kriteria);
    if (result.error) {
      const status = result.message.includes("tidak ditemukan") ? 404 : 403;
      return res.status(status).json({ success: false, message: result.message, data: null });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

module.exports = {
  getAllProgramListController,
  getProgramListForNavbarController,
  getProgramAdminController,
  setProgramTimelineController,
  getTahapProgramController,
  createTahapProgramController,
  updateJadwalTahapController,
  deleteTahapController,
  getKriteriaPenilaianController,
  createKriteriaPenilaianController,
  updateKriteriaPenilaianController,
  deleteKriteriaPenilaianController,
};