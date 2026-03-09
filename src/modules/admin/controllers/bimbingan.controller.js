const {
  getDashboardPengajuanPembimbing,
  getDashboardBimbingan,
} = require("../services/bimbingan.service");

const getDashboardPengajuanPembimbingController = async (req, res, next) => {
  try {
    const result = await getDashboardPengajuanPembimbing(req.user.id_user, req.query.status);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getDashboardBimbinganController = async (req, res, next) => {
  try {
    const result = await getDashboardBimbingan(req.user.id_user, req.query.status);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

module.exports = { getDashboardPengajuanPembimbingController, getDashboardBimbinganController };