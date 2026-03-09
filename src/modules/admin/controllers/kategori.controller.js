const {
  getKategori,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori,
} = require("../services/kategori.service");

const getKategoriController = async (req, res, next) => {
  try {
    const result = await getKategori();
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getKategoriByIdController = async (req, res, next) => {
  try {
    const id_kategori = parseInt(req.params.id_kategori);
    if (isNaN(id_kategori) || id_kategori <= 0) {
      return res.status(400).json({ success: false, message: "ID kategori tidak valid", data: null });
    }
    const result = await getKategoriById(id_kategori);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const createKategoriController = async (req, res, next) => {
  try {
    const result = await createKategori(req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: null });
    return res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const updateKategoriController = async (req, res, next) => {
  try {
    const id_kategori = parseInt(req.params.id_kategori);
    if (isNaN(id_kategori) || id_kategori <= 0) {
      return res.status(400).json({ success: false, message: "ID kategori tidak valid", data: null });
    }
    const result = await updateKategori(id_kategori, req.body);
    if (result.error) {
      const status = result.message.includes("tidak ditemukan") ? 404 : 400;
      return res.status(status).json({ success: false, message: result.message, data: null });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const deleteKategoriController = async (req, res, next) => {
  try {
    const id_kategori = parseInt(req.params.id_kategori);
    if (isNaN(id_kategori) || id_kategori <= 0) {
      return res.status(400).json({ success: false, message: "ID kategori tidak valid", data: null });
    }
    const result = await deleteKategori(id_kategori);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

module.exports = {
  getKategoriController,
  getKategoriByIdController,
  createKategoriController,
  updateKategoriController,
  deleteKategoriController,
};