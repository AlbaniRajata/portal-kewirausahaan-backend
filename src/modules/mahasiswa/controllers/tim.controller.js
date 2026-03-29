const timService = require("../services/tim.service");

const createTimController = async (req, res, next) => {
  try {
    const result = await timService.createTim(req.user, req.body);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        data: { field: result.field },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Tim berhasil dibuat",
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const searchMahasiswaController = async (req, res, next) => {
  try {
    const result = await timService.searchMahasiswa(req.user, req.query.query);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        data: { field: result.field },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pencarian berhasil",
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const acceptInviteController = async (req, res, next) => {
  try {
    const id_tim = parseInt(req.params.id_tim);

    if (isNaN(id_tim) || id_tim <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID tim tidak valid",
        data: { field: "id_tim" },
      });
    }

    const result = await timService.acceptInvite(req.user, id_tim);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        data: { field: result.field },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Undangan berhasil diterima",
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const rejectInviteController = async (req, res, next) => {
  try {
    const id_tim = parseInt(req.params.id_tim);

    if (isNaN(id_tim) || id_tim <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID tim tidak valid",
        data: { field: "id_tim" },
      });
    }

    const result = await timService.rejectInvite(req.user, id_tim, req.body.catatan);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        data: { field: result.field },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Undangan berhasil ditolak",
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const getTimStatusController = async (req, res, next) => {
  try {
    const result = await timService.getTimStatus(req.user);

    return res.status(200).json({
      success: true,
      message: "Status tim berhasil diambil",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getTimDetailController = async (req, res, next) => {
  try {
    const result = await timService.getTimDetail(req.user);

    if (result.error) {
      return res.status(404).json({
        success: false,
        message: result.error,
        data: { field: result.field },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail tim berhasil diambil",
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const addAnggotaController = async (req, res, next) => {
  try {
    const result = await timService.addAnggotaToTim(req.user, req.body.nim);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        data: { field: result.field },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Undangan berhasil dikirim ke anggota baru",
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const resetTimController = async (req, res, next) => {
  try {
    const result = await timService.resetTim(req.user);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        data: { field: result.field },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tim berhasil direset. Anda dapat mengajukan tim baru.",
    });
  } catch (err) {
    next(err);
  }
};

const cekEligibleInbisController = async (req, res, next) => {
  try {
    const result = await timService.cekEligibleInbis(req.user.id_user);
    return res.status(200).json({
      success: true,
      message: "Cek eligibilitas berhasil",
      data: result,
    });
  } catch (err) { next(err); }
};

module.exports = {
  createTimController,
  searchMahasiswaController,
  acceptInviteController,
  rejectInviteController,
  getTimStatusController,
  getTimDetailController,
  addAnggotaController,
  resetTimController,
  cekEligibleInbisController,
};