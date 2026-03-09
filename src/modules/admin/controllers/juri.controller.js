const { createJuri, getJuris, getJuriDetail } = require("../services/juri.service");

const createJuriController = async (req, res, next) => {
  try {
    const result = await createJuri(req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.message, data: result.data });
    return res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getJurisController = async (req, res, next) => {
  try {
    const result = await getJuris();
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getJuriDetailController = async (req, res, next) => {
  try {
    const id_user = parseInt(req.params.id_user);
    if (isNaN(id_user) || id_user <= 0) {
      return res.status(400).json({ success: false, message: "ID user tidak valid", data: null });
    }
    const result = await getJuriDetail(id_user);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

module.exports = { createJuriController, getJurisController, getJuriDetailController };