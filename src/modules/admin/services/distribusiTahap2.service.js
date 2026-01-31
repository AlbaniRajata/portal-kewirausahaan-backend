const pool = require("../../../config/db");

const {
  getTahap2AktifDb,
  getProposalTahap2Db,
  getReviewerAktifDb,
  getJuriAktifDb,
  insertReviewerTahap2Db,
  insertJuriTahap2Db,
} = require("../db/distribusiTahap2.db");

const previewDistribusiTahap2 = async () => {
  const tahapAktif = await getTahap2AktifDb();
  if (!tahapAktif) {
    return {
      error: true,
      message: "Tahap 2 tidak aktif",
      data: null,
    };
  }

  const proposals = await getProposalTahap2Db();
  const reviewers = await getReviewerAktifDb();
  const juries = await getJuriAktifDb();

  if (!proposals.length) {
    return {
      error: true,
      message: "Tidak ada proposal lolos desk evaluasi",
      data: null,
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

  const totalProposal = proposals.length;
  const totalReviewer = reviewers.length;
  const totalJuri = juries.length;

  return {
    error: false,
    message: "Preview distribusi tahap 2 siap",
    data: {
      proposals: proposals.map((p) => ({
        id_proposal: p.id_proposal,
        judul: p.judul,
      })),
      total_proposal: totalProposal,
      total_reviewer: totalReviewer,
      total_juri: totalJuri,

      distribusi_reviewer: totalProposal * totalReviewer,
      distribusi_juri: totalProposal * totalJuri,
      distribusi_total:
        totalProposal * totalReviewer + totalProposal * totalJuri,
    },
  };
};

const autoDistribusiTahap2 = async (admin_id) => {
  const preview = await previewDistribusiTahap2();
  if (preview.error) return preview;

  const proposals = await getProposalTahap2Db();
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
          admin_id
        );
        if (dist) totalReviewer++;
      }

      for (const j of juries) {
        const dist = await insertJuriTahap2Db(
          client,
          p.id_proposal,
          j.id_user,
          admin_id
        );
        if (dist) totalJuri++;
      }
    }

    await client.query("COMMIT");

    return {
      error: false,
      message: "Distribusi tahap 2 berhasil",
      data: {
        total_proposal: proposals.length,
        total_reviewer: reviewers.length,
        total_juri: juries.length,

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

const manualDistribusiTahap2 = async (admin_id, payload) => {
  const { id_proposal, reviewers, juries } = payload;

  if (!id_proposal) {
    return {
      error: true,
      message: "id_proposal wajib diisi",
      data: payload,
    };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const hasilReviewer = [];
    const hasilJuri = [];

    if (Array.isArray(reviewers)) {
      for (const id_reviewer of reviewers) {
        const dist = await insertReviewerTahap2Db(
          client,
          id_proposal,
          id_reviewer,
          admin_id
        );
        if (dist) hasilReviewer.push(dist);
      }
    }

    if (Array.isArray(juries)) {
      for (const id_juri of juries) {
        const dist = await insertJuriTahap2Db(
          client,
          id_proposal,
          id_juri,
          admin_id
        );
        if (dist) hasilJuri.push(dist);
      }
    }

    await client.query("COMMIT");

    return {
      error: false,
      message: "Distribusi manual panel tahap 2 berhasil",
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

module.exports = {
  previewDistribusiTahap2,
  autoDistribusiTahap2,
  manualDistribusiTahap2,
};
