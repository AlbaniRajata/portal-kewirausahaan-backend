const pool = require("../../../config/db");

const {
  getTahap2AktifDb,
  getProposalTahap2Db,
  getDistribusiReviewerByIdDb,
  getDistribusiJuriByIdDb,
  getReviewerAktifDb,
  getJuriAktifDb,
  getReviewerByIdDb,
  getJuriByIdDb,
  insertReviewerTahap2Db,
  insertJuriTahap2Db,
  updateDistribusiReviewerStatusDb,
  updateDistribusiJuriStatusDb,
  getDistribusiReviewerByProposalUserDb,
  getDistribusiJuriByProposalUserDb,
  reaktifkanDistribusiReviewerDb,
  reaktifkanDistribusiJuriDb,
  updateProposalStatusPanelDb,
  getDistribusiReviewerHistoryTahap2Db,
  getDistribusiJuriHistoryTahap2Db,
  countExistingDistribusiReviewerTahap2Db,
  countExistingDistribusiJuriTahap2Db,
  countRejectedDistribusiReviewerTahap2Db,
  countRejectedDistribusiJuriTahap2Db,
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

  if (!proposals.length) return { error: true, message: "Tidak ada proposal siap masuk panel wawancara", data: { id_program } };
  if (!reviewers.length) return { error: true, message: "Reviewer aktif tidak tersedia", data: null };
  if (!juries.length) return { error: true, message: "Juri aktif tidak tersedia", data: null };

  const distribusi_reviewer = proposals.length * reviewers.length;
  const distribusi_juri = proposals.length * juries.length;
  const [existingReviewer, existingJuri, rejectedReviewer, rejectedJuri] = await Promise.all([
    countExistingDistribusiReviewerTahap2Db(id_program),
    countExistingDistribusiJuriTahap2Db(id_program),
    countRejectedDistribusiReviewerTahap2Db(id_program),
    countRejectedDistribusiJuriTahap2Db(id_program),
  ]);

  const sisa_reviewer = Math.max(distribusi_reviewer - existingReviewer, 0);
  const sisa_juri = Math.max(distribusi_juri - existingJuri, 0);

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
      distribusi_existing_reviewer: existingReviewer,
      distribusi_existing_juri: existingJuri,
      distribusi_existing_total: existingReviewer + existingJuri,
      distribusi_rejected_reviewer: rejectedReviewer,
      distribusi_rejected_juri: rejectedJuri,
      distribusi_rejected_total: rejectedReviewer + rejectedJuri,
      distribusi_sisa_reviewer: sisa_reviewer,
      distribusi_sisa_juri: sisa_juri,
      distribusi_sisa_total: sisa_reviewer + sisa_juri,
      proposals,
    },
  };
};

const assignReviewerTahap2 = async (client, id_proposal, id_reviewer, tahap, admin_id) => {
  const existing = await getDistribusiReviewerByProposalUserDb(
    client,
    id_proposal,
    id_reviewer,
    tahap,
  );

  if (!existing) {
    return insertReviewerTahap2Db(client, id_proposal, id_reviewer, tahap, admin_id);
  }

  if (existing.status === 5) {
    return reaktifkanDistribusiReviewerDb(client, existing.id_distribusi, admin_id);
  }

  if (existing.status === 2) {
    await updateDistribusiReviewerStatusDb(client, existing.id_distribusi, 5);
    return reaktifkanDistribusiReviewerDb(client, existing.id_distribusi, admin_id);
  }

  return null;
};

const assignJuriTahap2 = async (client, id_proposal, id_juri, tahap, admin_id) => {
  const existing = await getDistribusiJuriByProposalUserDb(
    client,
    id_proposal,
    id_juri,
    tahap,
  );

  if (!existing) {
    return insertJuriTahap2Db(client, id_proposal, id_juri, tahap, admin_id);
  }

  if (existing.status === 5) {
    return reaktifkanDistribusiJuriDb(client, existing.id_distribusi, admin_id);
  }

  if (existing.status === 2) {
    await updateDistribusiJuriStatusDb(client, existing.id_distribusi, 5);
    return reaktifkanDistribusiJuriDb(client, existing.id_distribusi, admin_id);
  }

  return null;
};

const autoDistribusiTahap2 = async (admin_id, id_program) => {
  const preview = await previewDistribusiTahap2(id_program);
  if (preview.error) return preview;

  if ((preview.data?.distribusi_sisa_total || 0) === 0) {
    return {
      error: false,
      message: "Distribusi panel wawancara sudah merata, tidak ada sisa distribusi",
      data: {
        id_program,
        id_tahap: preview.data.id_tahap,
        total_proposal: preview.data.total_proposal,
        distribusi_reviewer: 0,
        distribusi_juri: 0,
        distribusi_total: 0,
      },
    };
  }

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
        const dist = await assignReviewerTahap2(client, p.id_proposal, r.id_user, id_tahap, admin_id);
        if (dist) totalReviewer++;
      }
      for (const j of juries) {
        const dist = await assignJuriTahap2(client, p.id_proposal, j.id_user, id_tahap, admin_id);
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
      const dist = await assignReviewerTahap2(client, id_proposal, id_reviewer, id_tahap, admin_id);
      if (dist) hasilReviewer.push(dist);
    }
    for (const id_juri of juries) {
      const dist = await assignJuriTahap2(client, id_proposal, id_juri, id_tahap, admin_id);
      if (dist) hasilJuri.push(dist);
    }

    await updateProposalStatusPanelDb(client, id_program, id_proposal);
    await client.query("COMMIT");

    const totalRequested = reviewers.length + juries.length;
    const totalAssigned = hasilReviewer.length + hasilJuri.length;
    const totalSkipped = totalRequested - totalAssigned;

    return {
      error: false,
      message:
        totalSkipped > 0
          ? `Distribusi manual panel wawancara berhasil (ditambahkan ${totalAssigned}, sudah terdistribusi sebelumnya ${totalSkipped})`
          : "Distribusi manual panel wawancara berhasil",
      data: {
        reviewer: hasilReviewer,
        juri: hasilJuri,
        total_assigned: totalAssigned,
        total_skipped: totalSkipped,
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const reassignReviewerTahap2 = async (admin_id, id_distribusi, id_reviewer_baru, id_program) => {
  const distribusi = await getDistribusiReviewerByIdDb(id_distribusi);
  if (!distribusi) return { error: true, message: "Distribusi reviewer tidak ditemukan", data: null };
  if (distribusi.id_program !== id_program || distribusi.tahap !== 2) {
    return { error: true, message: "Distribusi reviewer tidak sesuai program/tahap 2", data: null };
  }
  if (distribusi.status !== 2) {
    return { error: true, message: "Hanya distribusi reviewer yang ditolak yang dapat di-reassign", data: null };
  }

  const reviewerData = await getReviewerByIdDb(id_reviewer_baru);
  if (!reviewerData || !reviewerData.is_active) {
    return { error: true, message: "Reviewer baru tidak valid atau tidak aktif", data: null };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await updateDistribusiReviewerStatusDb(client, id_distribusi, 5);

    const existing = await getDistribusiReviewerByProposalUserDb(client, distribusi.id_proposal, id_reviewer_baru, distribusi.tahap);
    let distribusiBaru = null;

    if (existing) {
      distribusiBaru = await reaktifkanDistribusiReviewerDb(client, existing.id_distribusi, admin_id);
    }
    if (!distribusiBaru) {
      distribusiBaru = await insertReviewerTahap2Db(client, distribusi.id_proposal, id_reviewer_baru, distribusi.tahap, admin_id);
    }
    if (!distribusiBaru) {
      await client.query("ROLLBACK");
      return { error: true, message: "Reviewer tujuan sudah memiliki distribusi aktif untuk proposal ini", data: null };
    }

    await updateProposalStatusPanelDb(client, id_program, distribusi.id_proposal);
    await client.query("COMMIT");

    return {
      error: false,
      message: "Reviewer tahap 2 berhasil diganti",
      data: {
        id_distribusi_lama: id_distribusi,
        id_distribusi_baru: distribusiBaru.id_distribusi,
        id_proposal: distribusi.id_proposal,
        judul: distribusi.judul,
        reviewer_lama: distribusi.reviewer_name,
        reviewer_baru: reviewerData.nama_lengkap,
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const reassignJuriTahap2 = async (admin_id, id_distribusi, id_juri_baru, id_program) => {
  const distribusi = await getDistribusiJuriByIdDb(id_distribusi);
  if (!distribusi) return { error: true, message: "Distribusi juri tidak ditemukan", data: null };
  if (distribusi.id_program !== id_program || distribusi.tahap !== 2) {
    return { error: true, message: "Distribusi juri tidak sesuai program/tahap 2", data: null };
  }
  if (distribusi.status !== 2) {
    return { error: true, message: "Hanya distribusi juri yang ditolak yang dapat di-reassign", data: null };
  }

  const juriData = await getJuriByIdDb(id_juri_baru);
  if (!juriData || !juriData.is_active) {
    return { error: true, message: "Juri baru tidak valid atau tidak aktif", data: null };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await updateDistribusiJuriStatusDb(client, id_distribusi, 5);

    const existing = await getDistribusiJuriByProposalUserDb(client, distribusi.id_proposal, id_juri_baru, distribusi.tahap);
    let distribusiBaru = null;

    if (existing) {
      distribusiBaru = await reaktifkanDistribusiJuriDb(client, existing.id_distribusi, admin_id);
    }
    if (!distribusiBaru) {
      distribusiBaru = await insertJuriTahap2Db(client, distribusi.id_proposal, id_juri_baru, distribusi.tahap, admin_id);
    }
    if (!distribusiBaru) {
      await client.query("ROLLBACK");
      return { error: true, message: "Juri tujuan sudah memiliki distribusi aktif untuk proposal ini", data: null };
    }

    await updateProposalStatusPanelDb(client, id_program, distribusi.id_proposal);
    await client.query("COMMIT");

    return {
      error: false,
      message: "Juri tahap 2 berhasil diganti",
      data: {
        id_distribusi_lama: id_distribusi,
        id_distribusi_baru: distribusiBaru.id_distribusi,
        id_proposal: distribusi.id_proposal,
        judul: distribusi.judul,
        juri_lama: distribusi.juri_name,
        juri_baru: juriData.nama_lengkap,
      },
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
  reassignReviewerTahap2,
  reassignJuriTahap2,
  getDistribusiReviewerHistoryTahap2,
  getDistribusiJuriHistoryTahap2,
};
