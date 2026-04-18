const {
  getTahapAktifDb,
  getPenugasanDb, getPenugasanCountDb,
  getDetailPenugasanDb,
  acceptDistribusiDb,
  rejectDistribusiDb,
} = require("../db/penugasan.db");
const { parsePaginationParams } = require("../../../utils/pagination");

const getPenugasan = async (id_user, urutan, status_filter, page, limit) => {
  const data = await getPenugasanDb(id_user, urutan, status_filter, page, limit);
  const total = await getPenugasanCountDb(id_user, urutan, status_filter);

  if (!data.length) {
    return {
      error: false,
      message: "Daftar penugasan reviewer kosong",
      data: { tahap: urutan, total: 0, penugasan: [] },
      pagination: { page: page || 1, limit: limit || 10, total, total_pages: 0, has_next: false, has_prev: false }
    };
  }

  const id_program = data[0].id_program;
  const tahapAktif = await getTahapAktifDb(id_program, urutan);

  if (!tahapAktif) {
    return {
      error: true,
      message: "Tahap penilaian tidak aktif",
      data: { tahap: urutan, id_program },
    };
  }

  const totalPages = Math.ceil(total / (limit || 10));
  return {
    error: false,
    message: "Daftar penugasan reviewer berhasil diambil",
    data: { tahap: urutan, total: data.length, penugasan: data },
    pagination: { page: page || 1, limit: limit || 10, total, total_pages: totalPages, has_next: page < totalPages, has_prev: page > 1 }
  };
};

const getDetailPenugasan = async (id_user, id_distribusi) => {
  if (!Number.isInteger(id_distribusi) || id_distribusi <= 0) {
    return { error: true, message: "ID distribusi tidak valid", data: null };
  }

  const detail = await getDetailPenugasanDb(id_distribusi, id_user);
  if (!detail) {
    return { error: true, message: "Penugasan tidak ditemukan", data: null };
  }

  return {
    error: false,
    message: "Detail penugasan berhasil diambil",
    data: detail,
  };
};

const acceptPenugasan = async (id_user, id_distribusi) => {
  if (!Number.isInteger(id_distribusi) || id_distribusi <= 0) {
    return { error: true, message: "ID distribusi tidak valid", data: null };
  }

  const detail = await getDetailPenugasanDb(id_distribusi, id_user);
  if (!detail) {
    return { error: true, message: "Penugasan tidak ditemukan", data: null };
  }

  if (detail.status !== 0) {
    return { error: true, message: "Penugasan sudah direspon sebelumnya", data: null };
  }

  const tahapAktif = await getTahapAktifDb(detail.id_program, detail.urutan_tahap);
  if (!tahapAktif) {
    return { error: true, message: "Tahap penilaian sudah ditutup", data: null };
  }

  const updated = await acceptDistribusiDb(id_distribusi, id_user);
  if (!updated) {
    return { error: true, message: "Penugasan gagal diterima", data: null };
  }

  return {
    error: false,
    message: "Penugasan berhasil diterima",
    data: updated,
  };
};

const rejectPenugasan = async (id_user, id_distribusi, catatan) => {
  if (!Number.isInteger(id_distribusi) || id_distribusi <= 0) {
    return { error: true, message: "ID distribusi tidak valid", data: null };
  }

  if (!catatan || typeof catatan !== "string" || catatan.trim().length < 5) {
    return { error: true, message: "Catatan penolakan wajib diisi minimal 5 karakter", data: null };
  }

  const detail = await getDetailPenugasanDb(id_distribusi, id_user);
  if (!detail) {
    return { error: true, message: "Penugasan tidak ditemukan", data: null };
  }

  if (detail.status !== 0) {
    return { error: true, message: "Penugasan sudah direspon sebelumnya", data: null };
  }

  const tahapAktif = await getTahapAktifDb(detail.id_program, detail.urutan_tahap);
  if (!tahapAktif) {
    return { error: true, message: "Tahap penilaian sudah ditutup", data: null };
  }

  const updated = await rejectDistribusiDb(id_distribusi, id_user, catatan.trim());
  if (!updated) {
    return { error: true, message: "Penugasan gagal ditolak", data: null };
  }

  return {
    error: false,
    message: "Penugasan berhasil ditolak",
    data: updated,
  };
};

module.exports = {
  getPenugasan,
  getDetailPenugasan,
  acceptPenugasan,
  rejectPenugasan,
};