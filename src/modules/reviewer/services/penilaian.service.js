const {
  getDistribusiForPenilaianDb,
  getKriteriaByTahapDb,
  getOrCreatePenilaianDb,
  getDetailNilaiDb,
  upsertNilaiDb,
  submitPenilaianDb,
  markDistribusiSubmittedDb,
} = require("../db/penilaian.db");

const VALID_SKOR = [1, 2, 3, 5, 6, 7];

const checkTimeline = (mulai, selesai) => {
  const now = new Date();
  if (!mulai || !selesai) return true;
  return now >= new Date(mulai) && now <= new Date(selesai);
};

const ensureNoDuplicateKriteria = (payload) => {
  const seen = new Set();
  for (const item of payload) {
    if (seen.has(item.id_kriteria)) return false;
    seen.add(item.id_kriteria);
  }
  return true;
};

const validateProposalStatus = (dist) => {
  if (dist.urutan_tahap === 1 && dist.status_proposal !== 2) {
    return {
      error: true,
      message: "Proposal belum masuk tahap desk evaluasi",
      data: { status_proposal: dist.status_proposal },
    };
  }

  if (dist.urutan_tahap === 2 && dist.status_proposal !== 6) {
    return {
      error: true,
      message: "Proposal belum masuk panel wawancara tahap 2",
      data: { status_proposal: dist.status_proposal },
    };
  }

  return null;
};

const getFormPenilaian = async (id_user, id_distribusi) => {
  const dist = await getDistribusiForPenilaianDb(id_distribusi);

  if (!dist)
    return {
      error: true,
      message: "Distribusi tidak ditemukan",
      data: { id_distribusi },
    };

  if (dist.id_reviewer !== id_user)
    return {
      error: true,
      message: "Akses ditolak",
      data: null,
    };

  if (![1, 3].includes(dist.status_distribusi))
    return {
      error: true,
      message: "Penugasan belum diterima",
      data: { status: dist.status_distribusi },
    };

  const statusCheck = validateProposalStatus(dist);
  if (statusCheck) return statusCheck;

  if (!checkTimeline(dist.penilaian_mulai, dist.penilaian_selesai))
    return {
      error: true,
      message: "Penilaian belum dibuka atau sudah ditutup",
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
      tahap: dist.urutan_tahap,
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

  if (!ensureNoDuplicateKriteria(payload))
    return {
      error: true,
      message: "Payload mengandung kriteria duplikat",
      data: null,
    };

  const dist = await getDistribusiForPenilaianDb(id_distribusi);

  if (!dist || dist.id_reviewer !== id_user)
    return {
      error: true,
      message: "Akses ditolak",
      data: null,
    };

  if (dist.status_distribusi !== 1)
    return {
      error: true,
      message: "Nilai hanya bisa disimpan sebelum submit",
      data: { status: dist.status_distribusi },
    };

  const statusCheck = validateProposalStatus(dist);
  if (statusCheck) return statusCheck;

  if (!checkTimeline(dist.penilaian_mulai, dist.penilaian_selesai))
    return {
      error: true,
      message: "Penilaian belum dibuka atau sudah ditutup",
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
      data: penilaian,
    };

  const kriteria = await getKriteriaByTahapDb(dist.id_tahap);

  const hasil = [];

  for (const item of payload) {
    const ref = kriteria.find((k) => k.id_kriteria === item.id_kriteria);

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
        data: { skor: item.skor },
      };

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

  return {
    error: false,
    message: "Nilai reviewer berhasil disimpan",
    data: hasil,
  };
};

const submitPenilaian = async (id_user, id_distribusi) => {
  const dist = await getDistribusiForPenilaianDb(id_distribusi);

  if (!dist || dist.id_reviewer !== id_user)
    return {
      error: true,
      message: "Akses ditolak",
      data: null,
    };

  if (dist.status_distribusi !== 1)
    return {
      error: true,
      message: "Penilaian sudah disubmit atau penugasan belum diterima",
      data: { status: dist.status_distribusi },
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
      data: {
        total_kriteria: kriteria.length,
        terisi: nilai.length,
      },
    };

  const submitted = await submitPenilaianDb(penilaian.id_penilaian);

  if (!submitted)
    return {
      error: true,
      message: "Submit gagal atau sudah disubmit",
      data: null,
    };

  await markDistribusiSubmittedDb(id_distribusi);

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
