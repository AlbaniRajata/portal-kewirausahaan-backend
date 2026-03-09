const {
  getMahasiswaList, getDosenList, getReviewerList, getJuriList,
  createMahasiswa, createDosen, createReviewer, createJuri,
  updateMahasiswa, updateDosen, updateReviewer, updateJuri,
  toggleUserActive, resetPassword,
} = require("../services/pengguna.service");

const getMahasiswaListController = async (req, res, next) => {
  try {
    const { is_active, id_prodi, id_jurusan, search } = req.query;
    const result = await getMahasiswaList({
      is_active: is_active !== undefined ? is_active === "true" : undefined,
      id_prodi: id_prodi ? parseInt(id_prodi) : undefined,
      id_jurusan: id_jurusan ? parseInt(id_jurusan) : undefined,
      search: search || undefined,
    });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getDosenListController = async (req, res, next) => {
  try {
    const { is_active, id_prodi, search } = req.query;
    const result = await getDosenList({
      is_active: is_active !== undefined ? is_active === "true" : undefined,
      id_prodi: id_prodi ? parseInt(id_prodi) : undefined,
      search: search || undefined,
    });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getReviewerListController = async (req, res, next) => {
  try {
    const { is_active, search } = req.query;
    const result = await getReviewerList({
      is_active: is_active !== undefined ? is_active === "true" : undefined,
      search: search || undefined,
    });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getJuriListController = async (req, res, next) => {
  try {
    const { is_active, search } = req.query;
    const result = await getJuriList({
      is_active: is_active !== undefined ? is_active === "true" : undefined,
      search: search || undefined,
    });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const createMahasiswaController = async (req, res, next) => {
  try {
    const result = await createMahasiswa(req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const createDosenController = async (req, res, next) => {
  try {
    const result = await createDosen(req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const createReviewerController = async (req, res, next) => {
  try {
    const result = await createReviewer(req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const createJuriController = async (req, res, next) => {
  try {
    const result = await createJuri(req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const updateMahasiswaController = async (req, res, next) => {
  try {
    const id_user = parseInt(req.params.id_user);
    if (isNaN(id_user) || id_user <= 0) return res.status(400).json({ success: false, message: "ID user tidak valid", data: null });
    const result = await updateMahasiswa(id_user, req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: null });
  } catch (err) { next(err); }
};

const updateDosenController = async (req, res, next) => {
  try {
    const id_user = parseInt(req.params.id_user);
    if (isNaN(id_user) || id_user <= 0) return res.status(400).json({ success: false, message: "ID user tidak valid", data: null });
    const result = await updateDosen(id_user, req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: null });
  } catch (err) { next(err); }
};

const updateReviewerController = async (req, res, next) => {
  try {
    const id_user = parseInt(req.params.id_user);
    if (isNaN(id_user) || id_user <= 0) return res.status(400).json({ success: false, message: "ID user tidak valid", data: null });
    const result = await updateReviewer(id_user, req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: null });
  } catch (err) { next(err); }
};

const updateJuriController = async (req, res, next) => {
  try {
    const id_user = parseInt(req.params.id_user);
    if (isNaN(id_user) || id_user <= 0) return res.status(400).json({ success: false, message: "ID user tidak valid", data: null });
    const result = await updateJuri(id_user, req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: null });
  } catch (err) { next(err); }
};

const toggleUserActiveController = async (req, res, next) => {
  try {
    const id_user = parseInt(req.params.id_user);
    if (isNaN(id_user) || id_user <= 0) return res.status(400).json({ success: false, message: "ID user tidak valid", data: null });
    if (req.body.is_active === undefined || req.body.is_active === null) {
      return res.status(400).json({ success: false, message: "is_active wajib diisi", data: null });
    }
    const is_active = req.body.is_active === true || req.body.is_active === "true";
    const result = await toggleUserActive(id_user, is_active);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const resetPasswordController = async (req, res, next) => {
  try {
    const id_user = parseInt(req.params.id_user);
    if (isNaN(id_user) || id_user <= 0) return res.status(400).json({ success: false, message: "ID user tidak valid", data: null });
    const result = await resetPassword(id_user, req.body);
    if (result.error) {
      const status = result.message.includes("tidak ditemukan") ? 404 : 400;
      return res.status(status).json({ success: false, message: result.message, data: null });
    }
    return res.status(200).json({ success: true, message: result.message, data: null });
  } catch (err) { next(err); }
};

module.exports = {
  getMahasiswaListController,
  getDosenListController,
  getReviewerListController,
  getJuriListController,
  createMahasiswaController,
  createDosenController,
  createReviewerController,
  createJuriController,
  updateMahasiswaController,
  updateDosenController,
  updateReviewerController,
  updateJuriController,
  toggleUserActiveController,
  resetPasswordController,
};