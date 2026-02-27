const {
  listBimbingan,
  detailBimbingan,
  ajukanBimbingan,
} = require("../services/bimbingan.service");

const listBimbinganController = async (req, res) => {
  const id_user = req.user.id_user;

  const result = await listBimbingan(id_user);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    is_ketua: result.is_ketua,
    data: result.data,
  });
};

const detailBimbinganController = async (req, res) => {
  const id_user = req.user.id_user;
  const { id_bimbingan } = req.params;

  const result = await detailBimbingan(id_user, id_bimbingan);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

const ajukanBimbinganController = async (req, res) => {
  const id_user = req.user.id_user;

  const result = await ajukanBimbingan(id_user, req.body);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

module.exports = {
  listBimbinganController,
  detailBimbinganController,
  ajukanBimbinganController,
};