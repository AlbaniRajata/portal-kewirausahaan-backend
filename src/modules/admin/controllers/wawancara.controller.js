const { 
    scheduleWawancara,
    scheduleWawancaraBulk,
} = require("../services/wawancara.service");

const scheduleWawancaraController = async (req, res) => {
  const id_proposal = Number(req.params.id_proposal);
  const { wawancara_at } = req.body;

  if (!id_proposal) {
    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      data: {
        field: "id_proposal",
        reason: "id_proposal wajib diisi",
      },
    });
  }

  const result = await scheduleWawancara(id_proposal, wawancara_at);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const scheduleWawancaraBulkController = async (req, res) => {
  const { jadwal } = req.body;

  const result = await scheduleWawancaraBulk(jadwal);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

module.exports = {
  scheduleWawancaraController,
  scheduleWawancaraBulkController,
};
