const pool = require("../../../config/db");

const {
  getTahapAktifDb,
  getReviewerAktifDb,
  checkReviewerValidDb,
  getProposalSiapDistribusiDb,
  lockProposalForDistribusiDb,
  insertDistribusiDb,
  updateStatusProposalDistribusiDb,
} = require("../db/distribusi.db");

const previewDistribusiTahap1 = async () => {
  const tahap = 1;

  const tahapAktif = await getTahapAktifDb(tahap);
  if (!tahapAktif) {
    return {
      error: true,
      message: "Tahap 1 tidak aktif",
      data: { tahap },
    };
  }

  const proposals = await getProposalSiapDistribusiDb(tahap);
  const reviewers = await getReviewerAktifDb();

  if (!proposals.length) {
    return {
      error: true,
      message: "Tidak ada proposal siap distribusi tahap 1",
      data: { tahap },
    };
  }

  if (!reviewers.length) {
    return {
      error: true,
      message: "Reviewer aktif tidak tersedia",
      data: { tahap },
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
    message: "Preview distribusi tahap 1 berhasil",
    data: {
      tahap,
      total_proposal: totalProposal,
      total_reviewer: totalReviewer,
      rekomendasi,
    },
  };
};

const autoDistribusiTahap1 = async (admin_id) => {
  const tahap = 1;

  const preview = await previewDistribusiTahap1();
  if (preview.error) return preview;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let total = 0;
    const hasil = [];

    for (const r of preview.data.rekomendasi) {
      const assigned = [];

      for (const p of r.proposals) {
        const locked = await lockProposalForDistribusiDb(
          client,
          p.id_proposal,
          tahap
        );

        if (!locked) continue;

        const distribusi = await insertDistribusiDb(client, [
          p.id_proposal,
          r.id_reviewer,
          tahap,
          admin_id,
        ]);

        await updateStatusProposalDistribusiDb(client, p.id_proposal);

        assigned.push(distribusi);
        total++;
      }

      hasil.push({
        id_reviewer: r.id_reviewer,
        nama_reviewer: r.nama_reviewer,
        total_proposal: assigned.length,
        distribusi: assigned,
      });
    }

    await client.query("COMMIT");

    return {
      error: false,
      message: "Distribusi otomatis tahap 1 berhasil",
      data: {
        tahap,
        total_distribusi: total,
        hasil,
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

const manualDistribusiTahap1 = async (admin_id, payload) => {
  const tahap = 1;

  const { id_proposal, id_reviewer } = payload;

  if (!id_proposal || !id_reviewer) {
    return {
      error: true,
      message: "id_proposal dan id_reviewer wajib diisi",
      data: payload,
    };
  }

  const tahapAktif = await getTahapAktifDb(tahap);
  if (!tahapAktif) {
    return {
      error: true,
      message: "Tahap 1 tidak aktif",
      data: { tahap },
    };
  }

  const reviewerValid = await checkReviewerValidDb(id_reviewer);
  if (!reviewerValid) {
    return {
      error: true,
      message: "Reviewer tidak valid atau tidak aktif",
      data: { id_reviewer },
    };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const locked = await lockProposalForDistribusiDb(
      client,
      id_proposal,
      tahap
    );

    if (!locked) {
      await client.query("ROLLBACK");
      return {
        error: true,
        message: "Proposal tidak valid atau sudah terdistribusi",
        data: { id_proposal, tahap },
      };
    }

    const distribusi = await insertDistribusiDb(client, [
      id_proposal,
      id_reviewer,
      tahap,
      admin_id,
    ]);

    await updateStatusProposalDistribusiDb(client, id_proposal);

    await client.query("COMMIT");

    return {
      error: false,
      message: "Distribusi manual tahap 1 berhasil",
      data: distribusi,
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
  previewDistribusiTahap1,
  autoDistribusiTahap1,
  manualDistribusiTahap1,
};
