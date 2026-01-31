const {
  getTahapAktifDb,
  getPenugasanDb,
  getDetailPenugasanDb,
  acceptDistribusiDb,
  rejectDistribusiDb,
} = require("../db/penugasan.db");

const getPenugasan = async (id_user, tahap) => {
  const tahapAktif = await getTahapAktifDb(tahap);

  if (!tahapAktif) {
    return {
      error: true,
      message: "Tahap penilaian tidak aktif",
      data: { tahap },
    };
  }

  const data = await getPenugasanDb(id_user, tahap);

  return {
    error: false,
    message: "Daftar penugasan juri",
    data: {
      tahap,
      total: data.length,
      penugasan: data,
    },
  };
};

const getDetailPenugasan = async (id_user, id_distribusi) => {
  const data = await getDetailPenugasanDb(id_distribusi, id_user);

  if (!data) {
    return {
      error: true,
      message: "Penugasan tidak ditemukan",
      data: null,
    };
  }

  return {
    error: false,
    message: "Detail penugasan juri",
    data,
  };
};

const acceptPenugasan = async (id_user, id_distribusi) => {
  const detail = await getDetailPenugasanDb(id_distribusi, id_user);

  if (!detail) {
    return {
      error: true,
      message: "Penugasan tidak ditemukan",
      data: null,
    };
  }

  if (detail.status !== 0) {
    return {
      error: true,
      message: "Penugasan sudah direspon",
      data: detail,
    };
  }

  const tahapAktif = await getTahapAktifDb(detail.tahap);

  if (!tahapAktif) {
    return {
      error: true,
      message: "Tahap sudah ditutup",
      data: { tahap: detail.tahap },
    };
  }

  const updated = await acceptDistribusiDb(id_distribusi, id_user);

  return {
    error: false,
    message: "Penugasan berhasil diterima",
    data: updated,
  };
};

const rejectPenugasan = async (id_user, id_distribusi, catatan) => {
  const detail = await getDetailPenugasanDb(id_distribusi, id_user);

  if (!detail) {
    return {
      error: true,
      message: "Penugasan tidak ditemukan",
      data: null,
    };
  }

  if (detail.status !== 0) {
    return {
      error: true,
      message: "Penugasan sudah direspon",
      data: detail,
    };
  }

  const tahapAktif = await getTahapAktifDb(detail.tahap);

  if (!tahapAktif) {
    return {
      error: true,
      message: "Tahap sudah ditutup",
      data: { tahap: detail.tahap },
    };
  }

  const updated = await rejectDistribusiDb(
    id_distribusi,
    id_user,
    catatan
  );

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
