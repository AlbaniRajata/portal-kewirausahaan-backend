const {
  getPenugasan,
  getDetailPenugasan,
  acceptPenugasan,
  rejectPenugasan,
} = require("../services/penugasan.services");

const getPenugasanController = async (req, res) => {
  const { id_user } = req.user;
  const tahap = Number(req.query.tahap);
  const status = req.query.status;

  if (tahap !== 2) {
    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      data: {
        field: "tahap",
        reason: "Juri hanya memiliki penugasan tahap 2",
      },
    });
  }

  const result = await getPenugasan(id_user, tahap, status);

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

  if (!catatan || catatan.trim() === "" || catatan.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: "Catatan penolakan wajib diisi minimal 10 karakter",
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