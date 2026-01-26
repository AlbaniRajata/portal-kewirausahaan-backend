const pool = require("../../../config/db");
const {
  getReviewerAktifDb,
  getProposalSiapDistribusiDb,
  insertDistribusiDb,
  checkDistribusiExistsDb,
} = require("../db/distribusi.db");

const previewDistribusi = async (tahap) => {
  const proposals = await getProposalSiapDistribusiDb(tahap);
  const reviewers = await getReviewerAktifDb();

  if (!proposals.length || !reviewers.length) {
    return {
      error: true,
      message: "Proposal atau reviewer tidak tersedia",
      data: { proposals, reviewers },
    };
  }

  const totalProposal = proposals.length;
  const totalReviewer = reviewers.length;

  const base = Math.floor(totalProposal / totalReviewer);
  const sisa = totalProposal % totalReviewer;

  let cursor = 0;

  const rekomendasi = reviewers.map((r, idx) => {
    const jatah = base + (idx < sisa ? 1 : 0);
    const slice = proposals.slice(cursor, cursor + jatah);
    cursor += jatah;

    return {
      id_reviewer: r.id_user,
      nama_reviewer: r.nama_lengkap,
      proposals: slice,
    };
  });

  return {
    error: false,
    data: {
      tahap,
      total_proposal: totalProposal,
      total_reviewer: totalReviewer,
      base_per_reviewer: base,
      sisa,
      rekomendasi,
    },
  };
};

const autoDistribusi = async (admin_id, tahap) => {
  const preview = await previewDistribusi(tahap);
  if (preview.error) return preview;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let total = 0;
    const hasil = [];

    for (const r of preview.data.rekomendasi) {
      for (const p of r.proposals) {
        await insertDistribusiDb(client, [
          p.id_proposal,
          r.id_reviewer,
          tahap,
          admin_id,
        ]);
        total++;
      }

      hasil.push({
        id_reviewer: r.id_reviewer,
        nama_reviewer: r.nama_reviewer,
        total_proposal: r.proposals.length,
        proposals: r.proposals,
      });
    }

    await client.query("COMMIT");

    return {
      error: false,
      data: {
        tahap,
        total_distribusi: total,
        distribusi: hasil,
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

const manualDistribusi = async (admin_id, data) => {
  const { id_proposal, tahap, reviewers } = data;

  if (!id_proposal || !tahap || !reviewers?.length) {
    return {
      error: true,
      message: "Data tidak lengkap",
      data,
    };
  }

  const proposals = await getProposalSiapDistribusiDb(tahap);
  const proposal = proposals.find(p => p.id_proposal === id_proposal);

  if (!proposal) {
    return {
      error: true,
      message: "Proposal tidak valid atau sudah terdistribusi",
      data: { id_proposal, tahap },
    };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const inserted = [];

    for (const id_reviewer of reviewers) {
      const exists = await checkDistribusiExistsDb(
        id_proposal,
        id_reviewer,
        tahap
      );

      if (exists) {
        await client.query("ROLLBACK");
        return {
          error: true,
          message: "Reviewer sudah menerima proposal ini",
          data: { id_proposal, id_reviewer, tahap },
        };
      }

      await insertDistribusiDb(client, [
        id_proposal,
        id_reviewer,
        tahap,
        admin_id,
      ]);

      inserted.push(id_reviewer);
    }

    await client.query("COMMIT");

    return {
      error: false,
      data: {
        tahap,
        proposal,
        reviewer_ditambahkan: inserted,
      },
    };
  } catch (e) {
    await client.query("ROLLBACK");
    return {
      error: true,
      message: e.message,
      data,
    };
  } finally {
    client.release();
  }
};

module.exports = {
  previewDistribusi,
  autoDistribusi,
  manualDistribusi,
};
