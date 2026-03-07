const {
  listBimbingan,
  detailBimbingan,
  ajukanBimbingan,
} = require("../services/bimbingan.service");

const listBimbinganController = async (req, res, next) => {
  try {
    const result = await listBimbingan(req.user.id_user);

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

const detailBimbinganController = async (req, res, next) => {
  try {
    const result = await detailBimbingan(req.user.id_user, req.params.id_bimbingan);

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

const ajukanBimbinganController = async (req, res, next) => {
  try {
    const result = await ajukanBimbingan(req.user.id_user, req.body);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.message,
        data: result.data || null,
      });
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listBimbinganController,
  detailBimbinganController,
  ajukanBimbinganController,
};