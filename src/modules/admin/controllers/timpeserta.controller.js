const {
  getTimList,
  getTimDetail,
  getPesertaList,
  getPesertaDetail,
} = require("../services/timpeserta.service");

const getTimListController = async (req, res, next) => {
  try {
    const { id_program, status, search } = req.query;
    const result = await getTimList({
      id_program: id_program ? parseInt(id_program) : undefined,
      status: status !== undefined ? parseInt(status) : undefined,
      search: search || undefined,
    });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getTimDetailController = async (req, res, next) => {
  try {
    const id_tim = parseInt(req.params.id_tim);
    if (isNaN(id_tim) || id_tim <= 0) {
      return res.status(400).json({ success: false, message: "ID tim tidak valid", data: null });
    }
    const result = await getTimDetail(id_tim);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getPesertaListController = async (req, res, next) => {
  try {
    const { id_program, status_lolos, status_peserta, search } = req.query;
    const result = await getPesertaList({
      id_program: id_program ? parseInt(id_program) : undefined,
      status_lolos: status_lolos !== undefined ? parseInt(status_lolos) : undefined,
      status_peserta: status_peserta !== undefined ? parseInt(status_peserta) : undefined,
      search: search || undefined,
    });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getPesertaDetailController = async (req, res, next) => {
  try {
    const id_user = parseInt(req.params.id_user);
    const id_program = parseInt(req.params.id_program);
    if (isNaN(id_user) || id_user <= 0 || isNaN(id_program) || id_program <= 0) {
      return res.status(400).json({ success: false, message: "ID tidak valid", data: null });
    }
    const result = await getPesertaDetail(id_user, id_program);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

module.exports = {
  getTimListController,
  getTimDetailController,
  getPesertaListController,
  getPesertaDetailController,
};