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
  getJuriListDb,
} = require("../db/distribusiTahap2.db");

const previewDistribusiTahap2 = async (id_program) => {
  const tahapAktif = await getTahap2AktifDb(id_program);

  if (!tahapAktif) {
    return {
      error: true,
      message: "Tahap wawancara (Tahap 2) tidak aktif",
      data: { id_program },
    };
  }

  const id_tahap = tahapAktif.id_tahap;

  const proposals = await getProposalTahap2Db(id_program);
  const reviewers = await getReviewerAktifDb();
  const juries = await getJuriAktifDb();

  if (!proposals.length) {
    return {
      error: true,
      message: "Tidak ada proposal siap masuk panel wawancara",
      data: { id_program },
    };
  }

  if (!reviewers.length) {
    return {
      error: true,
      message: "Reviewer aktif tidak tersedia",
      data: null,
    };
  }

  if (!juries.length) {
    return {
      error: true,
      message: "Juri aktif tidak tersedia",
      data: null,
    };
  }

  return {
    error: false,
    message: "Preview distribusi panel wawancara siap",
    data: {
      id_program,
      id_tahap,
      total_proposal: proposals.length,
      total_reviewer: reviewers.length,
      total_juri: juries.length,

      distribusi_reviewer: proposals.length * reviewers.length,
      distribusi_juri: proposals.length * juries.length,
      distribusi_total:
        proposals.length * reviewers.length +
        proposals.length * juries.length,

      proposals,
    },
  };
};

const autoDistribusiTahap2 = async (admin_id, id_program) => {
  const preview = await previewDistribusiTahap2(id_program);
  if (preview.error) return preview;

  const { id_tahap } = preview.data;

  const proposals = await getProposalTahap2Db(id_program);
  const reviewers = await getReviewerAktifDb();
  const juries = await getJuriAktifDb();

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let totalReviewer = 0;
    let totalJuri = 0;

    for (const p of proposals) {
      for (const r of reviewers) {
        const dist = await insertReviewerTahap2Db(
          client,
          p.id_proposal,
          r.id_user,
          id_tahap,
          admin_id
        );

        if (dist) totalReviewer++;
      }

      for (const j of juries) {
        const dist = await insertJuriTahap2Db(
          client,
          p.id_proposal,
          j.id_user,
          id_tahap,
          admin_id
        );

        if (dist) totalJuri++;
      }

      await updateProposalStatusPanelDb(
        client,
        id_program,
        p.id_proposal
      );
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
  } catch (e) {
    await client.query("ROLLBACK");

    return {
      error: true,
      message: e.message,
      data: null,
    };
  } finally {
    client.release();
  }
};

const manualDistribusiTahap2 = async (admin_id, id_program, payload) => {
  const { id_proposal, reviewers = [], juries = [] } = payload;

  if (!id_proposal) {
    return {
      error: true,
      message: "id_proposal wajib diisi",
      data: payload,
    };
  }

  const tahapAktif = await getTahap2AktifDb(id_program);

  if (!tahapAktif) {
    return {
      error: true,
      message: "Tahap wawancara tidak aktif",
      data: { id_program },
    };
  }

  const id_tahap = tahapAktif.id_tahap;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const hasilReviewer = [];
    const hasilJuri = [];

    for (const id_reviewer of reviewers) {
      const dist = await insertReviewerTahap2Db(
        client,
        id_proposal,
        id_reviewer,
        id_tahap,
        admin_id
      );

      if (dist) hasilReviewer.push(dist);
    }

    for (const id_juri of juries) {
      const dist = await insertJuriTahap2Db(
        client,
        id_proposal,
        id_juri,
        id_tahap,
        admin_id
      );

      if (dist) hasilJuri.push(dist);
    }

    await updateProposalStatusPanelDb(
      client,
      id_program,
      id_proposal
    );

    await client.query("COMMIT");

    return {
      error: false,
      message: "Distribusi manual panel wawancara berhasil",
      data: {
        reviewer: hasilReviewer,
        juri: hasilJuri,
      },
    };
  } catch (e) {
    await client.query("ROLLBACK");

    return {
      error: true,
      message: e.message,
      data: payload,
    };
  } finally {
    client.release();
  }
};

const getDistribusiReviewerHistoryTahap2 = async (id_program) => {
  try {
    const history = await getDistribusiReviewerHistoryTahap2Db(id_program);
    
    return {
      error: false,
      message: "History distribusi reviewer tahap 2 berhasil dimuat",
      data: history,
    };
  } catch (e) {
    return {
      error: true,
      message: e.message,
      data: [],
    };
  }
};

const getDistribusiJuriHistoryTahap2 = async (id_program) => {
  try {
    const history = await getDistribusiJuriHistoryTahap2Db(id_program);
    
    return {
      error: false,
      message: "History distribusi juri tahap 2 berhasil dimuat",
      data: history,
    };
  } catch (e) {
    return {
      error: true,
      message: e.message,
      data: [],
    };
  }
};

const getJuriList = async () => {
  try {
    const juries = await getJuriListDb();
    
    return {
      error: false,
      message: "Daftar juri berhasil dimuat",
      data: juries,
    };
  } catch (e) {
    return {
      error: true,
      message: e.message,
      data: [],
    };
  }
};

module.exports = {
  previewDistribusiTahap2,
  autoDistribusiTahap2,
  manualDistribusiTahap2,
  getDistribusiReviewerHistoryTahap2,
  getDistribusiJuriHistoryTahap2,
};