const {
  previewDistribusiTahap2,
  autoDistribusiTahap2,
  manualDistribusiTahap2,
  reassignReviewerTahap2,
  reassignJuriTahap2,
  getDistribusiReviewerHistoryTahap2,
  getDistribusiJuriHistoryTahap2,
} = require("../services/distribusiTahap2.service");

const previewDistribusiTahap2Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await previewDistribusiTahap2(id_program);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const autoDistribusiTahap2Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await autoDistribusiTahap2(req.user.id_user, id_program);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const manualDistribusiTahap2Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await manualDistribusiTahap2(req.user.id_user, id_program, req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getDistribusiReviewerHistoryTahap2Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await getDistribusiReviewerHistoryTahap2(id_program);
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getDistribusiJuriHistoryTahap2Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }
    const result = await getDistribusiJuriHistoryTahap2(id_program);
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const reassignReviewerTahap2Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    const id_distribusi = parseInt(req.params.id_distribusi);
    const id_reviewer_baru = parseInt(req.body.id_reviewer_baru);

    if (isNaN(id_program) || id_program <= 0 || isNaN(id_distribusi) || id_distribusi <= 0) {
      return res.status(400).json({ success: false, message: "Parameter tidak valid", data: null });
    }
    if (!req.body.id_reviewer_baru || isNaN(id_reviewer_baru) || id_reviewer_baru <= 0) {
      return res.status(400).json({ success: false, message: "id_reviewer_baru wajib diisi dan valid", data: null });
    }

    const result = await reassignReviewerTahap2(req.user.id_user, id_distribusi, id_reviewer_baru, id_program);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const reassignJuriTahap2Controller = async (req, res, next) => {
  try {
    const id_program = parseInt(req.params.id_program);
    const id_distribusi = parseInt(req.params.id_distribusi);
    const id_juri_baru = parseInt(req.body.id_juri_baru);

    if (isNaN(id_program) || id_program <= 0 || isNaN(id_distribusi) || id_distribusi <= 0) {
      return res.status(400).json({ success: false, message: "Parameter tidak valid", data: null });
    }
    if (!req.body.id_juri_baru || isNaN(id_juri_baru) || id_juri_baru <= 0) {
      return res.status(400).json({ success: false, message: "id_juri_baru wajib diisi dan valid", data: null });
    }

    const result = await reassignJuriTahap2(req.user.id_user, id_distribusi, id_juri_baru, id_program);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

module.exports = {
  previewDistribusiTahap2Controller,
  autoDistribusiTahap2Controller,
  manualDistribusiTahap2Controller,
  reassignReviewerTahap2Controller,
  reassignJuriTahap2Controller,
  getDistribusiReviewerHistoryTahap2Controller,
  getDistribusiJuriHistoryTahap2Controller,
};