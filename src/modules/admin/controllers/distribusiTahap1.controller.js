const {
  previewDistribusiTahap1,
  autoDistribusiTahap1,
  manualDistribusiTahap1,
  bulkDistribusiTahap1,
  getDistribusiHistory,
  getDistribusiDetail,
  reassignReviewer,
} = require("../services/distribusiTahap1.service");

const previewDistribusiTahap1Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await previewDistribusiTahap1(id_program);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const autoDistribusiTahap1Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await autoDistribusiTahap1(req.user.id_user, id_program);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const manualDistribusiTahap1Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await manualDistribusiTahap1(req.user.id_user, { ...req.body, id_program });
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const bulkDistribusiTahap1Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await bulkDistribusiTahap1(req.user.id_user, { ...req.body, id_program });
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getDistribusiHistoryController = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    const tahap = parseInt(req.params.tahap);
    if (isNaN(id_program) || id_program <= 0 || isNaN(tahap) || tahap <= 0) {
      return res.status(400).json({ success: false, message: "Parameter tidak valid", data: null });
    }
    const result = await getDistribusiHistory(id_program, tahap);
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getDistribusiDetailController = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    const tahap = parseInt(req.params.tahap);
    const id_distribusi = parseInt(req.params.id_distribusi);
    if (isNaN(id_program) || id_program <= 0 || isNaN(tahap) || tahap <= 0 || isNaN(id_distribusi) || id_distribusi <= 0) {
      return res.status(400).json({ success: false, message: "Parameter tidak valid", data: null });
    }
    const result = await getDistribusiDetail(id_distribusi, id_program, tahap);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const reassignReviewerController = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    const tahap = parseInt(req.params.tahap);
    const id_distribusi = parseInt(req.params.id_distribusi);
    const id_reviewer_baru = parseInt(req.body.id_reviewer_baru);

    if (isNaN(id_program) || id_program <= 0 || isNaN(tahap) || tahap <= 0 || isNaN(id_distribusi) || id_distribusi <= 0) {
      return res.status(400).json({ success: false, message: "Parameter tidak valid", data: null });
    }
    if (!req.body.id_reviewer_baru || isNaN(id_reviewer_baru) || id_reviewer_baru <= 0) {
      return res.status(400).json({ success: false, message: "id_reviewer_baru wajib diisi dan valid", data: null });
    }

    const result = await reassignReviewer(req.user.id_user, id_distribusi, id_reviewer_baru, id_program, tahap);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

module.exports = {
  previewDistribusiTahap1Controller,
  autoDistribusiTahap1Controller,
  manualDistribusiTahap1Controller,
  bulkDistribusiTahap1Controller,
  getDistribusiHistoryController,
  getDistribusiDetailController,
  reassignReviewerController,
};