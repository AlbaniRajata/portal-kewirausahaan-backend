const {
  getDashboardPengajuanPembimbing,
  getDashboardBimbingan,
} = require("../services/bimbingan.service");

const getDashboardPengajuanPembimbingController = async (req, res) => {
  const id_admin = req.user.id_user;
  const status_filter = req.query.status;

  const result = await getDashboardPengajuanPembimbing(id_admin, status_filter);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

const getDashboardBimbinganController = async (req, res) => {
  const id_admin = req.user.id_user;
  const status_filter = req.query.status;

  const result = await getDashboardBimbingan(id_admin, status_filter);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

module.exports = {
  getDashboardPengajuanPembimbingController,
  getDashboardBimbinganController,
};