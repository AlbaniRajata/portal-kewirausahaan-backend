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
} = require("../db/distribusiTahap1.db");

const TAHAP = 1;

const previewDistribusiTahap1 = async (id_program) => {
  const tahapAktif = await getTahapAktifDb(id_program, TAHAP);
  if (!tahapAktif) return { error: true, message: "Tahap 1 tidak aktif", data: { tahap: TAHAP } };

  const [proposals, reviewers] = await Promise.all([
    getProposalSiapDistribusiDb(id_program, TAHAP),
    getReviewerAktifDb(),
  ]);

  if (!proposals.length) return { error: true, message: "Tidak ada proposal siap distribusi tahap 1", data: { tahap: TAHAP } };
  if (!reviewers.length) return { error: true, message: "Reviewer aktif tidak tersedia", data: { tahap: TAHAP } };

  const base = Math.floor(proposals.length / reviewers.length);
  const sisa = proposals.length % reviewers.length;
  let cursor = 0;

  const rekomendasi = reviewers.map((r, idx) => {
    const jatah = base + (idx < sisa ? 1 : 0);
    const slice = proposals.slice(cursor, cursor + jatah);
    cursor += jatah;
    return { id_reviewer: r.id_user, nama_reviewer: r.nama_lengkap, institusi: r.institusi, bidang_keahlian: r.bidang_keahlian, proposals: slice };
  });

  return {
    error: false,
    message: "Preview distribusi tahap 1 berhasil",
    data: { tahap: TAHAP, total_proposal: proposals.length, total_reviewer: reviewers.length, rekomendasi },
  };
};

const autoDistribusiTahap1 = async (admin_id, id_program) => {
  const preview = await previewDistribusiTahap1(id_program);
  if (preview.error) return preview;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let total = 0;
    const hasil = [];

    for (const r of preview.data.rekomendasi) {
      const assigned = [];
      for (const p of r.proposals) {
        const locked = await lockProposalForDistribusiDb(client, p.id_proposal, TAHAP);
        if (!locked) continue;
        const distribusi = await insertDistribusiDb(client, [p.id_proposal, r.id_reviewer, TAHAP, admin_id]);
        await updateStatusProposalDistribusiDb(client, p.id_proposal);
        assigned.push(distribusi);
        total++;
      }
      hasil.push({ id_reviewer: r.id_reviewer, nama_reviewer: r.nama_reviewer, total_proposal: assigned.length, distribusi: assigned });
    }

    await client.query("COMMIT");
    return { error: false, message: "Distribusi otomatis tahap 1 berhasil", data: { tahap: TAHAP, total_distribusi: total, hasil } };
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