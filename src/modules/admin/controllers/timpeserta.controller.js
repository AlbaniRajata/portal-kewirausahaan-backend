const {
  getTimList,
  getTimDetail,
  getPesertaList,
  getPesertaDetail,
} = require("../services/timpeserta.service");

const getTimListController = async (req, res) => {
  try {
    const { id_program, status, search } = req.query;
    const result = await getTimList({
      id_program: id_program || undefined,
      status: status !== undefined ? Number(status) : undefined,
      search: search || undefined,
    });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) {
    console.error("ERROR GET TIM LIST:", err);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada sistem", data: null });
  }
};

const getTimDetailController = async (req, res) => {
  try {
    const { id_tim } = req.params;
    if (!id_tim || isNaN(id_tim)) {
      return res.status(400).json({ success: false, message: "ID tim tidak valid", data: null });
    }
    const result = await getTimDetail(id_tim);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.message, data: null });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) {
    console.error("ERROR GET TIM DETAIL:", err);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada sistem", data: null });
  }
};

const getPesertaListController = async (req, res) => {
  try {
    const { id_program, status_lolos, status_peserta, search } = req.query;
    const result = await getPesertaList({
      id_program: id_program || undefined,
      status_lolos: status_lolos !== undefined ? Number(status_lolos) : undefined,
      status_peserta: status_peserta !== undefined ? Number(status_peserta) : undefined,
      search: search || undefined,
    });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) {
    console.error("ERROR GET PESERTA LIST:", err);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada sistem", data: null });
  }
};

const getPesertaDetailController = async (req, res) => {
  try {
    const { id_user, id_program } = req.params;
    if (!id_user || isNaN(id_user) || !id_program || isNaN(id_program)) {
      return res.status(400).json({ success: false, message: "ID tidak valid", data: null });
    }
    const result = await getPesertaDetail(id_user, id_program);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.message, data: null });
    }
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) {
    console.error("ERROR GET PESERTA DETAIL:", err);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada sistem", data: null });
  }
};

module.exports = {
  getTimListController,
  getTimDetailController,
  getPesertaListController,
  getPesertaDetailController,
};