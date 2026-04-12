const {
  getProposalWithTim,
  updatePembimbing,
  updateMultiplePembimbing,
  getDosen,
  getDosenBeban,
} = require("../services/pembimbing.service");

const isInvalidId = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) || parsed <= 0;
};

const getProposalListPembimbingController = async (req, res, next) => {
  try {
    const { id_program } = req.query;

    if (id_program !== undefined && id_program !== null && id_program !== "" && isInvalidId(id_program)) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }

    const result = await getProposalWithTim(id_program);
    if (result.error) {
      return res.status(400).json({ success: false, message: result.message, data: result.data || null });
    }

    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    next(error);
  }
};

const updatePembimbingController = async (req, res, next) => {
  try {
    const { id_tim } = req.params;
    const { id_dosen } = req.body;

    if (isInvalidId(id_tim)) {
      return res.status(400).json({ success: false, message: "ID tim tidak valid", data: null });
    }
    if (isInvalidId(id_dosen)) {
      return res.status(400).json({ success: false, message: "ID dosen tidak valid", data: null });
    }

    const result = await updatePembimbing(id_tim, id_dosen);
    if (result.error) {
      const status = result.message.includes("tidak ditemukan") ? 404 : 400;
      return res.status(status).json({ success: false, message: result.message, data: result.data || null });
    }

    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    next(error);
  }
};

const updateBatchPembimbingController = async (req, res, next) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: "Data updates tidak valid", data: null });
    }

    const invalidIndex = updates.findIndex((item) => {
      if (!item || typeof item !== "object") return true;
      return isInvalidId(item.id_tim) || isInvalidId(item.id_dosen);
    });

    if (invalidIndex !== -1) {
      return res.status(400).json({
        success: false,
        message: `Data update pada index ${invalidIndex} tidak valid`,
        data: { index: invalidIndex },
      });
    }

    const result = await updateMultiplePembimbing(updates);
    if (result.error) {
      return res.status(400).json({ success: false, message: result.message, data: result.data || null });
    }

    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    next(error);
  }
};

const getDosenController = async (req, res, next) => {
  try {
    const result = await getDosen();
    if (result.error) {
      return res.status(400).json({ success: false, message: result.message, data: result.data || null });
    }

    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    next(error);
  }
};

const getDosenBebanController = async (req, res, next) => {
  try {
    const { id_program } = req.query;

    if (id_program !== undefined && id_program !== null && id_program !== "" && isInvalidId(id_program)) {
      return res.status(400).json({ success: false, message: "ID program tidak valid", data: null });
    }

    const result = await getDosenBeban(id_program);
    if (result.error) {
      return res.status(400).json({ success: false, message: result.message, data: result.data || null });
    }

    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProposalListPembimbingController,
  updatePembimbingController,
  updateBatchPembimbingController,
  updateMultiplePembimbingController: updateBatchPembimbingController,
  getDosenController,
  getDosenBebanController,
};