const {
  getPengajuanMasuk,
  getDetailPengajuan,
  approvePengajuan,
  rejectPengajuan,
} = require("../services/pembimbing.service");

const getPengajuanMasukController = async (req, res) => {
  const id_dosen = req.user.id_user;

  const result = await getPengajuanMasuk(id_dosen);

  return res.json({
    success: true,
    message: result.message,
    data: result.data,
  });
};

const getDetailPengajuanController = async (req, res) => {
  const id_dosen = req.user.id_user;
  const id_pengajuan = Number(req.params.id_pengajuan);

  const result = await getDetailPengajuan(id_dosen, id_pengajuan);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

const approvePengajuanController = async (req, res) => {
  const id_dosen = req.user.id_user;
  const id_pengajuan = Number(req.params.id_pengajuan);

  const result = await approvePengajuan(id_dosen, id_pengajuan);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

const rejectPengajuanController = async (req, res) => {
  const id_dosen = req.user.id_user;
  const id_pengajuan = Number(req.params.id_pengajuan);

  const result = await rejectPengajuan(
    id_dosen,
    id_pengajuan,
    req.body.catatan
  );

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
  });
};

module.exports = {
  getPengajuanMasukController,
  getDetailPengajuanController,
  approvePengajuanController,
  rejectPengajuanController,
};
