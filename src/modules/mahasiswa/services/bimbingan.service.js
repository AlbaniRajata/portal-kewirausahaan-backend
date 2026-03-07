const {
  getPesertaAktifDb,
  getProposalLolosDb,
  getPembimbingTimDb,
  getBimbinganPendingDb,
  listBimbinganTimDb,
  getDetailBimbinganDb,
  createBimbinganDb,
} = require("../db/bimbingan.db");

const METODE_VALID = [1, 2, 3];

const listBimbingan = async (id_user) => {
  const peserta = await getPesertaAktifDb(id_user);
  if (!peserta) {
    return { error: true, message: "Anda belum terdaftar sebagai peserta program yang lolos", data: null };
  }

  const bimbingan = await listBimbinganTimDb(peserta.id_tim);

  return {
    error: false,
    message: "Daftar bimbingan berhasil diambil",
    data: { is_ketua: peserta.peran === 1, bimbingan },
  };
};

const detailBimbingan = async (id_user, id_bimbingan) => {
  const id = parseInt(id_bimbingan);
  if (isNaN(id) || id <= 0) {
    return { error: true, message: "ID bimbingan tidak valid", data: null };
  }

  const peserta = await getPesertaAktifDb(id_user);
  if (!peserta) {
    return { error: true, message: "Anda belum terdaftar sebagai peserta program yang lolos", data: null };
  }

  const bimbingan = await getDetailBimbinganDb(id, peserta.id_tim);
  if (!bimbingan) {
    return { error: true, message: "Data bimbingan tidak ditemukan", data: null };
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
      message: "Tanggal bimbingan, metode, dan topik wajib diisi",
      data: {
        missing_fields: [
          ...(!tanggal_bimbingan ? ["tanggal_bimbingan"] : []),
          ...(!metode ? ["metode"] : []),
          ...(!topik ? ["topik"] : []),
        ],
      },
    };
  }

  const metodeNum = parseInt(metode);
  if (!METODE_VALID.includes(metodeNum)) {
    return { error: true, message: "Metode bimbingan tidak valid", data: { field: "metode" } };
  }

  const tanggal = new Date(tanggal_bimbingan);
  if (isNaN(tanggal.getTime())) {
    return { error: true, message: "Format tanggal bimbingan tidak valid", data: { field: "tanggal_bimbingan" } };
  }

  if (tanggal <= new Date()) {
    return { error: true, message: "Tanggal bimbingan harus di masa mendatang", data: { field: "tanggal_bimbingan" } };
  }

  if (typeof topik !== "string" || topik.trim().length < 3) {
    return { error: true, message: "Topik bimbingan minimal 3 karakter", data: { field: "topik" } };
  }

  const peserta = await getPesertaAktifDb(id_user);
  if (!peserta) {
    return { error: true, message: "Anda belum terdaftar sebagai peserta program yang lolos", data: null };
  }

  const proposal = await getProposalLolosDb(peserta.id_tim);
  if (!proposal) {
    return { error: true, message: "Proposal belum berstatus disetujui pembimbing", data: null };
  }

  const pembimbing = await getPembimbingTimDb(peserta.id_tim);
  if (!pembimbing) {
    return { error: true, message: "Tim belum memiliki pembimbing yang disetujui", data: null };
  }

  const pending = await getBimbinganPendingDb(peserta.id_tim);
  if (pending) {
    return { error: true, message: "Masih ada pengajuan bimbingan yang belum direspon dosen", data: null };
  }

  const bimbingan = await createBimbinganDb({
    id_tim: peserta.id_tim,
    id_proposal: proposal.id_proposal,
    id_dosen: pembimbing.id_dosen,
    diajukan_oleh: id_user,
    tanggal_bimbingan,
    metode: metodeNum,
    topik: topik.trim(),
    deskripsi: deskripsi?.trim() || null,
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