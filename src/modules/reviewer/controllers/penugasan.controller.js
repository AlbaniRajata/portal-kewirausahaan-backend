const {
  getPenugasan,
  getDetailPenugasan,
  acceptPenugasan,
  rejectPenugasan,
} = require("../services/penugasan.service");

const getPenugasanController = async (req, res) => {
  const { id_user } = req.user;
  const tahap = Number(req.query.tahap);

  if (![1, 2].includes(tahap)) {
    return res.status(400).json({
      message: "Validasi gagal",
      data: {
        field: "tahap",
        reason: "Tahap wajib diisi (1 atau 2)",
      },
    });
  }

  const result = await getPenugasan(id_user, tahap);

  return res.json({
    message: "Daftar penugasan reviewer",
    data: result.data,
  });
};

const getDetailPenugasanController = async (req, res) => {
  const { id_user } = req.user;
  const id_distribusi = Number(req.params.id_distribusi);

  if (!id_distribusi) {
    return res.status(400).json({
      message: "Validasi gagal",
      data: {
        field: "id_distribusi",
        reason: "id_distribusi wajib diisi",
      },
    });
  }

  const result = await getDetailPenugasan(id_user, id_distribusi);

  if (result.error) {
    return res.status(404).json({
      message: result.message,
      data: null,
    });
  }

  return res.json({
    message: "Detail penugasan reviewer",
    data: result.data,
  });
};

const acceptPenugasanController = async (req, res) => {
  const { id_user } = req.user;
  const id_distribusi = Number(req.params.id_distribusi);

  if (!id_distribusi) {
    return res.status(400).json({
      message: "Validasi gagal",
      data: {
        field: "id_distribusi",
        reason: "id_distribusi wajib diisi",
      },
    });
  }

  const result = await acceptPenugasan(id_user, id_distribusi);

  if (result.error) {
    return res.status(400).json({
      message: result.message,
      data: result.data,
    });
  }

  return res.json({
    message: "Penugasan berhasil diterima",
    data: result.data,
  });
};

const rejectPenugasanController = async (req, res) => {
  const { id_user } = req.user;
  const id_distribusi = Number(req.params.id_distribusi);
  const { catatan } = req.body || {};

  if (!id_distribusi) {
    return res.status(400).json({
      message: "Validasi gagal",
      data: {
        field: "id_distribusi",
        reason: "id_distribusi wajib diisi",
      },
    });
  }

  if (!catatan || catatan.trim() === "") {
    return res.status(400).json({
      message: "Validasi gagal",
      data: {
        field: "catatan",
        reason: "Catatan wajib diisi saat menolak penugasan",
      },
    });
  }

  const result = await rejectPenugasan(id_user, id_distribusi, catatan);

  if (result.error) {
    return res.status(400).json({
      message: result.message,
      data: result.data,
    });
  }

  return res.json({
    message: "Penugasan berhasil ditolak",
    data: result.data,
  });
};

module.exports = {
  getPenugasanController,
  getDetailPenugasanController,
  acceptPenugasanController,
  rejectPenugasanController,
};
