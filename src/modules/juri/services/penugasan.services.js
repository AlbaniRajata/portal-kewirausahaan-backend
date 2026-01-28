const {
  getPenugasanDb,
  getDetailPenugasanDb,
  updateStatusDistribusiDb,
} = require("../db/penugasan.db");

const getPenugasan = async (id_user) => {
  const data = await getPenugasanDb(id_user);
  return { error: false, data };
};

const getDetailPenugasan = async (id_user, id_distribusi) => {
  const data = await getDetailPenugasanDb(id_distribusi);

  if (!data || data.id_juri !== id_user) {
    return {
      error: true,
      message: "Penugasan tidak ditemukan",
      data: null,
    };
  }

  return { error: false, data };
};

const acceptPenugasan = async (id_user, id_distribusi) => {
  const dist = await getDetailPenugasanDb(id_distribusi);

  if (!dist || dist.id_juri !== id_user) {
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
  return { error: false, data: updated };
};

const rejectPenugasan = async (id_user, id_distribusi, catatan) => {
  const dist = await getDetailPenugasanDb(id_distribusi);

  if (!dist || dist.id_juri !== id_user) {
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
  return { error: false, data: updated };
};

module.exports = {
  getPenugasan,
  getDetailPenugasan,
  acceptPenugasan,
  rejectPenugasan,
};
