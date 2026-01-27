const {
  getFormPenilaian,
  simpanNilai,
  submitPenilaian,
} = require("../services/penilaian.service");

const getFormPenilaianController = async (req, res) => {
  const result = await getFormPenilaian(
    req.user.id_user,
    Number(req.params.id_distribusi)
  );

  if (result.error)
    return res.status(400).json({
      message: result.message,
      data: result.data,
    });

  res.json({
    message: "Form penilaian",
    data: result.data,
  });
};

const simpanNilaiController = async (req, res) => {
  const result = await simpanNilai(
    req.user.id_user,
    Number(req.params.id_distribusi),
    req.body.nilai
  );

  if (result.error)
    return res.status(400).json({
      message: result.message,
      data: result.data,
    });

  res.json({
    message: result.message,
    data: result.data,
  });
};

const submitPenilaianController = async (req, res) => {
  const result = await submitPenilaian(
    req.user.id_user,
    Number(req.params.id_distribusi)
  );

  if (result.error)
    return res.status(400).json({
      message: result.message,
      data: result.data,
    });

  res.json({
    message: "Penilaian berhasil disubmit",
    data: result.data,
  });
};

module.exports = {
  getFormPenilaianController,
  simpanNilaiController,
  submitPenilaianController,
};
