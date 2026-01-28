const { getRekapDb } = require("../db/penilaian.db");

const getRekapPenilaian = async (id_proposal, id_tahap) => {
  if (!id_proposal) {
    return {
      error: true,
      message: "Validasi gagal",
      data: { field: "id_proposal", reason: "id_proposal wajib diisi" },
    };
  }

  if (!id_tahap) {
    return {
      error: true,
      message: "Validasi gagal",
      data: { field: "id_tahap", reason: "id_tahap wajib diisi" },
    };
  }

  const rows = await getRekapDb(id_proposal, id_tahap);

  if (rows.length === 0) {
    return {
      error: true,
      message: "Belum ada penilaian yang disubmit",
      data: { id_proposal, id_tahap },
    };
  }

  const proposal = {
    id_proposal: rows[0].id_proposal,
    judul: rows[0].judul,
  };

  const reviewerMap = {};

  for (const r of rows) {
    if (!reviewerMap[r.id_reviewer]) {
      reviewerMap[r.id_reviewer] = {
        reviewer: {
          id_reviewer: r.id_reviewer,
          nama: r.nama_reviewer,
          email: r.email_reviewer,
        },
        detail: [],
        total_nilai: 0,
      };
    }

    reviewerMap[r.id_reviewer].detail.push({
      id_kriteria: r.id_kriteria,
      nama_kriteria: r.nama_kriteria,
      bobot: Number(r.bobot),
      skor: r.skor,
      nilai: Number(r.nilai),
      catatan: r.catatan,
    });

    reviewerMap[r.id_reviewer].total_nilai += Number(r.nilai);
  }

  const reviewers = Object.values(reviewerMap);

  const rata_rata =
    reviewers.reduce((acc, x) => acc + x.total_nilai, 0) / reviewers.length;

  return {
    message: "Rekap penilaian lengkap",
    data: {
      proposal,
      reviewers,
      ringkasan: {
        jumlah_reviewer: reviewers.length,
        nilai_rata_rata: Number(rata_rata.toFixed(2)),
      },
    },
  };
};

module.exports = {
  getRekapPenilaian,
};
