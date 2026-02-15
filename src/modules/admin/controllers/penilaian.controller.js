const {
  getListProposalRekapTahap1,
  getListProposalRekapTahap2,
  getRekapDeskEvaluasi,
  finalisasiDeskBatch,
  getRekapWawancaraTahap2,
  finalisasiWawancaraBatch,
} = require("../services/penilaian.service");

const getListProposalRekapTahap1Controller = async (req, res) => {
  const id_program = Number(req.params.id_program);

  const result = await getListProposalRekapTahap1(id_program);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getListProposalRekapTahap2Controller = async (req, res) => {
  const id_program = Number(req.params.id_program);

  const result = await getListProposalRekapTahap2(id_program);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getRekapDeskEvaluasiController = async (req, res) => {
  const id_program = Number(req.params.id_program);
  const id_proposal = Number(req.params.id_proposal);

  const result = await getRekapDeskEvaluasi(id_program, id_proposal);

  if (result.error) {
    return res.status(400).json({
      success: false,
      message: result.message,
      data: result.data,
      meta: {},
    });
  }

  return res.json({
    success: true,
    message: "Rekap desk evaluasi tahap 1",
    data: result.data,
    meta: {},
  });
};

const finalisasiDeskBatchController = async (req, res) => {
  const id_program = Number(req.params.id_program);
  const result = await finalisasiDeskBatch(id_program, req.body);

  if (result.error) {
    return res.status(400).json({
      success: false,
      message: result.message,
      data: result.data,
      meta: {},
    });
  }

  return res.json({
    success: true,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getRekapWawancaraTahap2Controller = async (req, res) => {
  const id_program = Number(req.params.id_program);
  const id_proposal = Number(req.params.id_proposal);

  const result = await getRekapWawancaraTahap2(id_program, id_proposal);

  if (result.error) {
    return res.status(400).json({
      success: false,
      message: result.message,
      data: result.data,
      meta: {},
    });
  }

  return res.json({
    success: true,
    message: "Rekap panel wawancara tahap 2",
    data: result.data,
    meta: {},
  });
};

const finalisasiWawancaraBatchController = async (req, res) => {
  const id_program = Number(req.params.id_program);
  const result = await finalisasiWawancaraBatch(id_program, req.body);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

module.exports = {
  getListProposalRekapTahap1Controller,
  getListProposalRekapTahap2Controller,
  getRekapDeskEvaluasiController,
  finalisasiDeskBatchController,
  getRekapWawancaraTahap2Controller,
  finalisasiWawancaraBatchController,
};