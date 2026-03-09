const {
  getKampus, getKampusById, createKampus, updateKampus, deleteKampus,
  getJurusan, getJurusanById, createJurusan, updateJurusan, deleteJurusan,
  getProdi, getProdiById, createProdi, updateProdi, deleteProdi,
} = require("../services/akademik.service");

const getKampusController = async (req, res, next) => {
  try {
    const result = await getKampus();
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getKampusByIdController = async (req, res, next) => {
  try {
    const id_kampus = parseInt(req.params.id_kampus);
    if (isNaN(id_kampus) || id_kampus <= 0) {
      return res.status(400).json({ success: false, message: "ID kampus tidak valid", data: null });
    }
    const result = await getKampusById(id_kampus);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const createKampusController = async (req, res, next) => {
  try {
    const result = await createKampus(req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const updateKampusController = async (req, res, next) => {
  try {
    const id_kampus = parseInt(req.params.id_kampus);
    if (isNaN(id_kampus) || id_kampus <= 0) {
      return res.status(400).json({ success: false, message: "ID kampus tidak valid", data: null });
    }
    const result = await updateKampus(id_kampus, req.body);
    if (result.error) {
      const status = result.message.includes("tidak ditemukan") ? 404 : 400;
      return res.status(status).json({ success: false, message: result.message, data: null });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const deleteKampusController = async (req, res, next) => {
  try {
    const id_kampus = parseInt(req.params.id_kampus);
    if (isNaN(id_kampus) || id_kampus <= 0) {
      return res.status(400).json({ success: false, message: "ID kampus tidak valid", data: null });
    }
    const result = await deleteKampus(id_kampus);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getJurusanController = async (req, res, next) => {
  try {
    const result = await getJurusan();
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getJurusanByIdController = async (req, res, next) => {
  try {
    const id_jurusan = parseInt(req.params.id_jurusan);
    if (isNaN(id_jurusan) || id_jurusan <= 0) {
      return res.status(400).json({ success: false, message: "ID jurusan tidak valid", data: null });
    }
    const result = await getJurusanById(id_jurusan);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const createJurusanController = async (req, res, next) => {
  try {
    const result = await createJurusan(req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const updateJurusanController = async (req, res, next) => {
  try {
    const id_jurusan = parseInt(req.params.id_jurusan);
    if (isNaN(id_jurusan) || id_jurusan <= 0) {
      return res.status(400).json({ success: false, message: "ID jurusan tidak valid", data: null });
    }
    const result = await updateJurusan(id_jurusan, req.body);
    if (result.error) {
      const status = result.message.includes("tidak ditemukan") ? 404 : 400;
      return res.status(status).json({ success: false, message: result.message, data: null });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const deleteJurusanController = async (req, res, next) => {
  try {
    const id_jurusan = parseInt(req.params.id_jurusan);
    if (isNaN(id_jurusan) || id_jurusan <= 0) {
      return res.status(400).json({ success: false, message: "ID jurusan tidak valid", data: null });
    }
    const result = await deleteJurusan(id_jurusan);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getProdiController = async (req, res, next) => {
  try {
    const result = await getProdi();
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getProdiByIdController = async (req, res, next) => {
  try {
    const id_prodi = parseInt(req.params.id_prodi);
    if (isNaN(id_prodi) || id_prodi <= 0) {
      return res.status(400).json({ success: false, message: "ID prodi tidak valid", data: null });
    }
    const result = await getProdiById(id_prodi);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const createProdiController = async (req, res, next) => {
  try {
    const result = await createProdi(req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const updateProdiController = async (req, res, next) => {
  try {
    const id_prodi = parseInt(req.params.id_prodi);
    if (isNaN(id_prodi) || id_prodi <= 0) {
      return res.status(400).json({ success: false, message: "ID prodi tidak valid", data: null });
    }
    const result = await updateProdi(id_prodi, req.body);
    if (result.error) {
      const status = result.message.includes("tidak ditemukan") ? 404 : 400;
      return res.status(status).json({ success: false, message: result.message, data: null });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const deleteProdiController = async (req, res, next) => {
  try {
    const id_prodi = parseInt(req.params.id_prodi);
    if (isNaN(id_prodi) || id_prodi <= 0) {
      return res.status(400).json({ success: false, message: "ID prodi tidak valid", data: null });
    }
    const result = await deleteProdi(id_prodi);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

module.exports = {
  getKampusController, getKampusByIdController, createKampusController, updateKampusController, deleteKampusController,
  getJurusanController, getJurusanByIdController, createJurusanController, updateJurusanController, deleteJurusanController,
  getProdiController, getProdiByIdController, createProdiController, updateProdiController, deleteProdiController,
};