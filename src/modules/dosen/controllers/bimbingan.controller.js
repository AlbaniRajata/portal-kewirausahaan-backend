const {
  getBimbinganMasuk,
  getDetailBimbingan,
  approveBimbingan,
  rejectBimbingan,
} = require("../services/bimbingan.service");

const getBimbinganMasukController = async (req, res) => {
  const id_dosen = req.user.id_user;

  const result = await getBimbinganMasuk(id_dosen);

  return res.json({
    success: true,
    message: result.message,
    data: result.data,
  });
};

const getDetailBimbinganController = async (req, res) => {
  const id_dosen = req.user.id_user;
  const id_bimbingan = Number(req.params.id_bimbingan);

  const result = await getDetailBimbingan(id_dosen, id_bimbingan);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

const approveBimbinganController = async (req, res) => {
  const id_dosen = req.user.id_user;
  const id_bimbingan = Number(req.params.id_bimbingan);

  const result = await approveBimbingan(id_dosen, id_bimbingan);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

const rejectBimbinganController = async (req, res) => {
  const id_dosen = req.user.id_user;
  const id_bimbingan = Number(req.params.id_bimbingan);

  const result = await rejectBimbingan(
    id_dosen,
    id_bimbingan,
    req.body.catatan
  );

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

module.exports = {
  getBimbinganMasukController,
  getDetailBimbinganController,
  approveBimbinganController,
  rejectBimbinganController,
};