const {
  getListProposalRekapTahap1,
  getListProposalRekapTahap2,
  getRekapDeskEvaluasi,
  finalisasiDeskBatch,
  getRekapWawancaraTahap2,
  finalisasiWawancaraBatch,
} = require("../services/penilaian.service");

const getListProposalRekapTahap1Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await getListProposalRekapTahap1(id_program);
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getListProposalRekapTahap2Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await getListProposalRekapTahap2(id_program);
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getRekapDeskEvaluasiController = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    const id_proposal = parseInt(req.params.id_proposal);
    if (isNaN(id_program) || id_program <= 0 || isNaN(id_proposal) || id_proposal <= 0) {
      return res.status(400).json({ success: false, message: "Parameter tidak valid", data: null });
    }
    const result = await getRekapDeskEvaluasi(id_program, id_proposal);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const finalisasiDeskBatchController = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await finalisasiDeskBatch(id_program, req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getRekapWawancaraTahap2Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    const id_proposal = parseInt(req.params.id_proposal);
    if (isNaN(id_program) || id_program <= 0 || isNaN(id_proposal) || id_proposal <= 0) {
      return res.status(400).json({ success: false, message: "Parameter tidak valid", data: null });
    }
    const result = await getRekapWawancaraTahap2(id_program, id_proposal);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const finalisasiWawancaraBatchController = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await finalisasiWawancaraBatch(id_program, req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

module.exports = {
  getListProposalRekapTahap1Controller,
  getListProposalRekapTahap2Controller,
  getRekapDeskEvaluasiController,
  finalisasiDeskBatchController,
  getRekapWawancaraTahap2Controller,
  finalisasiWawancaraBatchController,
};