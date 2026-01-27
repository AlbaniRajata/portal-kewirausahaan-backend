const {
  getRekapPenilaian,
  finalizePenilaian,
} = require("../services/penilaian.service");

const getRekapPenilaianController = async (req, res) => {
  const { id_proposal, id_tahap } = req.params;

  const result = await getRekapPenilaian(
    Number(id_proposal),
    Number(id_tahap)
  );

  if (result.error)
    return res.status(400).json(result);

  res.json({
    message: "Rekap penilaian lengkap",
    data: result.data,
  });
};

const finalizePenilaianController = async (req, res) => {
  try {
    const { id_proposal, id_tahap } = req.params;
    const { passing_grade, status_lolos, status_gagal } = req.body;

    if (passing_grade === undefined)
      return res.status(400).json({
        error: true,
        message: "passing_grade wajib diisi",
        data: null,
      });

    const result = await finalizePenilaian(
      req.user.id_user,
      Number(id_proposal),
      Number(id_tahap),
      Number(passing_grade),
      Number(status_lolos),
      Number(status_gagal)
    );

    if (result.error)
      return res.status(400).json(result);

    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Gagal finalisasi penilaian",
      data: err.message,
    });
  }
};

module.exports = {
  getRekapPenilaianController,
  finalizePenilaianController,
};
