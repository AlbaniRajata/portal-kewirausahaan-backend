const {
  getDistribusiForPenilaianDb,
  getKriteriaByTahapDb,
  getOrCreatePenilaianDb,
  getDetailNilaiDb,
  upsertNilaiDb,
  submitPenilaianDb,
  markDistribusiDraftDb,
  markDistribusiSubmittedDb,
  getPasanganReviewerByProposalDb,
  getOrCreatePenilaianReviewerDb,
  upsertNilaiReviewerDb,
  submitPenilaianReviewerDb,
  markDistribusiReviewerDraftDb,
  markDistribusiReviewerSubmittedDb,
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

const getAccessibleDist = async (id_distribusi, id_user) => {
  if (!Number.isInteger(id_distribusi) || id_distribusi <= 0) {
    return { err: { error: true, message: "ID distribusi tidak valid", data: null }, dist: null };
  }
  const dist = await getDistribusiForPenilaianDb(id_distribusi);
  if (!dist) {
    return { err: { error: true, message: "Distribusi tidak ditemukan", data: null }, dist: null };
  }
  if (dist.id_juri !== id_user) {
    return { err: { error: true, message: "Akses ditolak", data: null }, dist: null };
  }
  return { err: null, dist };
};

const getFormPenilaian = async (id_user, id_distribusi) => {
  const { err, dist } = await getAccessibleDist(id_distribusi, id_user);
  if (err) return err;

  if (![1, 3, 4].includes(dist.status_distribusi)) {
    return { error: true, message: "Penugasan belum diterima atau sudah tidak aktif", data: { status: dist.status_distribusi } };
  }

  if (dist.status_proposal !== 5) {
    return { error: true, message: "Proposal belum masuk panel wawancara", data: { status_proposal: dist.status_proposal } };
  }

  if (!isTimelineOpen(dist.penilaian_mulai, dist.penilaian_selesai)) {
    return { error: true, message: "Penilaian belum dibuka atau sudah ditutup", data: null };
  }

  const penilaian = await getOrCreatePenilaianDb(dist.id_distribusi, dist.id_tahap);
  const [kriteria, nilai] = await Promise.all([
    getKriteriaByTahapDb(dist.id_tahap),
    getDetailNilaiDb(penilaian.id_penilaian),
  ]);

  const pasangan = await getPasanganReviewerByProposalDb(dist.id_proposal, dist.urutan_tahap);
  const infoPasangan = pasangan
    ? { id_distribusi_reviewer: pasangan.id_distribusi, status: pasangan.status }
    : null;

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
      pasangan: infoPasangan,
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

  if (dist.status_proposal !== 5) {
    return { error: true, message: "Proposal belum masuk panel wawancara", data: { status_proposal: dist.status_proposal } };
  }

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
      return {
        error: true,
        message: `Skor tidak valid untuk kriteria ${ref.nama_kriteria}. Nilai yang diizinkan: ${VALID_SKOR.join(", ")}`,
        data: { id_kriteria: item.id_kriteria, skor: item.skor },
      };
    }
    const nilai = Number(ref.bobot) * Number(item.skor);
    const saved = await upsertNilaiDb(penilaian.id_penilaian, ref.id_kriteria, item.skor, nilai, item.catatan || null);
    hasil.push(saved);
  }

  await markDistribusiDraftDb(id_distribusi);

  const pasangan = await getPasanganReviewerByProposalDb(dist.id_proposal, dist.urutan_tahap);
  if (pasangan) {
    const penilaianReviewer = await getOrCreatePenilaianReviewerDb(pasangan.id_distribusi, dist.id_tahap);
    if (penilaianReviewer.status !== 1) {
      for (const item of payload) {
        const ref = kriteria.find((k) => k.id_kriteria === item.id_kriteria);
        if (!ref) continue;
        const nilai = Number(ref.bobot) * Number(item.skor);
        await upsertNilaiReviewerDb(penilaianReviewer.id_penilaian, ref.id_kriteria, item.skor, nilai, item.catatan || null);
      }
      await markDistribusiReviewerDraftDb(pasangan.id_distribusi);
    }
  }

  return {
    error: false,
    message: "Nilai berhasil disimpan dan disinkronkan ke pasangan",
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

  const pasangan = await getPasanganReviewerByProposalDb(dist.id_proposal, dist.urutan_tahap);
  if (pasangan) {
    const penilaianReviewer = await getOrCreatePenilaianReviewerDb(pasangan.id_distribusi, dist.id_tahap);
    if (penilaianReviewer.status !== 1) {
      await submitPenilaianReviewerDb(penilaianReviewer.id_penilaian);
      await markDistribusiReviewerSubmittedDb(pasangan.id_distribusi);
    }
  }

  return {
    error: false,
    message: "Penilaian berhasil disubmit dan disinkronkan ke pasangan",
    data: submitted,
  };
};

module.exports = { getFormPenilaian, simpanNilai, submitPenilaian };