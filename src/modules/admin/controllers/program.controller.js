const {
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

const getProgramAdminController = async (req, res) => {
  const { id_user } = req.user;

  const result = await getProgramAdmin(id_user);

  return res.status(result.error ? 403 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const setProgramTimelineController = async (req, res) => {
  const { id_user } = req.user;
  const { id_program } = req.params;
  const { pendaftaran_mulai, pendaftaran_selesai } = req.body;

  const result = await setProgramTimeline(id_user, id_program, {
    pendaftaran_mulai,
    pendaftaran_selesai,
  });

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getTahapProgramController = async (req, res) => {
  const { id_user } = req.user;
  const { id_program } = req.params;

  const result = await getTahapProgram(id_user, id_program);

  return res.status(result.error ? 403 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const createTahapProgramController = async (req, res) => {
  const { id_user } = req.user;
  const { id_program } = req.params;

  const result = await createTahapProgram(id_user, id_program, req.body);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const updateJadwalTahapController = async (req, res) => {
  const { id_user } = req.user;
  const { id_tahap } = req.params;

  const result = await updateJadwalTahap(id_user, id_tahap, req.body);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const deleteTahapController = async (req, res) => {
  const { id_user } = req.user;
  const { id_tahap } = req.params;

  const result = await deleteTahap(id_user, id_tahap);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getKriteriaPenilaianController = async (req, res) => {
  const { id_user } = req.user;
  const { id_tahap } = req.params;

  const result = await getKriteriaPenilaian(id_user, id_tahap);

  return res.status(result.error ? 403 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

const createKriteriaPenilaianController = async (req, res) => {
  const { id_user } = req.user;
  const { id_tahap } = req.params;

  const result = await createKriteriaPenilaian(id_user, id_tahap, req.body);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

const updateKriteriaPenilaianController = async (req, res) => {
  const { id_user } = req.user;
  const { id_kriteria } = req.params;

  const result = await updateKriteriaPenilaian(id_user, id_kriteria, req.body);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

const deleteKriteriaPenilaianController = async (req, res) => {
  const { id_user } = req.user;
  const { id_kriteria } = req.params;

  const result = await deleteKriteriaPenilaian(id_user, id_kriteria);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

module.exports = {
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