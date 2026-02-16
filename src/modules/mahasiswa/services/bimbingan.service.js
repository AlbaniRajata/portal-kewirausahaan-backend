const {
  getPesertaAktifDb,
  getProposalLolosDb,
  getPembimbingTimDb,
  getBimbinganPendingDb,
  listBimbinganTimDb,
  getDetailBimbinganDb,
  createBimbinganDb,
} = require("../db/bimbingan.db");

const listBimbingan = async (id_user) => {
  const peserta = await getPesertaAktifDb(id_user);

  if (!peserta) {
    return {
      error: true,
      message: "Anda belum terdaftar sebagai peserta program",
      data: null,
    };
  }

  const bimbingan = await listBimbinganTimDb(peserta.id_tim);

  return {
    error: false,
    message: "Daftar bimbingan berhasil diambil",
    data: bimbingan,
  };
};

const detailBimbingan = async (id_user, id_bimbingan) => {
  const peserta = await getPesertaAktifDb(id_user);

  if (!peserta) {
    return {
      error: true,
      message: "Anda belum terdaftar sebagai peserta program",
      data: null,
    };
  }

  const bimbingan = await getDetailBimbinganDb(id_bimbingan, peserta.id_tim);

  if (!bimbingan) {
    return {
      error: true,
      message: "Data bimbingan tidak ditemukan",
      data: null,
    };
  }

  return {
    error: false,
    message: "Detail bimbingan berhasil diambil",
    data: bimbingan,
  };
};

const ajukanBimbingan = async (id_user, payload) => {
  const { tanggal_bimbingan, metode, topik, deskripsi } = payload;

  if (!tanggal_bimbingan || !metode || !topik) {
    return {
      error: true,
      message: "tanggal_bimbingan, metode, dan topik wajib diisi",
      data: null,
    };
  }

  const peserta = await getPesertaAktifDb(id_user);

  if (!peserta) {
    return {
      error: true,
      message: "Anda belum terdaftar sebagai peserta program",
      data: null,
    };
  }

  const proposal = await getProposalLolosDb(peserta.id_tim);

  if (!proposal) {
    return {
      error: true,
      message: "Proposal belum disetujui pembimbingnya",
      data: null,
    };
  }

  const pembimbing = await getPembimbingTimDb(peserta.id_tim);

  if (!pembimbing) {
    return {
      error: true,
      message: "Tim belum memiliki pembimbing yang disetujui",
      data: null,
    };
  }

  const pendingBimbingan = await getBimbinganPendingDb(peserta.id_tim);

  if (pendingBimbingan) {
    return {
      error: true,
      message: "Masih ada pengajuan bimbingan yang belum direspon dosen",
      data: null,
    };
  }

  const bimbingan = await createBimbinganDb({
    id_tim: peserta.id_tim,
    id_proposal: proposal.id_proposal,
    id_dosen: pembimbing.id_dosen,
    diajukan_oleh: id_user,
    tanggal_bimbingan,
    metode,
    topik,
    deskripsi: deskripsi || null,
  });

  return {
    error: false,
    message: "Pengajuan bimbingan berhasil dikirim",
    data: bimbingan,
  };
};

module.exports = {
  listBimbingan,
  detailBimbingan,
  ajukanBimbingan,
};