const {
  previewDistribusiTahap2,
  autoDistribusiTahap2,
  manualDistribusiTahap2,
} = require("../services/distribusiTahap2.service");

const previewDistribusiTahap2Controller = async (req, res) => {
  const result = await previewDistribusiTahap2();

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const autoDistribusiTahap2Controller = async (req, res) => {
  const result = await autoDistribusiTahap2(req.user.id_user);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const manualDistribusiTahap2Controller = async (req, res) => {
  const result = await manualDistribusiTahap2(
    req.user.id_user,
    req.body
  );

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
};
