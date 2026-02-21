const {
  getMahasiswaList, getDosenList, getReviewerList, getJuriList,
  createMahasiswa, createDosen, createReviewer, createJuri,
  updateMahasiswa, updateDosen, updateReviewer, updateJuri,
  toggleUserActive, resetPassword,
} = require("../services/pengguna.service");

const getMahasiswaListController = async (req, res) => {
  const { is_active, id_prodi, id_jurusan, search } = req.query;
  const result = await getMahasiswaList({
    is_active: is_active !== undefined ? is_active === "true" : undefined,
    id_prodi: id_prodi || undefined,
    search: search || undefined,
  });
  return res.status(200).json({ success: true, message: result.message, data: result.data });
};

const getDosenListController = async (req, res) => {
  const { is_active, id_prodi, status_verifikasi, search } = req.query;
  const result = await getDosenList({
    is_active: is_active !== undefined ? is_active === "true" : undefined,
    id_prodi: id_prodi || undefined,
    search: search || undefined,
  });
  return res.status(200).json({ success: true, message: result.message, data: result.data });
};

const getReviewerListPenggunaController = async (req, res) => {
  const { is_active, search } = req.query;
  const result = await getReviewerList({
    is_active: is_active !== undefined ? is_active === "true" : undefined,
    search: search || undefined,
  });
  return res.status(200).json({ success: true, message: result.message, data: result.data });
};

const getJuriListPenggunaController = async (req, res) => {
  const { is_active, search } = req.query;
  const result = await getJuriList({
    is_active: is_active !== undefined ? is_active === "true" : undefined,
    search: search || undefined,
  });
  return res.status(200).json({ success: true, message: result.message, data: result.data });
};

const createMahasiswaController = async (req, res) => {
  const result = await createMahasiswa(req.body);
  return res.status(result.error ? 400 : 201).json({ success: !result.error, message: result.message, data: result.data });
};

const createDosenController = async (req, res) => {
  const result = await createDosen(req.body);
  return res.status(result.error ? 400 : 201).json({ success: !result.error, message: result.message, data: result.data });
};

const createReviewerPenggunaController = async (req, res) => {
  const result = await createReviewer(req.body);
  return res.status(result.error ? 400 : 201).json({ success: !result.error, message: result.message, data: result.data });
};

const createJuriPenggunaController = async (req, res) => {
  const result = await createJuri(req.body);
  return res.status(result.error ? 400 : 201).json({ success: !result.error, message: result.message, data: result.data });
};

const updateMahasiswaController = async (req, res) => {
  const { id_user } = req.params;
  const result = await updateMahasiswa(id_user, req.body);
  return res.status(result.error ? 400 : 200).json({ success: !result.error, message: result.message, data: result.data });
};

const updateDosenController = async (req, res) => {
  const { id_user } = req.params;
  const result = await updateDosen(id_user, req.body);
  return res.status(result.error ? 400 : 200).json({ success: !result.error, message: result.message, data: result.data });
};

const updateReviewerController = async (req, res) => {
  const { id_user } = req.params;
  const result = await updateReviewer(id_user, req.body);
  return res.status(result.error ? 400 : 200).json({ success: !result.error, message: result.message, data: result.data });
};

const updateJuriController = async (req, res) => {
  const { id_user } = req.params;
  const result = await updateJuri(id_user, req.body);
  return res.status(result.error ? 400 : 200).json({ success: !result.error, message: result.message, data: result.data });
};

const toggleUserActiveController = async (req, res) => {
  const { id_user } = req.params;
  const { is_active } = req.body;
  if (is_active === undefined)
    return res.status(400).json({ success: false, message: "is_active wajib diisi", data: null });
  const result = await toggleUserActive(id_user, is_active);
  return res.status(result.error ? 400 : 200).json({ success: !result.error, message: result.message, data: result.data });
};

const resetPasswordController = async (req, res) => {
  const { id_user } = req.params;
  const result = await resetPassword(id_user, req.body);
  return res.status(result.error ? 400 : 200).json({ success: !result.error, message: result.message, data: result.data });
};

module.exports = {
  getMahasiswaListController,
  getDosenListController,
  getReviewerListPenggunaController,
  getJuriListPenggunaController,
  createMahasiswaController,
  createDosenController,
  createReviewerPenggunaController,
  createJuriPenggunaController,
  updateMahasiswaController,
  updateDosenController,
  updateReviewerController,
  updateJuriController,
  toggleUserActiveController,
  resetPasswordController,
};