const timService = require("../services/tim.service");

const createTimController = async (req, res, next) => {
    try {
        const data = await timService.createTim(req.user, req.body);
        res.json({
            success: true,
            data
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message,
            data: err.data || null
        });
    }
};

const searchMahasiswaController = async (req, res, next) => {
  try {
    const result = await timService.searchMahasiswa(req.user, req.query.nim);

    if (result?.error) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
};

const acceptInviteController = async (req, res, next) => {
  try {
    const result = await timService.acceptInvite(
      req.user,
      req.params.id_tim
    );

    if (result?.error) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
};

const rejectInviteController = async (req, res, next) => {
  try {
    const result = await timService.rejectInvite(
      req.user,
      req.params.id_tim,
      req.body.catatan
    );

    if (result?.error) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
    createTimController,
    searchMahasiswaController,
    acceptInviteController,
    rejectInviteController,
};
