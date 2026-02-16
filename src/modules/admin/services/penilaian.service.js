const pool = require("../../../config/db");

const {
  getRekapReviewerTahap1Db,
  countDistribusiReviewerTahap1Db,
  countSubmittedReviewerTahap1Db,
  updateStatusProposalTahap1Db,
  countDistribusiPanelTahap2Db,
  countSubmittedPanelTahap2Db,
  updateStatusProposalTahap2Db,
  getRekapReviewerTahap2Db,
  getRekapJuriTahap2Db,
  insertPesertaProgramByTimDb,
  getProposalTimDb,
  getListProposalRekapTahap1Db,
  getListProposalRekapTahap2Db,
} = require("../db/penilaian.db");

const getListProposalRekapTahap1 = async (id_program) => {
  const proposals = await getListProposalRekapTahap1Db(id_program);

  return {
    error: false,
    message: "List proposal rekap tahap 1",
    data: proposals,
  };
};

const getListProposalRekapTahap2 = async (id_program) => {
  const proposals = await getListProposalRekapTahap2Db(id_program);

  return {
    error: false,
    message: "List proposal rekap tahap 2",
    data: proposals,
  };
};

const getRekapDeskEvaluasi = async (id_program, id_proposal) => {
  const rows = await getRekapReviewerTahap1Db(id_program, id_proposal);

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

const finalisasiDeskBatch = async (id_program, payload) => {
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
    const totalDistribusi = await countDistribusiReviewerTahap1Db(id_program, id_proposal);
    const totalSubmit = await countSubmittedReviewerTahap1Db(id_program, id_proposal);

    if (totalDistribusi === 0) continue;
    if (totalSubmit !== totalDistribusi) continue;

    const updated = await updateStatusProposalTahap1Db(id_program, id_proposal, 4);

    hasil.push({
      id_proposal,
      status: "LOLOS",
      updated,
    });
  }

  for (const id_proposal of tidak_lolos) {
    const totalDistribusi = await countDistribusiReviewerTahap1Db(id_program, id_proposal);
    const totalSubmit = await countSubmittedReviewerTahap1Db(id_program, id_proposal);

    if (totalDistribusi === 0) continue;
    if (totalSubmit !== totalDistribusi) continue;

    const updated = await updateStatusProposalTahap1Db(id_program, id_proposal, 3);

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

const groupPenilaian = (rows, roleKey, nameKey) => {
  const map = {};

  for (const r of rows) {
    if (!map[r[roleKey]]) {
      map[r[roleKey]] = {
        user: {
          id_user: r[roleKey],
          nama: r[nameKey],
        },
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

const getRekapWawancaraTahap2 = async (id_program, id_proposal) => {
  const reviewerRows = await getRekapReviewerTahap2Db(id_program, id_proposal);
  const juriRows = await getRekapJuriTahap2Db(id_program, id_proposal);

  if (reviewerRows.length === 0 && juriRows.length === 0) {
    return {
      error: true,
      message: "Belum ada penilaian panel wawancara yang disubmit",
      data: { id_proposal },
    };
  }

  const proposal = {
    id_proposal: reviewerRows[0]?.id_proposal || juriRows[0]?.id_proposal,
    judul: reviewerRows[0]?.judul || juriRows[0]?.judul,
  };

  const reviewer = groupPenilaian(reviewerRows, "id_reviewer", "nama_reviewer");
  const juri = groupPenilaian(juriRows, "id_juri", "nama_juri");

  const totalReviewer = reviewer.reduce((sum, r) => sum + r.total_nilai, 0);
  const totalJuri = juri.reduce((sum, j) => sum + j.total_nilai, 0);

  return {
    error: false,
    data: {
      proposal,
      reviewer_panel: reviewer,
      juri_panel: juri,
      total_reviewer: totalReviewer,
      total_juri: totalJuri,
      total_gabungan: totalReviewer + totalJuri,
    },
  };
};

const finalisasiWawancaraBatch = async (id_program, payload) => {
  const { lolos = [], tidak_lolos = [] } = payload;

  if (!Array.isArray(lolos) || !Array.isArray(tidak_lolos)) {
    return {
      error: true,
      message: "Payload tidak valid",
      data: payload,
    };
  }

  const hasil = [];

  for (const id_proposal of lolos) {
    const totalDistribusi = await countDistribusiPanelTahap2Db(id_program, id_proposal);
    const totalSubmit = await countSubmittedPanelTahap2Db(id_program, id_proposal);

    if (totalDistribusi === 0) continue;
    if (totalSubmit !== totalDistribusi) continue;

    const proposalTim = await getProposalTimDb(id_program, id_proposal);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const updated = await updateStatusProposalTahap2Db(client, id_program, id_proposal, 7);

      if (proposalTim) {
        await insertPesertaProgramByTimDb(client, proposalTim.id_tim, id_program);
      }

      await client.query("COMMIT");

      hasil.push({
        id_proposal,
        status: "LOLOS WAWANCARA",
        updated,
      });
    } catch (e) {
      await client.query("ROLLBACK");
      hasil.push({
        id_proposal,
        status: "ERROR",
        error: e.message,
      });
    } finally {
      client.release();
    }
  }

  for (const id_proposal of tidak_lolos) {
    const totalDistribusi = await countDistribusiPanelTahap2Db(id_program, id_proposal);
    const totalSubmit = await countSubmittedPanelTahap2Db(id_program, id_proposal);

    if (totalDistribusi === 0) continue;
    if (totalSubmit !== totalDistribusi) continue;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const updated = await updateStatusProposalTahap2Db(client, id_program, id_proposal, 6);

      await client.query("COMMIT");

      hasil.push({
        id_proposal,
        status: "TIDAK LOLOS WAWANCARA",
        updated,
      });
    } catch (e) {
      await client.query("ROLLBACK");
      hasil.push({
        id_proposal,
        status: "ERROR",
        error: e.message,
      });
    } finally {
      client.release();
    }
  }

  return {
    error: false,
    message: "Finalisasi wawancara tahap 2 berhasil",
    data: hasil,
  };
};

module.exports = {
  getListProposalRekapTahap1,
  getListProposalRekapTahap2,
  getRekapDeskEvaluasi,
  finalisasiDeskBatch,
  getRekapWawancaraTahap2,
  finalisasiWawancaraBatch,
};