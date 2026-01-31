const {
  getRekapDeskEvaluasi,
  finalisasiDeskBatch,
} = require("../services/penilaian.service");

const getRekapDeskEvaluasiController = async (req, res) => {
  const id_proposal = Number(req.params.id_proposal);

  const result = await getRekapDeskEvaluasi(id_proposal);

  if (result.error) {
    return res.status(400).json({
      message: result.message,
      data: result.data,
    });
  }

  return res.json({
    message: "Rekap desk evaluasi tahap 1",
    data: result.data,
  });
};

const finalisasiDeskBatchController = async (req, res) => {
  const result = await finalisasiDeskBatch(req.body);

  if (result.error) {
    return res.status(400).json({
      message: result.message,
      data: result.data,
    });
  }

  return res.json({
    message: result.message,
    data: result.data,
  });
};

module.exports = {
  getRekapDeskEvaluasiController,
  finalisasiDeskBatchController,
};
