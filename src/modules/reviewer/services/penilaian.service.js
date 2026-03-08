const {
  getDistribusiForPenilaianDb,
  getKriteriaByTahapDb,
  getOrCreatePenilaianDb,
  getDetailNilaiDb,
  upsertNilaiDb,
  submitPenilaianDb,
  markDistribusiDraftDb,
  markDistribusiSubmittedDb,
} = require("../db/penilaian.db");

const VALID_SKOR = [1, 2, 3, 5, 6, 7];

const isTimelineOpen = (mulai, selesai) => {
  if (!mulai || !selesai) return true;
  const now = new Date();
  return now >= new Date(mulai) && now <= new Date(selesai);
};

const hasDuplicateKriteria = (payload) => {
  const seen = new Set();
  for (const item of payload) {
    if (seen.has(item.id_kriteria)) return true;
    seen.add(item.id_kriteria);
  }
  return false;
};

const validateProposalStatus = (dist) => {
  if (dist.urutan_tahap === 1 && dist.status_proposal !== 2) {
    return { error: true, message: "Proposal belum masuk tahap desk evaluasi", data: { status_proposal: dist.status_proposal } };
  }
  if (dist.urutan_tahap === 2 && dist.status_proposal !== 5) {
    return { error: true, message: "Proposal belum masuk panel wawancara", data: { status_proposal: dist.status_proposal } };
  }
  return null;
};

const getAccessibleDist = async (id_distribusi, id_user) => {
  if (!Number.isInteger(id_distribusi) || id_distribusi <= 0) {
    return { err: { error: true, message: "ID distribusi tidak valid", data: null }, dist: null };
  }
  const dist = await getDistribusiForPenilaianDb(id_distribusi);
  if (!dist) {
    return { err: { error: true, message: "Distribusi tidak ditemukan", data: null }, dist: null };
  }
  if (dist.id_reviewer !== id_user) {
    return { err: { error: true, message: "Akses ditolak", data: null }, dist: null };
  }
  return { err: null, dist };
};

const getFormPenilaian = async (id_user, id_distribusi) => {
  const { err, dist } = await getAccessibleDist(id_distribusi, id_user);
  if (err) return err;

  if (![1, 3].includes(dist.status_distribusi)) {
    return { error: true, message: "Penugasan belum diterima", data: { status: dist.status_distribusi } };
  }

  const statusCheck = validateProposalStatus(dist);
  if (statusCheck) return statusCheck;

  if (!isTimelineOpen(dist.penilaian_mulai, dist.penilaian_selesai)) {
    return { error: true, message: "Penilaian belum dibuka atau sudah ditutup", data: null };
  }

  const penilaian = await getOrCreatePenilaianDb(dist.id_distribusi, dist.id_tahap);

  const [kriteria, nilai] = await Promise.all([
    getKriteriaByTahapDb(dist.id_tahap),
    getDetailNilaiDb(penilaian.id_penilaian),
  ]);

  return {
    error: false,
    message: "Form penilaian berhasil diambil",
    data: {
      proposal: { id_proposal: dist.id_proposal, judul: dist.judul },
      tahap: dist.urutan_tahap,
      penilaian,
      kriteria,
      nilai,
      skala_skor: VALID_SKOR,
    },
  };
};

const simpanNilai = async (id_user, id_distribusi, payload) => {
  if (!Array.isArray(payload) || payload.length === 0) {
    return { error: true, message: "Payload nilai kosong", data: null };
  }

  if (hasDuplicateKriteria(payload)) {
    return { error: true, message: "Payload mengandung kriteria duplikat", data: null };
  }

  const { err, dist } = await getAccessibleDist(id_distribusi, id_user);
  if (err) return err;

  if (![1, 3].includes(dist.status_distribusi)) {
    return { error: true, message: "Nilai hanya bisa disimpan sebelum submit", data: { status: dist.status_distribusi } };
  }

  const statusCheck = validateProposalStatus(dist);
  if (statusCheck) return statusCheck;

  if (!isTimelineOpen(dist.penilaian_mulai, dist.penilaian_selesai)) {
    return { error: true, message: "Penilaian belum dibuka atau sudah ditutup", data: null };
  }

  const penilaian = await getOrCreatePenilaianDb(dist.id_distribusi, dist.id_tahap);

  if (penilaian.status === 1) {
    return { error: true, message: "Penilaian sudah disubmit", data: null };
  }

  const kriteria = await getKriteriaByTahapDb(dist.id_tahap);
  const hasil = [];

  for (const item of payload) {
    const ref = kriteria.find((k) => k.id_kriteria === item.id_kriteria);
    if (!ref) {
      return { error: true, message: "Kriteria tidak valid", data: { id_kriteria: item.id_kriteria } };
    }

    if (!VALID_SKOR.includes(Number(item.skor))) {
      return { error: true, message: `Skor tidak valid untuk kriteria ${ref.nama_kriteria}. Nilai yang diizinkan: ${VALID_SKOR.join(", ")}`, data: { id_kriteria: item.id_kriteria, skor: item.skor } };
    }

    const nilai = Number(ref.bobot) * Number(item.skor);
    const saved = await upsertNilaiDb(
      penilaian.id_penilaian,
      ref.id_kriteria,
      item.skor,
      nilai,
      item.catatan || null
    );
    hasil.push(saved);
  }

  await markDistribusiDraftDb(id_distribusi);

  return {
    error: false,
    message: "Nilai reviewer berhasil disimpan",
    data: hasil,
  };
};

const submitPenilaian = async (id_user, id_distribusi) => {
  const { err, dist } = await getAccessibleDist(id_distribusi, id_user);
  if (err) return err;

  if (![1, 3].includes(dist.status_distribusi)) {
    return { error: true, message: "Penilaian sudah disubmit atau penugasan belum diterima", data: { status: dist.status_distribusi } };
  }

  const penilaian = await getOrCreatePenilaianDb(dist.id_distribusi, dist.id_tahap);

  const [nilai, kriteria] = await Promise.all([
    getDetailNilaiDb(penilaian.id_penilaian),
    getKriteriaByTahapDb(dist.id_tahap),
  ]);

  if (nilai.length !== kriteria.length) {
    return {
      error: true,
      message: "Nilai belum lengkap, semua kriteria wajib diisi",
      data: { total_kriteria: kriteria.length, terisi: nilai.length },
    };
  }

  const submitted = await submitPenilaianDb(penilaian.id_penilaian);
  if (!submitted) {
    return { error: true, message: "Submit gagal atau penilaian sudah disubmit", data: null };
  }

  await markDistribusiSubmittedDb(id_distribusi);

  return {
    error: false,
    message: "Penilaian berhasil disubmit",
    data: submitted,
  };
};

module.exports = { 
  getFormPenilaian, 
  simpanNilai, 
  submitPenilaian 
};