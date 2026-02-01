const {
  getFormPenilaian,
  simpanNilai,
  submitPenilaian,
} = require("../services/penilaian.service");

const getFormPenilaianController = async (req, res) => {
  const id_user = req.user.id_user;
  const id_distribusi = Number(req.params.id_distribusi);

  const result = await getFormPenilaian(id_user, id_distribusi);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.error
      ? result.message
      : "Form penilaian reviewer",
    data: result.data,
    meta: {},
  });
};

const simpanNilaiController = async (req, res) => {
  const id_user = req.user.id_user;
  const id_distribusi = Number(req.params.id_distribusi);

  const payload = req.body.nilai;

  const result = await simpanNilai(id_user, id_distribusi, payload);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const submitPenilaianController = async (req, res) => {
  const id_user = req.user.id_user;
  const id_distribusi = Number(req.params.id_distribusi);

  const result = await submitPenilaian(id_user, id_distribusi);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.error
      ? result.message
      : "Penilaian reviewer berhasil disubmit",
    data: result.data,
    meta: {},
  });
};

module.exports = {
  getFormPenilaianController,
  simpanNilaiController,
  submitPenilaianController,
};
