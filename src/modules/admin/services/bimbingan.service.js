const {
  getMyProgramDb,
  getStatistikPengajuanPembimbingDb,
  getListPengajuanPembimbingDb,
  getStatistikBimbinganDb,
  getListBimbinganDb,
} = require("../db/bimbingan.db");

const getDashboardPengajuanPembimbing = async (id_admin, status_filter) => {
  const program = await getMyProgramDb(id_admin);

  if (!program) {
    return {
      error: true,
      message: "Anda belum ditugaskan ke program manapun",
      data: null,
    };
  }

  const statistik = await getStatistikPengajuanPembimbingDb(program.id_program);
  const list = await getListPengajuanPembimbingDb(program.id_program, status_filter);

  return {
    error: false,
    message: "Dashboard pengajuan pembimbing",
    data: {
      statistik,
      list,
    },
  };
};

const getDashboardBimbingan = async (id_admin, status_filter) => {
  const program = await getMyProgramDb(id_admin);

  if (!program) {
    return {
      error: true,
      message: "Anda belum ditugaskan ke program manapun",
      data: null,
    };
  }

  const statistik = await getStatistikBimbinganDb(program.id_program);
  const list = await getListBimbinganDb(program.id_program, status_filter);

  return {
    error: false,
    message: "Dashboard jadwal bimbingan",
    data: {
      statistik,
      list,
    },
  };
};

module.exports = {
  getDashboardPengajuanPembimbing,
  getDashboardBimbingan,
};