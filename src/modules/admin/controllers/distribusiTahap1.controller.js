const {
  previewDistribusiTahap1,
  autoDistribusiTahap1,
  manualDistribusiTahap1,
  bulkDistribusiTahap1,
  getDistribusiHistory,
  getDistribusiDetail,
  reassignReviewer,
} = require("../services/distribusiTahap1.service");

const previewDistribusiTahap1Controller = async (req, res) => {
  const { id_program } = req.params;
  const result = await previewDistribusiTahap1(Number(id_program));

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const autoDistribusiTahap1Controller = async (req, res) => {
  const { id_program } = req.params;
  const result = await autoDistribusiTahap1(req.user.id_user, Number(id_program));

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const manualDistribusiTahap1Controller = async (req, res) => {
  const { id_program } = req.params;
  const result = await manualDistribusiTahap1(req.user.id_user, 
    { ...req.body, 
      id_program: Number(id_program) 
    }
  );

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const bulkDistribusiTahap1Controller = async (req, res) => {
  const { id_program } = req.params;
  const result = await bulkDistribusiTahap1(
    req.user.id_user,
    {
      ...req.body,
      id_program: Number(id_program),
    }
  );

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getDistribusiHistoryController = async (req, res) => {
  const { id_program, tahap } = req.params;
  const result = await getDistribusiHistory(
    Number(id_program),
    Number(tahap)
  );

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getDistribusiDetailController = async (req, res) => {
  const { id_program, tahap, id_distribusi } = req.params;
  const result = await getDistribusiDetail(
    Number(id_distribusi),
    Number(id_program),
    Number(tahap)
  );

  return res.status(result.error ? 404 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const reassignReviewerController = async (req, res) => {
  const { id_program, tahap, id_distribusi } = req.params;
  const { id_reviewer_baru } = req.body;

  if (!id_reviewer_baru) {
    return res.status(400).json({
      success: false,
      message: "id_reviewer_baru wajib diisi",
      data: null,
      meta: {},
    });
  }

  const result = await reassignReviewer(
    req.user.id_user,
    Number(id_distribusi),
    Number(id_reviewer_baru),
    Number(id_program),
    Number(tahap)
  );

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
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