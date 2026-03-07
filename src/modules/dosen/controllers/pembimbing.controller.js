const {
  getPengajuanMasuk,
  getDetailPengajuan,
  approvePengajuan,
  rejectPengajuan,
} = require("../services/pembimbing.service");

const getPengajuanMasukController = async (req, res, next) => {
  try {
    const result = await getPengajuanMasuk(req.user.id_user);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const getDetailPengajuanController = async (req, res, next) => {
  try {
    const id_pengajuan = parseInt(req.params.id_pengajuan);

    if (isNaN(id_pengajuan) || id_pengajuan <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID pengajuan tidak valid",
        data: null,
      });
    }

    const result = await getDetailPengajuan(req.user.id_user, id_pengajuan);

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

const approvePengajuanController = async (req, res, next) => {
  try {
    const id_pengajuan = parseInt(req.params.id_pengajuan);

    if (isNaN(id_pengajuan) || id_pengajuan <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID pengajuan tidak valid",
        data: null,
      });
    }

    const result = await approvePengajuan(req.user.id_user, id_pengajuan);

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

const rejectPengajuanController = async (req, res, next) => {
  try {
    const id_pengajuan = parseInt(req.params.id_pengajuan);

    if (isNaN(id_pengajuan) || id_pengajuan <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID pengajuan tidak valid",
        data: null,
      });
    }

    const result = await rejectPengajuan(req.user.id_user, id_pengajuan, req.body.catatan);

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
  getPengajuanMasukController,
  getDetailPengajuanController,
  approvePengajuanController,
  rejectPengajuanController,
};