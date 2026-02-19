const {
  getKategori,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori,
} = require("../services/kategori.service");

const getKategoriController = async (req, res) => {
  const result = await getKategori();
  return res.status(200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getKategoriByIdController = async (req, res) => {
  const { id_kategori } = req.params;
  const result = await getKategoriById(id_kategori);
  return res.status(result.error ? 404 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const createKategoriController = async (req, res) => {
  const result = await createKategori(req.body);
  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const updateKategoriController = async (req, res) => {
  const { id_kategori } = req.params;
  const result = await updateKategori(id_kategori, req.body);
  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const deleteKategoriController = async (req, res) => {
  const { id_kategori } = req.params;
  const result = await deleteKategori(id_kategori);
  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

module.exports = {
  getKategoriController,
  getKategoriByIdController,
  createKategoriController,
  updateKategoriController,
  deleteKategoriController,
};