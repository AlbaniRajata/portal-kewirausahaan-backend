const {
  listDosenPembimbing,
  ajukanPembimbing,
  getStatusPembimbing,
} = require("../services/pembimbing.service");

const listDosenPembimbingController = async (req, res) => {
  const result = await listDosenPembimbing();

  return res.json({
    success: true,
    message: result.message,
    data: result.data,
  });
};

const getStatusPembimbingController = async (req, res) => {
  const id_user = req.user.id_user;

  const result = await getStatusPembimbing(id_user);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

const ajukanPembimbingController = async (req, res) => {
  const id_user = req.user.id_user;

  const result = await ajukanPembimbing(id_user, req.body);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

module.exports = {
  listDosenPembimbingController,
  ajukanPembimbingController,
  getStatusPembimbingController,
};
