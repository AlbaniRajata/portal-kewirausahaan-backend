const {
  getBimbinganMasuk,
  getDetailBimbingan,
  approveBimbingan,
  rejectBimbingan,
} = require("../services/bimbingan.service");

const getBimbinganMasukController = async (req, res, next) => {
  try {
    const result = await getBimbinganMasuk(req.user.id_user);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const getDetailBimbinganController = async (req, res, next) => {
  try {
    const id_bimbingan = parseInt(req.params.id_bimbingan);

    if (isNaN(id_bimbingan) || id_bimbingan <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID bimbingan tidak valid",
        data: null,
      });
    }

    const result = await getDetailBimbingan(req.user.id_user, id_bimbingan);

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

const approveBimbinganController = async (req, res, next) => {
  try {
    const id_bimbingan = parseInt(req.params.id_bimbingan);

    if (isNaN(id_bimbingan) || id_bimbingan <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID bimbingan tidak valid",
        data: null,
      });
    }

    const result = await approveBimbingan(req.user.id_user, id_bimbingan);

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

const rejectBimbinganController = async (req, res, next) => {
  try {
    const id_bimbingan = parseInt(req.params.id_bimbingan);

    if (isNaN(id_bimbingan) || id_bimbingan <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID bimbingan tidak valid",
        data: null,
      });
    }

    const result = await rejectBimbingan(req.user.id_user, id_bimbingan, req.body.catatan);

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
  getBimbinganMasukController,
  getDetailBimbinganController,
  approveBimbinganController,
  rejectBimbinganController,
};