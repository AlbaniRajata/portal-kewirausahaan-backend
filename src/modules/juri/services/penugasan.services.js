const {
  getTahapAktifDb,
  getPenugasanDb,
  getDetailPenugasanDb,
  acceptDistribusiDb,
  rejectDistribusiDb,
} = require("../db/penugasan.db");

const URUTAN_JURI = 2;

const getPenugasan = async (id_user, status_filter) => {
  const data = await getPenugasanDb(id_user, URUTAN_JURI, status_filter);

  if (!data.length) {
    return {
      error: false,
      message: "Daftar penugasan juri kosong",
      data: { tahap: URUTAN_JURI, total: 0, penugasan: [] },
    };
  }

  const tahapAktif = await getTahapAktifDb(data[0].id_program, URUTAN_JURI);
  if (!tahapAktif) {
    return {
      error: true,
      message: "Tahap penilaian tidak aktif",
      data: { tahap: URUTAN_JURI, id_program: data[0].id_program },
    };
  }

  return {
    error: false,
    message: "Daftar penugasan juri berhasil diambil",
    data: { tahap: URUTAN_JURI, total: data.length, penugasan: data },
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
    message: "Detail penugasan juri berhasil diambil",
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

  const tahapAktif = await getTahapAktifDb(detail.id_program, URUTAN_JURI);
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

  const tahapAktif = await getTahapAktifDb(detail.id_program, URUTAN_JURI);
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