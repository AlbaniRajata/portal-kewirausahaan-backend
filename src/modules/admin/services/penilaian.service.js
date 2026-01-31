const {
  getRekapReviewerTahap1Db,
  countDistribusiReviewerTahap1Db,
  countSubmittedReviewerTahap1Db,
  updateStatusProposalDb,
} = require("../db/penilaian.db");

const getRekapDeskEvaluasi = async (id_proposal) => {
  const rows = await getRekapReviewerTahap1Db(id_proposal);

  if (rows.length === 0) {
    return {
      error: true,
      message: "Belum ada penilaian reviewer yang disubmit",
      data: { id_proposal },
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
          id_user: r.id_reviewer,
          nama: r.nama_reviewer,
        },
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

  return {
    error: false,
    data: {
      proposal,
      reviewer: Object.values(reviewerMap),
    },
  };
};

const finalisasiDeskBatch = async (payload) => {
  const { lolos = [], tidak_lolos = [] } = payload;

  if (!Array.isArray(lolos) || !Array.isArray(tidak_lolos)) {
    return {
      error: true,
      message: "Payload batch tidak valid",
      data: payload,
    };
  }

  const hasil = [];

  for (const id_proposal of lolos) {
    const totalDistribusi = await countDistribusiReviewerTahap1Db(id_proposal);
    const totalSubmit = await countSubmittedReviewerTahap1Db(id_proposal);

    if (totalDistribusi === 0) {
      continue;
    }

    if (totalSubmit !== totalDistribusi) {
      continue;
    }

    const updated = await updateStatusProposalDb(id_proposal, 4);

    hasil.push({
      id_proposal,
      status: "LOLOS",
      updated,
    });
  }

  for (const id_proposal of tidak_lolos) {
    const totalDistribusi = await countDistribusiReviewerTahap1Db(id_proposal);
    const totalSubmit = await countSubmittedReviewerTahap1Db(id_proposal);

    if (totalDistribusi === 0) {
      continue;
    }

    if (totalSubmit !== totalDistribusi) {
      continue;
    }

    const updated = await updateStatusProposalDb(id_proposal, 3);

    hasil.push({
      id_proposal,
      status: "TIDAK LOLOS",
      updated,
    });
  }

  return {
    error: false,
    message: "Finalisasi desk evaluasi batch berhasil",
    data: hasil,
  };
};

module.exports = {
  getRekapDeskEvaluasi,
  finalisasiDeskBatch,
};
