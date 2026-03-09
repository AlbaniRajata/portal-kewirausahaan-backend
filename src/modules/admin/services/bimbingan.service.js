const {
  getMyProgramDb,
  getStatistikPengajuanPembimbingDb,
  getListPengajuanPembimbingDb,
  getStatistikBimbinganDb,
  getListBimbinganDb,
} = require("../db/bimbingan.db");

const getDashboardPengajuanPembimbing = async (id_admin, status_filter) => {
  const program = await getMyProgramDb(id_admin);
  if (!program) return { error: true, message: "Anda belum ditugaskan ke program manapun", data: null };

  const statusNum = status_filter !== undefined && status_filter !== "" ? parseInt(status_filter) : null;

  const [statistik, list] = await Promise.all([
    getStatistikPengajuanPembimbingDb(program.id_program),
    getListPengajuanPembimbingDb(program.id_program, statusNum),
  ]);

  return { error: false, message: "Dashboard pengajuan pembimbing berhasil diambil", data: { statistik, list } };
};

const getDashboardBimbingan = async (id_admin, status_filter) => {
  const program = await getMyProgramDb(id_admin);
  if (!program) return { error: true, message: "Anda belum ditugaskan ke program manapun", data: null };

  const statusNum = status_filter !== undefined && status_filter !== "" ? parseInt(status_filter) : null;

  const [statistik, list] = await Promise.all([
    getStatistikBimbinganDb(program.id_program),
    getListBimbinganDb(program.id_program, statusNum),
  ]);

  return { error: false, message: "Dashboard jadwal bimbingan berhasil diambil", data: { statistik, list } };
};

module.exports = { getDashboardPengajuanPembimbing, getDashboardBimbingan };