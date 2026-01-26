const {
  previewDistribusi,
  autoDistribusi,
  manualDistribusi,
} = require("../services/distribusi.service");

const previewDistribusiController = async (req, res) => {
  const result = await previewDistribusi(Number(req.query.tahap));
  return res.status(result.error ? 400 : 200).json({
    message: result.error ? result.message : "Preview distribusi berhasil",
    data: result.data,
  });
};

const autoDistribusiController = async (req, res) => {
  const result = await autoDistribusi(req.user.id_user, req.body.tahap);
  return res.status(result.error ? 400 : 200).json({
    message: result.error ? result.message : "Distribusi otomatis berhasil",
    data: result.data,
  });
};

const manualDistribusiController = async (req, res) => {
  const result = await manualDistribusi(req.user.id_user, req.body);
  return res.status(result.error ? 400 : 200).json({
    message: result.error ? result.message : "Distribusi manual berhasil",
    data: result.data,
  });
};

module.exports = {
  previewDistribusiController,
  autoDistribusiController,
  manualDistribusiController,
};
