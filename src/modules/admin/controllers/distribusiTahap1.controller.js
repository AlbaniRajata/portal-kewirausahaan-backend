const {
  previewDistribusiTahap1,
  autoDistribusiTahap1,
  manualDistribusiTahap1,
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

module.exports = {
  previewDistribusiTahap1Controller,
  autoDistribusiTahap1Controller,
  manualDistribusiTahap1Controller,
};
