const {
  getRekapPenilaian,
  finalisasiDeskEvaluasi,
} = require("../services/penilaian.service");

const getRekapPenilaianController = async (req, res) => {
  const { id_proposal, id_tahap } = req.params;

  const result = await getRekapPenilaian(
    Number(id_proposal),
    Number(id_tahap)
  );

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json({
    message: "Rekap penilaian lengkap",
    data: result.data,
  });
};

const finalisasiDeskEvaluasiController = async (req, res) => {
  const id_proposal = Number(req.params.id_proposal);
  const keputusan = Number(req.body.keputusan);

  const result = await finalisasiDeskEvaluasi(id_proposal, keputusan);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json({
    message: result.message,
    data: result.data,
  });
};

module.exports = {
  getRekapPenilaianController,
  finalisasiDeskEvaluasiController,
};
