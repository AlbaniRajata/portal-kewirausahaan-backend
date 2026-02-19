const {
  getKampus,
  getKampusById,
  createKampus,
  updateKampus,
  deleteKampus,
  getJurusan,
  getJurusanById,
  createJurusan,
  updateJurusan,
  deleteJurusan,
  getProdi,
  getProdiById,
  createProdi,
  updateProdi,
  deleteProdi,
} = require("../services/akademik.service");

const getKampusController = async (req, res) => {
  const result = await getKampus();
  return res.status(200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getKampusByIdController = async (req, res) => {
  const { id_kampus } = req.params;
  const result = await getKampusById(id_kampus);
  return res.status(result.error ? 404 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const createKampusController = async (req, res) => {
  const result = await createKampus(req.body);
  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const updateKampusController = async (req, res) => {
  const { id_kampus } = req.params;
  const result = await updateKampus(id_kampus, req.body);
  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const deleteKampusController = async (req, res) => {
  const { id_kampus } = req.params;
  const result = await deleteKampus(id_kampus);
  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getJurusanController = async (req, res) => {
  const result = await getJurusan();
  return res.status(200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getJurusanByIdController = async (req, res) => {
  const { id_jurusan } = req.params;
  const result = await getJurusanById(id_jurusan);
  return res.status(result.error ? 404 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const createJurusanController = async (req, res) => {
  const result = await createJurusan(req.body);
  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const updateJurusanController = async (req, res) => {
  const { id_jurusan } = req.params;
  const result = await updateJurusan(id_jurusan, req.body);
  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const deleteJurusanController = async (req, res) => {
  const { id_jurusan } = req.params;
  const result = await deleteJurusan(id_jurusan);
  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getProdiController = async (req, res) => {
  const result = await getProdi();
  return res.status(200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getProdiByIdController = async (req, res) => {
  const { id_prodi } = req.params;
  const result = await getProdiById(id_prodi);
  return res.status(result.error ? 404 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const createProdiController = async (req, res) => {
  const result = await createProdi(req.body);
  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const updateProdiController = async (req, res) => {
  const { id_prodi } = req.params;
  const result = await updateProdi(id_prodi, req.body);
  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const deleteProdiController = async (req, res) => {
  const { id_prodi } = req.params;
  const result = await deleteProdi(id_prodi);
  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

module.exports = {
  getKampusController,
  getKampusByIdController,
  createKampusController,
  updateKampusController,
  deleteKampusController,
  getJurusanController,
  getJurusanByIdController,
  createJurusanController,
  updateJurusanController,
  deleteJurusanController,
  getProdiController,
  getProdiByIdController,
  createProdiController,
  updateProdiController,
  deleteProdiController,
};