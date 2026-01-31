const {
  getPenugasan,
  getDetailPenugasan,
  acceptPenugasan,
  rejectPenugasan,
} = require("../services/penugasan.service");

const getPenugasanController = async (req, res) => {
  const { id_user } = req.user;
  const tahap = Number(req.query.tahap);

  if (![1, 2].includes(tahap)) {
    return res.status(400).json({
      success: false,
      message: "Tahap wajib diisi (1 atau 2)",
      data: null,
    });
  }

  const result = await getPenugasan(id_user, tahap);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getDetailPenugasanController = async (req, res) => {
  const { id_user } = req.user;
  const id_distribusi = Number(req.params.id_distribusi);

  const result = await getDetailPenugasan(id_user, id_distribusi);

  return res.status(result.error ? 404 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const acceptPenugasanController = async (req, res) => {
  const { id_user } = req.user;
  const id_distribusi = Number(req.params.id_distribusi);

  const result = await acceptPenugasan(id_user, id_distribusi);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const rejectPenugasanController = async (req, res) => {
  const { id_user } = req.user;
  const id_distribusi = Number(req.params.id_distribusi);
  const { catatan } = req.body || {};

  if (!catatan || catatan.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Catatan wajib diisi saat menolak penugasan",
      data: null,
    });
  }

  const result = await rejectPenugasan(id_user, id_distribusi, catatan);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

module.exports = {
  getPenugasanController,
  getDetailPenugasanController,
  acceptPenugasanController,
  rejectPenugasanController,
};
