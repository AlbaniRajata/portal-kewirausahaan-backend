const {
  getBeritaListAdmin, getBeritaDetailAdmin,
  createBerita, updateBerita, updateGambar, deleteBerita,
} = require("../../public/services/berita.service");

const getUploadedFilename = (req, fieldName) => {
  const files = req.files && req.files[fieldName];
  if (Array.isArray(files) && files[0]) return files[0].filename;
  return null;
};

const getBeritaListAdminController = async (req, res, next) => {
  try {
    const result = await getBeritaListAdmin({ status: req.query.status, search: req.query.search });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getBeritaDetailAdminController = async (req, res, next) => {
  try {
    const id_berita = parseInt(req.params.id_berita);
    if (isNaN(id_berita) || id_berita <= 0) return res.status(400).json({ success: false, message: "ID berita tidak valid", data: null });
    const result = await getBeritaDetailAdmin(id_berita);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const createBeritaController = async (req, res, next) => {
  try {
    const file_gambar = getUploadedFilename(req, "file_gambar");
    const file_pdf = getUploadedFilename(req, "file_pdf");
    const result = await createBerita(req.user.id_user, req.body, file_gambar, file_pdf);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: null });
    return res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const updateBeritaController = async (req, res, next) => {
  try {
    const id_berita = parseInt(req.params.id_berita);
    if (isNaN(id_berita) || id_berita <= 0) return res.status(400).json({ success: false, message: "ID berita tidak valid", data: null });
    const file_gambar_baru = getUploadedFilename(req, "file_gambar");
    const file_pdf_baru = getUploadedFilename(req, "file_pdf");
    const result = await updateBerita(id_berita, req.body, file_gambar_baru, file_pdf_baru);
    if (result.error) {
      const status = result.message.includes("tidak ditemukan") ? 404 : 400;
      return res.status(status).json({ success: false, message: result.message, data: null });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const updateGambarController = async (req, res, next) => {
  try {
    const id_berita = parseInt(req.params.id_berita);
    if (isNaN(id_berita) || id_berita <= 0) return res.status(400).json({ success: false, message: "ID berita tidak valid", data: null });
    const file_gambar_baru = getUploadedFilename(req, "file_gambar");
    const file_pdf_baru = getUploadedFilename(req, "file_pdf");
    if (!file_gambar_baru && !file_pdf_baru) return res.status(400).json({ success: false, message: "File berita wajib diunggah", data: null });
    const result = await updateGambar(id_berita, file_gambar_baru, file_pdf_baru);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const deleteBeritaController = async (req, res, next) => {
  try {
    const id_berita = parseInt(req.params.id_berita);
    if (isNaN(id_berita) || id_berita <= 0) return res.status(400).json({ success: false, message: "ID berita tidak valid", data: null });
    const result = await deleteBerita(id_berita);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: null });
  } catch (err) { next(err); }
};

module.exports = {
  getBeritaListAdminController,
  getBeritaDetailAdminController,
  createBeritaController,
  updateBeritaController,
  updateGambarController,
  deleteBeritaController,
};