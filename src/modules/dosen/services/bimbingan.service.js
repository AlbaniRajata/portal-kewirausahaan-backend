const {
  getBimbinganMasukDb,
  getDetailBimbinganDb,
  getTimLengkapDb,
  getProposalByTimDb,
  approveBimbinganDb,
  rejectBimbinganDb,
} = require("../db/bimbingan.db");

const getBimbinganMasuk = async (id_dosen) => {
  const rows = await getBimbinganMasukDb(id_dosen);

  return {
    error: false,
    message: "Daftar pengajuan bimbingan masuk",
    data: rows,
  };
};

const getDetailBimbingan = async (id_dosen, id_bimbingan) => {
  const detail = await getDetailBimbinganDb(id_bimbingan, id_dosen);

  if (!detail) {
    return {
      error: true,
      message: "Bimbingan tidak ditemukan",
      data: null,
    };
  }

  const proposal = await getProposalByTimDb(detail.id_tim);
  const tim = await getTimLengkapDb(detail.id_tim);

  return {
    error: false,
    message: "Detail bimbingan lengkap",
    data: {
      bimbingan: detail,
      proposal,
      tim,
    },
  };
};

const approveBimbingan = async (id_dosen, id_bimbingan) => {
  const detail = await getDetailBimbinganDb(id_bimbingan, id_dosen);

  if (!detail) {
    return {
      error: true,
      message: "Bimbingan tidak ditemukan",
      data: null,
    };
  }

  if (detail.status !== 0) {
    return {
      error: true,
      message: "Bimbingan sudah direspon",
      data: detail,
    };
  }

  const approved = await approveBimbinganDb(id_bimbingan);

  const tim = await getTimLengkapDb(detail.id_tim);

  return {
    error: false,
    message: "Bimbingan disetujui",
    data: {
      bimbingan: approved,
      tim,
    },
  };
};

const rejectBimbingan = async (id_dosen, id_bimbingan, catatan) => {
  const detail = await getDetailBimbinganDb(id_bimbingan, id_dosen);

  if (!detail) {
    return {
      error: true,
      message: "Bimbingan tidak ditemukan",
      data: null,
    };
  }

  if (detail.status !== 0) {
    return {
      error: true,
      message: "Bimbingan sudah direspon",
      data: detail,
    };
  }

  if (!catatan || catatan.trim() === "") {
    return {
      error: true,
      message: "Catatan wajib diisi saat menolak",
      data: null,
    };
  }

  const rejected = await rejectBimbinganDb(id_bimbingan, catatan);

  const tim = await getTimLengkapDb(detail.id_tim);

  return {
    error: false,
    message: "Bimbingan ditolak",
    data: {
      bimbingan: rejected,
      tim,
    },
  };
};

module.exports = {
  getBimbinganMasuk,
  getDetailBimbingan,
  approveBimbingan,
  rejectBimbingan,
};