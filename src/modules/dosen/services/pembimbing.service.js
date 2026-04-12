const {
  getPengajuanMasukDb,
  getDetailPengajuanDb,
  getProposalByTimDb,
  getTimLengkapDb,
  approvePengajuanDb,
  rejectPengajuanDb,
} = require("../db/pembimbing.db");

const getPengajuanMasuk = async (id_dosen) => {
  const data = await getPengajuanMasukDb(id_dosen);
  return {
    error: false,
    message: "Daftar pengajuan pembimbing berhasil diambil",
    data,
  };
};

const getDetailPengajuan = async (id_dosen, id_pengajuan) => {
  if (!Number.isInteger(id_pengajuan) || id_pengajuan <= 0) {
    return { error: true, message: "ID pengajuan tidak valid", data: null };
  }

  const detail = await getDetailPengajuanDb(id_pengajuan, id_dosen);
  if (!detail) {
    return { error: true, message: "Pengajuan tidak ditemukan", data: null };
  }

  const [proposal, tim] = await Promise.all([
    getProposalByTimDb(detail.id_tim),
    getTimLengkapDb(detail.id_tim),
  ]);

  return {
    error: false,
    message: "Detail pengajuan berhasil diambil",
    data: { pengajuan: detail, proposal, tim },
  };
};

const approvePengajuan = async (id_dosen, id_pengajuan) => {
  if (!Number.isInteger(id_pengajuan) || id_pengajuan <= 0) {
    return { error: true, message: "ID pengajuan tidak valid", data: null };
  }

  const detail = await getDetailPengajuanDb(id_pengajuan, id_dosen);
  if (!detail) {
    return { error: true, message: "Pengajuan tidak ditemukan", data: null };
  }

  if (detail.status !== 0) {
    return { error: true, message: "Pengajuan sudah direspon sebelumnya", data: null };
  }

  const approved = await approvePengajuanDb(id_pengajuan);
  const [proposal, tim] = await Promise.all([
    getProposalByTimDb(detail.id_tim),
    getTimLengkapDb(detail.id_tim),
  ]);

  return {
    error: false,
    message: "Pengajuan pembimbing disetujui",
    data: {
      pengajuan: approved,
      proposal: proposal || null,
      tim,
    },
  };
};

const rejectPengajuan = async (id_dosen, id_pengajuan, catatan) => {
  if (!Number.isInteger(id_pengajuan) || id_pengajuan <= 0) {
    return { error: true, message: "ID pengajuan tidak valid", data: null };
  }

  if (!catatan || typeof catatan !== "string" || catatan.trim().length < 5) {
    return { error: true, message: "Catatan penolakan harus diisi minimal 5 karakter", data: null };
  }

  const detail = await getDetailPengajuanDb(id_pengajuan, id_dosen);
  if (!detail) {
    return { error: true, message: "Pengajuan tidak ditemukan", data: null };
  }

  if (detail.status !== 0) {
    return { error: true, message: "Pengajuan sudah direspon sebelumnya", data: null };
  }

  const rejected = await rejectPengajuanDb(id_pengajuan, catatan.trim());
  const [proposal, tim] = await Promise.all([
    getProposalByTimDb(detail.id_tim),
    getTimLengkapDb(detail.id_tim),
  ]);

  return {
    error: false,
    message: "Pengajuan pembimbing ditolak",
    data: {
      pengajuan: rejected,
      proposal: proposal || null,
      tim,
    },
  };
};

module.exports = {
  getPengajuanMasuk,
  getDetailPengajuan,
  approvePengajuan,
  rejectPengajuan,
};