const {
  getHistoryPenilaianTahap1,
  getHistoryPenilaianTahap2,
  getHistoryDetailTahap1,
  getHistoryDetailTahap2,
} = require("../services/historyPenilaian.service");

const getHistoryPenilaianTahap1Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await getHistoryPenilaianTahap1(id_program);
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getHistoryPenilaianTahap2Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await getHistoryPenilaianTahap2(id_program);
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getHistoryDetailTahap1Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    const id_proposal = parseInt(req.params.id_proposal);
    if (isNaN(id_program) || id_program <= 0 || isNaN(id_proposal) || id_proposal <= 0) {
      return res.status(400).json({ success: false, message: "Parameter tidak valid", data: null });
    }
    const result = await getHistoryDetailTahap1(id_program, id_proposal);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getHistoryDetailTahap2Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    const id_proposal = parseInt(req.params.id_proposal);
    if (isNaN(id_program) || id_program <= 0 || isNaN(id_proposal) || id_proposal <= 0) {
      return res.status(400).json({ success: false, message: "Parameter tidak valid", data: null });
    }
    const result = await getHistoryDetailTahap2(id_program, id_proposal);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

module.exports = {
  getHistoryPenilaianTahap1Controller,
  getHistoryPenilaianTahap2Controller,
  getHistoryDetailTahap1Controller,
  getHistoryDetailTahap2Controller,
};