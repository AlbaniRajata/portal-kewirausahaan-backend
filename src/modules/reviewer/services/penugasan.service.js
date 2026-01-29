const {
  getPenugasanDb,
  getDetailPenugasanDb,
  updateStatusDistribusiDb,
} = require("../db/penugasan.db");

const getPenugasan = async (id_user, tahap) => {
  const data = await getPenugasanDb(id_user, tahap);

  return {
    data,
  };
};

const getDetailPenugasan = async (id_user, id_distribusi) => {
  const data = await getDetailPenugasanDb(id_distribusi);

  if (!data || data.id_reviewer !== id_user) {
    return {
      error: true,
      message: "Penugasan tidak ditemukan",
      data: null,
    };
  }

  return {
    data,
  };
};

const acceptPenugasan = async (id_user, id_distribusi) => {
  const dist = await getDetailPenugasanDb(id_distribusi);

  if (!dist || dist.id_reviewer !== id_user) {
    return {
      error: true,
      message: "Anda tidak berhak mengakses penugasan ini",
      data: null,
    };
  }

  if (dist.status !== 0) {
    return {
      error: true,
      message: "Penugasan sudah direspon",
      data: dist,
    };
  }

  const updated = await updateStatusDistribusiDb(id_distribusi, 1, null);

  return {
    data: updated,
  };
};

const rejectPenugasan = async (id_user, id_distribusi, catatan) => {
  const dist = await getDetailPenugasanDb(id_distribusi);

  if (!dist || dist.id_reviewer !== id_user) {
    return {
      error: true,
      message: "Anda tidak berhak mengakses penugasan ini",
      data: null,
    };
  }

  if (dist.status !== 0) {
    return {
      error: true,
      message: "Penugasan sudah direspon",
      data: dist,
    };
  }

  const updated = await updateStatusDistribusiDb(id_distribusi, 2, catatan);

  return {
    data: updated,
  };
};

module.exports = {
  getPenugasan,
  getDetailPenugasan,
  acceptPenugasan,
  rejectPenugasan,
};
