const {
  getMonevTimBimbinganDb,
  getTimBimbinganByIdDb,
  getDetailLuaranTimDb,
} = require("../db/monev.db");

const getMonevTimBimbingan = async (id_dosen) => {
  const data = await getMonevTimBimbinganDb(id_dosen);
  return {
    error: false,
    message: "Daftar monev tim bimbingan berhasil diambil",
    data,
  };
};

const getMonevDetailTim = async (id_dosen, id_tim) => {
  if (!Number.isInteger(id_tim) || id_tim <= 0) {
    return { error: true, message: "ID tim tidak valid", data: null };
  }

  const tim = await getTimBimbinganByIdDb(id_dosen, id_tim);
  if (!tim) {
    return { error: true, message: "Tim bimbingan tidak ditemukan atau akses ditolak", data: null };
  }

  const luaran = await getDetailLuaranTimDb(id_tim, tim.id_program);
  const progress = {
    total: luaran.length,
    disetujui: luaran.filter((l) => l.status === 2).length,
    submitted: luaran.filter((l) => l.status === 1).length,
    ditolak: luaran.filter((l) => l.status === 3).length,
    belum: luaran.filter((l) => !l.id_luaran_tim).length,
  };

  return {
    error: false,
    message: "Detail monev tim bimbingan berhasil diambil",
    data: { tim, progress, luaran },
  };
};

module.exports = {
  getMonevTimBimbingan,
  getMonevDetailTim,
};
