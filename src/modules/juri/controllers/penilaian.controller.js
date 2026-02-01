const {
  getFormPenilaian,
  simpanNilai,
  submitPenilaian,
} = require("../services/penilaian.service");

const getFormPenilaianController = async (req, res) => {
  const id_user = req.user.id_user;
  const id_distribusi = Number(req.params.id_distribusi);

  const result = await getFormPenilaian(id_user, id_distribusi);

  if (result.error) {
    return res.status(400).json({
      success: false,
      message: result.message,
      data: result.data,
    });
  }

  return res.json({
    success: true,
    message: "Form penilaian juri",
    data: result.data,
  });
};

const simpanNilaiController = async (req, res) => {
  const id_user = req.user.id_user;
  const id_distribusi = Number(req.params.id_distribusi);

  const payload = req.body.nilai;

  const result = await simpanNilai(id_user, id_distribusi, payload);

  if (result.error) {
    return res.status(400).json({
      success: false,
      message: result.message,
      data: result.data,
    });
  }

  return res.json({
    success: true,
    message: result.message,
    data: result.data,
  });
};

const submitPenilaianController = async (req, res) => {
  const id_user = req.user.id_user;
  const id_distribusi = Number(req.params.id_distribusi);

  const result = await submitPenilaian(id_user, id_distribusi);

  if (result.error) {
    return res.status(400).json({
      success: false,
      message: result.message,
      data: result.data,
    });
  }

  return res.json({
    success: true,
    message: "Penilaian juri berhasil disubmit",
    data: result.data,
  });
};

module.exports = {
  getFormPenilaianController,
  simpanNilaiController,
  submitPenilaianController,
};
