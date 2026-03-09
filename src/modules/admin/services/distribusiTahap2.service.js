const pool = require("../../../config/db");

const {
  getTahap2AktifDb,
  getProposalTahap2Db,
  getReviewerAktifDb,
  getJuriAktifDb,
  insertReviewerTahap2Db,
  insertJuriTahap2Db,
  updateProposalStatusPanelDb,
  getDistribusiReviewerHistoryTahap2Db,
  getDistribusiJuriHistoryTahap2Db,
} = require("../db/distribusiTahap2.db");

const previewDistribusiTahap2 = async (id_program) => {
  const tahapAktif = await getTahap2AktifDb(id_program);
  if (!tahapAktif) {
    return { error: true, message: "Tahap 2 (Wawancara) belum dibuat/dijadwalkan atau sudah ditutup", data: { id_program } };
  }

  const [proposals, reviewers, juries] = await Promise.all([
    getProposalTahap2Db(id_program),
    getReviewerAktifDb(),
    getJuriAktifDb(),
  ]);

  if (!proposals.length) return { error: true, message: "Tidak ada proposal siap masuk panel wawancara (status harus Lolos Desk Evaluasi)", data: { id_program } };
  if (!reviewers.length) return { error: true, message: "Reviewer aktif tidak tersedia", data: null };
  if (!juries.length) return { error: true, message: "Juri aktif tidak tersedia", data: null };

  const distribusi_reviewer = proposals.length * reviewers.length;
  const distribusi_juri = proposals.length * juries.length;

  return {
    error: false,
    message: "Preview distribusi panel wawancara siap",
    data: {
      id_program,
      id_tahap: tahapAktif.id_tahap,
      total_proposal: proposals.length,
      total_reviewer: reviewers.length,
      total_juri: juries.length,
      distribusi_reviewer,
      distribusi_juri,
      distribusi_total: distribusi_reviewer + distribusi_juri,
      proposals,
    },
  };
};

const autoDistribusiTahap2 = async (admin_id, id_program) => {
  const preview = await previewDistribusiTahap2(id_program);
  if (preview.error) return preview;

  const { id_tahap } = preview.data;

  const [proposals, reviewers, juries] = await Promise.all([
    getProposalTahap2Db(id_program),
    getReviewerAktifDb(),
    getJuriAktifDb(),
  ]);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let totalReviewer = 0;
    let totalJuri = 0;

    for (const p of proposals) {
      for (const r of reviewers) {
        const dist = await insertReviewerTahap2Db(client, p.id_proposal, r.id_user, id_tahap, admin_id);
        if (dist) totalReviewer++;
      }
      for (const j of juries) {
        const dist = await insertJuriTahap2Db(client, p.id_proposal, j.id_user, id_tahap, admin_id);
        if (dist) totalJuri++;
      }
      await updateProposalStatusPanelDb(client, id_program, p.id_proposal);
    }

    await client.query("COMMIT");
    return {
      error: false,
      message: "Distribusi panel wawancara tahap 2 berhasil",
      data: {
        id_program,
        id_tahap,
        total_proposal: proposals.length,
        distribusi_reviewer: totalReviewer,
        distribusi_juri: totalJuri,
        distribusi_total: totalReviewer + totalJuri,
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const manualDistribusiTahap2 = async (admin_id, id_program, payload) => {
  const { id_proposal, reviewers = [], juries = [] } = payload;

  if (!id_proposal) return { error: true, message: "id_proposal wajib diisi", data: null };
  if (!reviewers.length && !juries.length) {
    return { error: true, message: "Minimal satu reviewer atau juri wajib diisi", data: null };
  }

  const tahapAktif = await getTahap2AktifDb(id_program);
  if (!tahapAktif) {
    return { error: true, message: "Tahap 2 (Wawancara) belum dibuat/dijadwalkan atau sudah ditutup", data: { id_program } };
  }

  const id_tahap = tahapAktif.id_tahap;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const hasilReviewer = [];
    const hasilJuri = [];

    for (const id_reviewer of reviewers) {
      const dist = await insertReviewerTahap2Db(client, id_proposal, id_reviewer, id_tahap, admin_id);
      if (dist) hasilReviewer.push(dist);
    }
    for (const id_juri of juries) {
      const dist = await insertJuriTahap2Db(client, id_proposal, id_juri, id_tahap, admin_id);
      if (dist) hasilJuri.push(dist);
    }

    await updateProposalStatusPanelDb(client, id_program, id_proposal);

    await client.query("COMMIT");
    return {
      error: false,
      message: "Distribusi manual panel wawancara berhasil",
      data: { reviewer: hasilReviewer, juri: hasilJuri },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getDistribusiReviewerHistoryTahap2 = async (id_program) => {
  const history = await getDistribusiReviewerHistoryTahap2Db(id_program);
  return { error: false, message: "History distribusi reviewer tahap 2 berhasil dimuat", data: history };
};

const getDistribusiJuriHistoryTahap2 = async (id_program) => {
  const history = await getDistribusiJuriHistoryTahap2Db(id_program);
  return { error: false, message: "History distribusi juri tahap 2 berhasil dimuat", data: history };
};

module.exports = {
  previewDistribusiTahap2,
  autoDistribusiTahap2,
  manualDistribusiTahap2,
  getDistribusiReviewerHistoryTahap2,
  getDistribusiJuriHistoryTahap2,
};