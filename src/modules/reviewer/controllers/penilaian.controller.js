const { getFormPenilaian, simpanNilai, submitPenilaian } = require("../services/penilaian.service");

const getFormPenilaianController = async (req, res, next) => {
  try {
    const id_distribusi = parseInt(req.params.id_distribusi);

    if (isNaN(id_distribusi) || id_distribusi <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID distribusi tidak valid",
        data: null,
      });
    }

    const result = await getFormPenilaian(req.user.id_user, id_distribusi);

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

const simpanNilaiController = async (req, res, next) => {
  try {
    const id_distribusi = parseInt(req.params.id_distribusi);

    if (isNaN(id_distribusi) || id_distribusi <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID distribusi tidak valid",
        data: null,
      });
    }

    const payload = req.body.nilai;

    if (!Array.isArray(payload) || payload.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Field 'nilai' wajib berupa array dan tidak boleh kosong",
        data: null,
      });
    }

    const result = await simpanNilai(req.user.id_user, id_distribusi, payload);

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

const submitPenilaianController = async (req, res, next) => {
  try {
    const id_distribusi = parseInt(req.params.id_distribusi);

    if (isNaN(id_distribusi) || id_distribusi <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID distribusi tidak valid",
        data: null,
      });
    }

    const result = await submitPenilaian(req.user.id_user, id_distribusi);

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

module.exports = {
  getFormPenilaianController,
  simpanNilaiController,
  submitPenilaianController,
};