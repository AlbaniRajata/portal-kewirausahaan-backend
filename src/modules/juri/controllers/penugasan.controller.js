const {
  getPenugasan,
  getDetailPenugasan,
  acceptPenugasan,
  rejectPenugasan,
} = require("../services/penugasan.services");

const getPenugasanController = async (req, res, next) => {
  try {
    const result = await getPenugasan(req.user.id_user, req.query.status);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.message,
        data: result.data,
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

const getDetailPenugasanController = async (req, res, next) => {
  try {
    const id_distribusi = parseInt(req.params.id_distribusi);

    if (isNaN(id_distribusi) || id_distribusi <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID distribusi tidak valid",
        data: null,
      });
    }

    const result = await getDetailPenugasan(req.user.id_user, id_distribusi);

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

const acceptPenugasanController = async (req, res, next) => {
  try {
    const id_distribusi = parseInt(req.params.id_distribusi);

    if (isNaN(id_distribusi) || id_distribusi <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID distribusi tidak valid",
        data: null,
      });
    }

    const result = await acceptPenugasan(req.user.id_user, id_distribusi);

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

const rejectPenugasanController = async (req, res, next) => {
  try {
    const id_distribusi = parseInt(req.params.id_distribusi);

    if (isNaN(id_distribusi) || id_distribusi <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID distribusi tidak valid",
        data: null,
      });
    }

    const { catatan } = req.body || {};

    if (!catatan || typeof catatan !== "string" || catatan.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Catatan penolakan wajib diisi minimal 5 karakter",
        data: null,
      });
    }

    const result = await rejectPenugasan(req.user.id_user, id_distribusi, catatan);

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
  getPenugasanController,
  getDetailPenugasanController,
  acceptPenugasanController,
  rejectPenugasanController,
};