const {
  previewDistribusiTahap2,
  autoDistribusiTahap2,
  manualDistribusiTahap2,
  getDistribusiReviewerHistoryTahap2,
  getDistribusiJuriHistoryTahap2,
  getJuriList,
} = require("../services/distribusiTahap2.service");

const previewDistribusiTahap2Controller = async (req, res) => {
  const id_program = Number(req.params.id_program);

  const result = await previewDistribusiTahap2(id_program);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const autoDistribusiTahap2Controller = async (req, res) => {
  const id_program = Number(req.params.id_program);

  const result = await autoDistribusiTahap2(
    req.user.id_user,
    id_program
  );

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const manualDistribusiTahap2Controller = async (req, res) => {
  const id_program = Number(req.params.id_program);

  const result = await manualDistribusiTahap2(
    req.user.id_user,
    id_program,
    req.body
  );

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getDistribusiReviewerHistoryTahap2Controller = async (req, res) => {
  const id_program = Number(req.params.id_program);

  const result = await getDistribusiReviewerHistoryTahap2(id_program);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getDistribusiJuriHistoryTahap2Controller = async (req, res) => {
  const id_program = Number(req.params.id_program);

  const result = await getDistribusiJuriHistoryTahap2(id_program);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

module.exports = {
  previewDistribusiTahap2Controller,
  autoDistribusiTahap2Controller,
  manualDistribusiTahap2Controller,
  getDistribusiReviewerHistoryTahap2Controller,
  getDistribusiJuriHistoryTahap2Controller,
};