const {
  getMonevTimBimbingan,
  getMonevDetailTim,
} = require("../services/monev.service");

const getMonevTimBimbinganController = async (req, res, next) => {
  try {
    const result = await getMonevTimBimbingan(req.user.id_user);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const getMonevDetailTimController = async (req, res, next) => {
  try {
    const id_tim = parseInt(req.params.id_tim);
    if (isNaN(id_tim) || id_tim <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID tim tidak valid",
        data: null,
      });
    }

    const result = await getMonevDetailTim(req.user.id_user, id_tim);
    if (result.error) {
      return res.status(404).json({
        success: false,
        message: result.message,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMonevTimBimbinganController,
  getMonevDetailTimController,
};
