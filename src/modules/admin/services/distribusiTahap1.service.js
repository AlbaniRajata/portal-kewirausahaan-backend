const pool = require("../../../config/db");

const {
  getTahapAktifDb,
  getReviewerAktifDb,
  checkReviewerValidDb,
  getProposalSiapDistribusiDb,
  lockProposalForDistribusiDb,
  insertDistribusiDb,
  updateStatusProposalDistribusiDb,
  getReviewerByIdDb,
  getProposalBasicDb,
  getDistribusiHistoryDb,
  getDistribusiByIdDb,
  getDistribusiDetailDb,
  updateDistribusiStatusDb,
  updateProposalStatusDb,
  getDistribusiByProposalReviewerDb,
  reaktifkanDistribusiDb,
  getDistribusiTahap1SummaryDb,
} = require("../db/distribusiTahap1.db");

const TAHAP = 1;

const previewDistribusiTahap1 = async (id_program) => {
  const tahapAktif = await getTahapAktifDb(id_program, TAHAP);
  if (!tahapAktif) return { error: true, message: "Tahap 1 tidak aktif", data: { tahap: TAHAP } };

  const [summary, reviewers] = await Promise.all([
    getDistribusiTahap1SummaryDb(id_program, TAHAP),
    getReviewerAktifDb(id_program),
  ]);

  if (!summary.length) return { error: true, message: "Tidak ada proposal untuk distribusi tahap 1", data: { tahap: TAHAP } };
  if (!reviewers.length) return { error: true, message: "Reviewer aktif tidak tersedia", data: { tahap: TAHAP } };

  const sudahTerdistribusi = [];
  const belumTerdistribusi = [];

  for (const item of summary) {
    if (item.reviewer_ids && item.reviewer_ids.length >= 2) {
      sudahTerdistribusi.push({
        id_proposal: item.id_proposal,
        judul: item.judul,
        nama_tim: item.nama_tim,
        id_kategori: item.id_kategori,
        nama_kategori: item.nama_kategori,
        reviewer1: { id_user: item.reviewer_ids[0], nama_lengkap: item.reviewer_names[0] },
        reviewer2: { id_user: item.reviewer_ids[1], nama_lengkap: item.reviewer_names[1] },
      });
    } else {
      belumTerdistribusi.push(item);
    }
  }

  // Kelompokkan proposal yang belum terdistribusi berdasarkan kategori
  const groupedByCategory = {};
  const kategoriOrder = [];
  for (const p of belumTerdistribusi) {
    if (!groupedByCategory[p.id_kategori]) {
      groupedByCategory[p.id_kategori] = [];
      kategoriOrder.push(p.id_kategori);
    }
    groupedByCategory[p.id_kategori].push(p);
  }

  // Interleave proposals across categories so distribution is balanced per kategori
  const rencanaDistribusi = [];
  let globalReviewerCursor = 0;
  let idx = 0;
  let hasMore = true;

  while (hasMore) {
    hasMore = false;
    for (const kategoriId of kategoriOrder) {
      const proposalsInCat = groupedByCategory[kategoriId];
      const p = proposalsInCat[idx];
      if (!p) continue;
      hasMore = true;

      const currentReviewers = p.reviewer_ids || [];
      const needed = 2 - currentReviewers.length;
      const assigned = [];

      for (let i = 0; i < currentReviewers.length; i++) {
        assigned.push({ id_user: currentReviewers[i], nama_lengkap: p.reviewer_names[i] });
      }

      let attempts = 0;
      while (assigned.length < 2 && attempts < reviewers.length) {
        const candidate = reviewers[globalReviewerCursor % reviewers.length];
        globalReviewerCursor++;
        attempts++;
        if (!assigned.some((a) => a.id_user === candidate.id_user)) {
          assigned.push({ id_user: candidate.id_user, nama_lengkap: candidate.nama_lengkap });
        }
      }

      rencanaDistribusi.push({
        id_proposal: p.id_proposal,
        judul: p.judul,
        nama_tim: p.nama_tim,
        id_kategori: p.id_kategori,
        nama_kategori: p.nama_kategori,
        reviewer1: assigned[0] || null,
        reviewer2: assigned[1] || null,
        needed_count: needed,
      });
    }
    idx++;
  }

  return {
    error: false,
    message: "Preview distribusi tahap 1 berhasil",
    data: {
      tahap: TAHAP,
      total_proposal: summary.length,
      total_reviewer: reviewers.length,
      sudah_terdistribusi: sudahTerdistribusi.length,
      belum_terdistribusi: belumTerdistribusi.length,
      detail_sudah: sudahTerdistribusi,
      rencana_distribusi: rencanaDistribusi,
    },
  };
};

const autoDistribusiTahap1 = async (admin_id, id_program) => {
  const preview = await previewDistribusiTahap1(id_program);
  if (preview.error) return preview;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let totalAssigned = 0;

    for (const rencana of preview.data.rencana_distribusi) {
      const reviewers = [rencana.reviewer1, rencana.reviewer2].filter(Boolean);
      
      for (const r of reviewers) {
        // Check if already assigned
        const existing = await getDistribusiByProposalReviewerDb(client, rencana.id_proposal, r.id_user, TAHAP);
        if (existing) {
          if (existing.status === 5) {
             await reaktifkanDistribusiDb(client, existing.id_distribusi, admin_id);
          }
          continue;
        }

        // Lock if not already locked (handled by DB query logic in getProposalSiapDistribusi)
        // Actually since we use the plan from preview, we should double check if it's still valid
        await insertDistribusiDb(client, [rencana.id_proposal, r.id_user, TAHAP, admin_id]);
        totalAssigned++;
      }
      
      // Update proposal status to 2 (Desk Evaluasi) if at least one reviewer is assigned
      await updateStatusProposalDistribusiDb(client, rencana.id_proposal);
    }

    await client.query("COMMIT");
    return { error: false, message: "Distribusi otomatis tahap 1 berhasil", data: { tahap: TAHAP, total_distribusi: totalAssigned } };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const manualDistribusiTahap1 = async (admin_id, payload) => {
  const { id_proposal, id_reviewer, id_program } = payload;

  const missing = [];
  if (!id_proposal) missing.push("id_proposal");
  if (!id_reviewer) missing.push("id_reviewer");
  if (!id_program) missing.push("id_program");
  if (missing.length) return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };

  const [tahapAktif, reviewerValid] = await Promise.all([
    getTahapAktifDb(id_program, TAHAP),
    checkReviewerValidDb(id_reviewer),
  ]);

  if (!tahapAktif) return { error: true, message: "Tahap 1 tidak aktif", data: { tahap: TAHAP } };
  if (!reviewerValid) return { error: true, message: "Reviewer tidak valid atau tidak aktif", data: { id_reviewer } };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const locked = await lockProposalForDistribusiDb(client, id_proposal, TAHAP);
    if (!locked) {
      await client.query("ROLLBACK");
      return { error: true, message: "Proposal tidak valid atau sudah terdistribusikan", data: { id_proposal, tahap: TAHAP } };
    }

    const distribusi = await insertDistribusiDb(client, [id_proposal, id_reviewer, TAHAP, admin_id]);
    await updateStatusProposalDistribusiDb(client, id_proposal);

    await client.query("COMMIT");
    return { error: false, message: "Distribusi manual tahap 1 berhasil", data: distribusi };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const bulkDistribusiTahap1 = async (admin_id, payload) => {
  const { id_proposal_list, id_reviewer, id_program } = payload;

  const missing = [];
  if (!id_proposal_list?.length) missing.push("id_proposal_list");
  if (!id_reviewer) missing.push("id_reviewer");
  if (!id_program) missing.push("id_program");
  if (missing.length) return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };

  const [tahapAktif, reviewerData] = await Promise.all([
    getTahapAktifDb(id_program, TAHAP),
    getReviewerByIdDb(id_reviewer),
  ]);

  if (!tahapAktif) return { error: true, message: "Tahap 1 tidak aktif", data: { tahap: TAHAP } };
  if (!reviewerData || !reviewerData.is_active) return { error: true, message: "Reviewer tidak valid atau tidak aktif", data: { id_reviewer } };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const assigned = [];
    const failed = [];

    for (const id_proposal of id_proposal_list) {
      const locked = await lockProposalForDistribusiDb(client, id_proposal, TAHAP);
      if (!locked) {
        const info = await getProposalBasicDb(id_proposal);
        failed.push({ id_proposal, judul: info?.judul || "Unknown", reason: "Sudah terdistribusi atau tidak valid" });
        continue;
      }
      const distribusi = await insertDistribusiDb(client, [id_proposal, id_reviewer, TAHAP, admin_id]);
      await updateStatusProposalDistribusiDb(client, id_proposal);
      const info = await getProposalBasicDb(id_proposal);
      assigned.push({ id_distribusi: distribusi.id_distribusi, id_proposal: distribusi.id_proposal, judul: info?.judul || "", assigned_at: distribusi.assigned_at });
    }

    await client.query("COMMIT");
    return {
      error: false,
      message: `Berhasil mendistribusikan ${assigned.length} dari ${id_proposal_list.length} proposal`,
      data: { tahap: TAHAP, id_reviewer, nama_reviewer: reviewerData.nama_lengkap, institusi: reviewerData.institusi, total_assigned: assigned.length, total_failed: failed.length, distribusi: assigned, failed },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getDistribusiHistory = async (id_program, tahap) => {
  const history = await getDistribusiHistoryDb(id_program, tahap);
  return { error: false, message: "History distribusi berhasil dimuat", data: history };
};

const getDistribusiDetail = async (id_distribusi, id_program, tahap) => {
  const distribusi = await getDistribusiDetailDb(id_distribusi);
  if (!distribusi) return { error: true, message: "Distribusi tidak ditemukan", data: null };
  if (distribusi.id_program !== id_program || distribusi.tahap !== tahap) {
    return { error: true, message: "Distribusi tidak sesuai dengan program/tahap yang diminta", data: null };
  }
  return { error: false, message: "Detail distribusi berhasil dimuat", data: distribusi };
};

const reassignReviewer = async (admin_id, id_distribusi, id_reviewer_baru, id_program, tahap) => {
  const distribusi = await getDistribusiByIdDb(id_distribusi);
  if (!distribusi) return { error: true, message: "Distribusi tidak ditemukan", data: null };
  if (distribusi.id_program !== id_program || distribusi.tahap !== tahap) {
    return { error: true, message: "Distribusi tidak sesuai dengan program/tahap yang diminta", data: null };
  }
  if (distribusi.status !== 2) return { error: true, message: "Hanya distribusi yang ditolak yang dapat di-reassign", data: null };

  const reviewerData = await getReviewerByIdDb(id_reviewer_baru);
  if (!reviewerData || !reviewerData.is_active) return { error: true, message: "Reviewer baru tidak valid atau tidak aktif", data: null };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await updateDistribusiStatusDb(client, id_distribusi, 5);

    const existingDistribusi = await getDistribusiByProposalReviewerDb(client, distribusi.id_proposal, id_reviewer_baru, distribusi.tahap);
    let distribusiBaru;
    if (existingDistribusi) {
      distribusiBaru = await reaktifkanDistribusiDb(client, existingDistribusi.id_distribusi, admin_id);
    }
    if (!distribusiBaru) {
      distribusiBaru = await insertDistribusiDb(client, [distribusi.id_proposal, id_reviewer_baru, distribusi.tahap, admin_id]);
    }

    await updateProposalStatusDb(client, distribusi.id_proposal, 2);
    await client.query("COMMIT");

    return {
      error: false,
      message: "Reviewer berhasil diganti",
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

module.exports = {
  previewDistribusiTahap1,
  autoDistribusiTahap1,
  manualDistribusiTahap1,
  bulkDistribusiTahap1,
  getDistribusiHistory,
  getDistribusiDetail,
  reassignReviewer,
};