const {
  getBimbinganMasukDb,
  getDetailBimbinganDb,
  getTimLengkapDb,
  getProposalByTimDb,
  approveBimbinganDb,
  rejectBimbinganDb,
} = require("../db/bimbingan.db");

const getBimbinganMasuk = async (id_dosen) => {
  const data = await getBimbinganMasukDb(id_dosen);
  return {
    error: false,
    message: "Daftar pengajuan bimbingan berhasil diambil",
    data,
  };
};

const getDetailBimbingan = async (id_dosen, id_bimbingan) => {
  if (!Number.isInteger(id_bimbingan) || id_bimbingan <= 0) {
    return { error: true, message: "ID bimbingan tidak valid", data: null };
  }

  const detail = await getDetailBimbinganDb(id_bimbingan, id_dosen);
  if (!detail) {
    return { error: true, message: "Bimbingan tidak ditemukan", data: null };
  }

  const [proposal, tim] = await Promise.all([
    getProposalByTimDb(detail.id_tim),
    getTimLengkapDb(detail.id_tim),
  ]);

  return {
    error: false,
    message: "Detail bimbingan berhasil diambil",
    data: { bimbingan: detail, proposal, tim },
  };
};

const approveBimbingan = async (id_dosen, id_bimbingan) => {
  if (!Number.isInteger(id_bimbingan) || id_bimbingan <= 0) {
    return { error: true, message: "ID bimbingan tidak valid", data: null };
  }

  const detail = await getDetailBimbinganDb(id_bimbingan, id_dosen);
  if (!detail) {
    return { error: true, message: "Bimbingan tidak ditemukan", data: null };
  }

  if (detail.status !== 0) {
    return { error: true, message: "Bimbingan sudah direspon sebelumnya", data: null };
  }

  const approved = await approveBimbinganDb(id_bimbingan);
  const tim = await getTimLengkapDb(detail.id_tim);

  return {
    error: false,
    message: "Bimbingan disetujui",
    data: { bimbingan: approved, tim },
  };
};

const rejectBimbingan = async (id_dosen, id_bimbingan, catatan) => {
  if (!Number.isInteger(id_bimbingan) || id_bimbingan <= 0) {
    return { error: true, message: "ID bimbingan tidak valid", data: null };
  }

  if (!catatan || typeof catatan !== "string" || catatan.trim().length < 5) {
    return { error: true, message: "Catatan penolakan harus diisi minimal 5 karakter", data: null };
  }

  const detail = await getDetailBimbinganDb(id_bimbingan, id_dosen);
  if (!detail) {
    return { error: true, message: "Bimbingan tidak ditemukan", data: null };
  }

  if (detail.status !== 0) {
    return { error: true, message: "Bimbingan sudah direspon sebelumnya", data: null };
  }

  const rejected = await rejectBimbinganDb(id_bimbingan, catatan.trim());
  const tim = await getTimLengkapDb(detail.id_tim);

  return {
    error: false,
    message: "Bimbingan ditolak",
    data: { bimbingan: rejected, tim },
  };
};

module.exports = {
  getBimbinganMasuk,
  getDetailBimbingan,
  approveBimbingan,
  rejectBimbingan,
};