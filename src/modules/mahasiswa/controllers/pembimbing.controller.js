const {
  listDosenPembimbing,
  ajukanPembimbing,
  getStatusPembimbing,
} = require("../services/pembimbing.service");

const listDosenPembimbingController = async (req, res, next) => {
  try {
    const result = await listDosenPembimbing();

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const getStatusPembimbingController = async (req, res, next) => {
  try {
    const result = await getStatusPembimbing(req.user.id_user);

    if (result.error) {
      return res.status(400).json({
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

const ajukanPembimbingController = async (req, res, next) => {
  try {
    const result = await ajukanPembimbing(req.user.id_user, req.body);

    if (result.error) {
      return res.status(400).json({
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
  listDosenPembimbingController,
  getStatusPembimbingController,
  ajukanPembimbingController,
};