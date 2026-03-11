const {
  getHistoryPenilaianTahap1Db,
  getHistoryPenilaianTahap2Db,
  getHistoryDetailTahap1Db,
  getHistoryDetailTahap2ReviewerDb,
  getHistoryDetailTahap2JuriDb,
} = require("../db/historyPenilaian.db");

const getHistoryPenilaianTahap1 = async (id_program) => {
  const data = await getHistoryPenilaianTahap1Db(id_program);
  return { error: false, message: "History penilaian tahap 1 berhasil diambil", data };
};

const getHistoryPenilaianTahap2 = async (id_program) => {
  const raw = await getHistoryPenilaianTahap2Db(id_program);

  const data = raw.map((row) => ({
    ...row,
    rata_rata_gabungan:
      Number(row.rata_rata_reviewer || 0) + Number(row.rata_rata_juri || 0),
  }));

  return { error: false, message: "History penilaian tahap 2 berhasil diambil", data };
};

const groupPenilaianHistory = (rows, roleKey, nameKey) => {
  const map = {};
  for (const r of rows) {
    if (!map[r[roleKey]]) {
      map[r[roleKey]] = {
        user: { id_user: r[roleKey], nama: r[nameKey] },
        submitted_at: r.submitted_at,
        detail: [],
        total_nilai: 0,
      };
    }
    map[r[roleKey]].detail.push({
      id_kriteria: r.id_kriteria,
      nama_kriteria: r.nama_kriteria,
      bobot: Number(r.bobot),
      skor: r.skor,
      nilai: Number(r.nilai),
      catatan: r.catatan,
    });
    map[r[roleKey]].total_nilai += Number(r.nilai);
  }
  return Object.values(map);
};

const getHistoryDetailTahap1 = async (id_program, id_proposal) => {
  const rows = await getHistoryDetailTahap1Db(id_program, id_proposal);

  if (!rows.length) {
    return {
      error: true,
      message: "Belum ada penilaian reviewer untuk proposal ini",
      data: null,
    };
  }

  const proposal = { id_proposal: rows[0].id_proposal, judul: rows[0].judul };
  const reviewerMap = {};

  for (const r of rows) {
    if (!reviewerMap[r.id_reviewer]) {
      reviewerMap[r.id_reviewer] = {
        reviewer: { id_user: r.id_reviewer, nama: r.nama_reviewer },
        submitted_at: r.submitted_at,
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

  const reviewerList = Object.values(reviewerMap);
  const rata_rata =
    reviewerList.length > 0
      ? Math.round(
          (reviewerList.reduce((s, r) => s + r.total_nilai, 0) / reviewerList.length) * 100
        ) / 100
      : 0;

  return {
    error: false,
    message: "Detail history penilaian tahap 1 berhasil diambil",
    data: { proposal, reviewer: reviewerList, rata_rata_nilai: rata_rata },
  };
};

const getHistoryDetailTahap2 = async (id_program, id_proposal) => {
  const [reviewerRows, juriRows] = await Promise.all([
    getHistoryDetailTahap2ReviewerDb(id_program, id_proposal),
    getHistoryDetailTahap2JuriDb(id_program, id_proposal),
  ]);

  if (!reviewerRows.length && !juriRows.length) {
    return {
      error: true,
      message: "Belum ada penilaian panel untuk proposal ini",
      data: null,
    };
  }

  const proposal = {
    id_proposal: reviewerRows[0]?.id_proposal || juriRows[0]?.id_proposal,
    judul: reviewerRows[0]?.judul || juriRows[0]?.judul,
  };

  const reviewer_panel = groupPenilaianHistory(reviewerRows, "id_reviewer", "nama_reviewer");
  const juri_panel = groupPenilaianHistory(juriRows, "id_juri", "nama_juri");

  const total_reviewer = reviewer_panel.reduce((s, r) => s + r.total_nilai, 0);
  const total_juri = juri_panel.reduce((s, j) => s + j.total_nilai, 0);

  return {
    error: false,
    message: "Detail history penilaian tahap 2 berhasil diambil",
    data: {
      proposal,
      reviewer_panel,
      juri_panel,
      total_reviewer,
      total_juri,
      total_gabungan: total_reviewer + total_juri,
    },
  };
};

module.exports = {
  getHistoryPenilaianTahap1,
  getHistoryPenilaianTahap2,
  getHistoryDetailTahap1,
  getHistoryDetailTahap2,
};