const timService = require("../services/tim.service");

const createTimController = async (req, res, next) => {
    try {
        const result = await timService.createTim(req.user, req.body);
        
        if (result.error) {
            return res.status(400).json({
                success: false,
                message: result.error,
                field: result.field
            });
        }

        res.json({
            success: true,
            message: "Tim berhasil dibuat",
            data: result.data
        });
    } catch (err) {
        next(err);
    }
};

const searchMahasiswaController = async (req, res, next) => {
  try {
    const result = await timService.searchMahasiswa(req.user, req.query.nim);

    if (result?.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        field: result.field
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (err) {
    next(err);
  }
};

const acceptInviteController = async (req, res, next) => {
  try {
    const result = await timService.acceptInvite(
      req.user,
      parseInt(req.params.id_tim)
    );

    if (result?.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        field: result.field
      });
    }

    res.json({
      success: true,
      message: result.message || "Undangan berhasil diterima",
      data: result.data
    });
  } catch (err) {
    next(err);
  }
};

const rejectInviteController = async (req, res, next) => {
  try {
    const result = await timService.rejectInvite(
      req.user,
      parseInt(req.params.id_tim),
      req.body.catatan
    );

    if (result?.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        field: result.field
      });
    }

    res.json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (err) {
    next(err);
  }
};

const getTimStatusController = async (req, res, next) => {
  try {
    const result = await timService.getTimStatus(req.user);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const getTimDetailController = async (req, res, next) => {
  try {
    const result = await timService.getTimDetail(req.user);

    if (result?.error) {
      return res.status(404).json({
        success: false,
        message: result.error,
        field: result.field
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
    createTimController,
    searchMahasiswaController,
    acceptInviteController,
    rejectInviteController,
    getTimStatusController,
    getTimDetailController,
};