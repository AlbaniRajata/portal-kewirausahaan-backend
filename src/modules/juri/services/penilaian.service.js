const {
  getDistribusiForPenilaianDb,
  getKriteriaByTahapDb,
  getOrCreatePenilaianDb,
  getDetailNilaiDb,
  upsertNilaiDb,
  submitPenilaianDb,
} = require("../db/penilaian.db");

const VALID_SKOR = [1, 2, 3, 5, 6, 7];

const getFormPenilaian = async (id_user, id_distribusi) => {
  const dist = await getDistribusiForPenilaianDb(id_distribusi);

  if (!dist)
    return {
      error: true,
      message: "Distribusi tidak ditemukan",
      data: null,
    };

  if (dist.id_juri !== id_user)
    return {
      error: true,
      message: "Akses ditolak",
      data: null,
    };

  if (dist.status !== 1)
    return {
      error: true,
      message: "Penugasan belum diterima",
      data: null,
    };

  const penilaian = await getOrCreatePenilaianDb(
    dist.id_distribusi,
    dist.id_tahap
  );

  const kriteria = await getKriteriaByTahapDb(dist.id_tahap);
  const nilai = await getDetailNilaiDb(penilaian.id_penilaian);

  return {
    error: false,
    data: {
      proposal: {
        id_proposal: dist.id_proposal,
        judul: dist.judul,
      },
      penilaian,
      kriteria,
      nilai,
      skala_skor: VALID_SKOR,
    },
  };
};

const simpanNilai = async (id_user, id_distribusi, payload) => {
  if (!Array.isArray(payload) || payload.length === 0)
    return {
      error: true,
      message: "Payload nilai kosong",
      data: null,
    };

  const dist = await getDistribusiForPenilaianDb(id_distribusi);

  if (!dist || dist.id_juri !== id_user)
    return {
      error: true,
      message: "Akses ditolak",
      data: null,
    };

  const penilaian = await getOrCreatePenilaianDb(
    dist.id_distribusi,
    dist.id_tahap
  );

  if (penilaian.status === 1)
    return {
      error: true,
      message: "Penilaian sudah disubmit",
      data: null,
    };

  const kriteria = await getKriteriaByTahapDb(dist.id_tahap);
  const hasil = [];

  for (const item of payload) {
    const ref = kriteria.find(
      (k) => k.id_kriteria === item.id_kriteria
    );

    if (!ref)
      return {
        error: true,
        message: "Kriteria tidak valid",
        data: item,
      };

    if (!VALID_SKOR.includes(item.skor))
      return {
        error: true,
        message: "Skor tidak valid",
        data: item.skor,
      };

    const nilai = ref.bobot * item.skor;

    const saved = await upsertNilaiDb(
      penilaian.id_penilaian,
      ref.id_kriteria,
      item.skor,
      nilai,
      item.catatan || null
    );

    hasil.push(saved);
  }

  return {
    error: false,
    message: "Nilai berhasil disimpan",
    data: hasil,
  };
};

const submitPenilaian = async (id_user, id_distribusi) => {
  const dist = await getDistribusiForPenilaianDb(id_distribusi);

  if (!dist || dist.id_juri !== id_user)
    return {
      error: true,
      message: "Akses ditolak",
      data: null,
    };

  const penilaian = await getOrCreatePenilaianDb(
    dist.id_distribusi,
    dist.id_tahap
  );

  const nilai = await getDetailNilaiDb(penilaian.id_penilaian);
  const kriteria = await getKriteriaByTahapDb(dist.id_tahap);

  if (nilai.length !== kriteria.length)
    return {
      error: true,
      message: "Nilai belum lengkap",
      data: null,
    };

  const submitted = await submitPenilaianDb(penilaian.id_penilaian);

  return {
    error: false,
    data: submitted,
  };
};

module.exports = {
  getFormPenilaian,
  simpanNilai,
  submitPenilaian,
};
