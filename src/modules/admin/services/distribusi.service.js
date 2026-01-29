const pool = require("../../../config/db");

const {
  getReviewerAktifDb,
  getJuriAktifDb,
  getProposalSiapDistribusiDb,
  insertDistribusiReviewerDb,
  insertDistribusiJuriDb,
  checkDistribusiReviewerExistsDb,
  checkDistribusiJuriExistsDb,
  updateStatusProposalDistribusiDb,
} = require("../db/distribusi.db");

const previewDistribusi = async (tahap) => {
  const proposals = await getProposalSiapDistribusiDb(tahap);
  const reviewers = await getReviewerAktifDb();
  const juris = tahap === 2 ? await getJuriAktifDb() : [];

  if (!proposals.length || !reviewers.length) {
    return {
      error: true,
      message: "Proposal atau reviewer tidak tersedia",
      data: { proposals, reviewers },
    };
  }

  if (tahap === 2 && !juris.length) {
    return {
      error: true,
      message: "Juri tidak tersedia untuk tahap wawancara",
      data: { juris },
    };
  }

  const totalProposal = proposals.length;
  const totalReviewer = reviewers.length;

  const base = Math.floor(totalProposal / totalReviewer);
  const sisa = totalProposal % totalReviewer;

  let cursor = 0;

  const rekomendasiReviewer = reviewers.map((r, idx) => {
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
    message: "Preview distribusi berhasil",
    data: {
      tahap,
      total_proposal: totalProposal,
      total_reviewer: totalReviewer,
      total_juri: juris.length,
      rekomendasi_reviewer: rekomendasiReviewer,
      juri_tersedia: juris,
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

    for (const r of preview.data.rekomendasi_reviewer) {
      for (const p of r.proposals) {
        await insertDistribusiReviewerDb(client, [
          p.id_proposal,
          r.id_reviewer,
          tahap,
          admin_id,
        ]);

        if (tahap === 2) {
          for (const j of preview.data.juri_tersedia) {
            await insertDistribusiJuriDb(client, [
              p.id_proposal,
              j.id_user,
              tahap,
              admin_id,
            ]);
          }
        }

        await updateStatusProposalDistribusiDb(client, p.id_proposal, tahap);

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
      message: "Distribusi otomatis berhasil",
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
      data: { tahap },
    };
  } finally {
    client.release();
  }
};

const manualDistribusi = async (admin_id, data) => {
  const { id_proposal, tahap, reviewers, juris } = data;

  if (!id_proposal || !tahap || !reviewers?.length) {
    return {
      error: true,
      message: "Data tidak lengkap",
      data,
    };
  }

  if (tahap === 2 && (!juris || !juris.length)) {
    return {
      error: true,
      message: "Tahap 2 wajib ada juri",
      data,
    };
  }

  const proposals = await getProposalSiapDistribusiDb(tahap);
  const proposal = proposals.find((p) => p.id_proposal === id_proposal);

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

    for (const id_reviewer of reviewers) {
      const exists = await checkDistribusiReviewerExistsDb(
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

      await insertDistribusiReviewerDb(client, [
        id_proposal,
        id_reviewer,
        tahap,
        admin_id,
      ]);
    }

    if (tahap === 2) {
      for (const id_juri of juris) {
        const exists = await checkDistribusiJuriExistsDb(
          id_proposal,
          id_juri,
          tahap
        );

        if (exists) {
          await client.query("ROLLBACK");
          return {
            error: true,
            message: "Juri sudah menerima proposal ini",
            data: { id_proposal, id_juri, tahap },
          };
        }

        await insertDistribusiJuriDb(client, [
          id_proposal,
          id_juri,
          tahap,
          admin_id,
        ]);
      }
    }

    await updateStatusProposalDistribusiDb(client, id_proposal, tahap);

    await client.query("COMMIT");

    return {
      error: false,
      message: "Distribusi manual berhasil",
      data: {
        tahap,
        proposal,
        reviewer_ditambahkan: reviewers,
        juri_ditambahkan: tahap === 2 ? juris : [],
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
