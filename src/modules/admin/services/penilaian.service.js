const {
  getSubmittedPenilaianDb,
  hitungNilaiAkhirDb,
  getRekapDb,
  insertRekapDb,
  updateStatusProposalDb,
} = require("../db/penilaian.db");

const getRekapPenilaian = async (id_proposal, id_tahap) => {
  const rows = await getRekapDb(id_proposal, id_tahap);

  if (rows.length === 0)
    return {
      error: true,
      message: "Belum ada penilaian yang disubmit",
      data: null,
    };

  const proposal = {
    id_proposal: rows[0].id_proposal,
    judul: rows[0].judul,
    deskripsi: rows[0].deskripsi,
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
        penilaian: [],
        total_nilai: 0,
      };
    }

    reviewerMap[r.id_reviewer].penilaian.push({
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
    reviewers.reduce((acc, r) => acc + r.total_nilai, 0) /
    reviewers.length;

  return {
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

const finalizePenilaian = async (
  id_admin,
  id_proposal,
  id_tahap,
  passing_grade,
  status_lolos,
  status_gagal
) => {
  if (!id_admin || !id_proposal || !id_tahap)
    return {
      error: true,
      message: "Parameter wajib tidak lengkap",
      data: null,
    };

  const existing = await getRekapDb(id_proposal, id_tahap);
  if (existing)
    return {
      error: true,
      message: "Penilaian sudah difinalisasi",
      data: existing,
    };

  const penilaian = await getSubmittedPenilaianDb(id_proposal, id_tahap);
  if (penilaian.length === 0)
    return {
      error: true,
      message: "Tidak ada penilaian yang bisa difinalisasi",
      data: null,
    };

  let total = 0;
  for (const p of penilaian) {
    total += await hitungNilaiAkhirDb(p.id_penilaian);
  }

  const nilai_akhir = total / penilaian.length;
  const lolos = nilai_akhir >= passing_grade ? 1 : 0;

  const rekap = await insertRekapDb(
    id_proposal,
    id_tahap,
    nilai_akhir,
    lolos,
    id_admin
  );

  await updateStatusProposalDb(
    id_proposal,
    lolos ? status_lolos : status_gagal
  );

  return {
    message: "Penilaian berhasil difinalisasi",
    data: rekap,
  };
};

module.exports = {
  getRekapPenilaian,
  finalizePenilaian,
};
