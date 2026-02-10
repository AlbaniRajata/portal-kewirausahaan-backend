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
} = require("../db/distribusiTahap1.db");

const previewDistribusiTahap1 = async (id_program) => {
  const tahap = 1;

  const tahapAktif = await getTahapAktifDb(id_program, tahap);
  if (!tahapAktif) {
    return {
      error: true,
      message: "Tahap 1 tidak aktif",
      data: { tahap },
    };
  }

  const proposals = await getProposalSiapDistribusiDb(id_program, tahap);
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
      institusi: r.institusi,
      bidang_keahlian: r.bidang_keahlian,
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

const autoDistribusiTahap1 = async (admin_id, id_program) => {
  const tahap = 1;

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

  const { id_proposal, id_reviewer, id_program } = payload;

  if (!id_proposal || !id_reviewer || !id_program) {
    return {
      error: true,
      message: "id_proposal, id_reviewer, dan id_program wajib diisi",
      data: payload,
    };
  }

  const tahapAktif = await getTahapAktifDb(id_program, tahap);
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
        message: "Proposal tidak valid atau sudah terdistribusikan",
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

const bulkDistribusiTahap1 = async (admin_id, payload) => {
  const tahap = 1;
  const { id_proposal_list, id_reviewer, id_program } = payload;

  if (!id_proposal_list?.length || !id_reviewer || !id_program) {
    return {
      error: true,
      message: "id_proposal_list, id_reviewer, dan id_program wajib diisi",
    };
  }

  const tahapAktif = await getTahapAktifDb(id_program, tahap);
  if (!tahapAktif) {
    return { 
      error: true, 
      message: "Tahap 1 tidak aktif" 
    };
  }

  const reviewerData = await getReviewerByIdDb(id_reviewer);
  if (!reviewerData || !reviewerData.is_active) {
    return { 
      error: true, 
      message: "Reviewer tidak valid atau tidak aktif" 
    };
  }

  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    const assigned = [];
    const failed = [];

    for (const id_proposal of id_proposal_list) {
      const locked = await lockProposalForDistribusiDb(client, id_proposal, tahap);
      
      if (!locked) {
        const proposalInfo = await getProposalBasicDb(id_proposal);
        failed.push({ 
          id_proposal, 
          judul: proposalInfo?.judul || "Unknown",
          reason: "Sudah terdistribusi atau tidak valid" 
        });
        continue;
      }

      const distribusi = await insertDistribusiDb(client, [
        id_proposal, 
        id_reviewer, 
        tahap, 
        admin_id
      ]);

      await updateStatusProposalDistribusiDb(client, id_proposal);
      
      const proposalInfo = await getProposalBasicDb(id_proposal);
      assigned.push({
        id_distribusi: distribusi.id_distribusi,
        id_proposal: distribusi.id_proposal,
        judul: proposalInfo?.judul || "",
        assigned_at: distribusi.assigned_at,
      });
    }

    await client.query("COMMIT");

    return {
      error: false,
      message: `Berhasil mendistribusikan ${assigned.length} dari ${id_proposal_list.length} proposal`,
      data: {
        tahap,
        id_reviewer,
        nama_reviewer: reviewerData.nama_lengkap,
        institusi: reviewerData.institusi,
        total_assigned: assigned.length,
        total_failed: failed.length,
        distribusi: assigned,
        failed,
      },
    };
  } catch (e) {
    await client.query("ROLLBACK");
    return { 
      error: true, 
      message: e.message 
    };
  } finally {
    client.release();
  }
};

const getDistribusiHistory = async (id_program, tahap) => {
  try {
    const history = await getDistribusiHistoryDb(id_program, tahap);
    
    return {
      error: false,
      message: "History distribusi berhasil dimuat",
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

const getDistribusiDetail = async (id_distribusi, id_program, tahap) => {
  try {
    const distribusi = await getDistribusiDetailDb(id_distribusi);
    
    if (!distribusi) {
      return {
        error: true,
        message: "Distribusi tidak ditemukan",
        data: null,
      };
    }

    if (distribusi.id_program !== id_program || distribusi.tahap !== tahap) {
      return {
        error: true,
        message: "Distribusi tidak sesuai dengan program/tahap yang diminta",
        data: null,
      };
    }

    return {
      error: false,
      message: "Detail distribusi berhasil dimuat",
      data: distribusi,
    };
  } catch (e) {
    return {
      error: true,
      message: e.message,
      data: null,
    };
  }
};

const reassignReviewer = async (admin_id, id_distribusi, id_reviewer_baru) => {
  const distribusi = await getDistribusiByIdDb(id_distribusi);
  
  if (!distribusi) {
    return { 
      error: true, 
      message: "Distribusi tidak ditemukan" 
    };
  }
  
  if (distribusi.status !== 2) {
    return { 
      error: true, 
      message: "Hanya distribusi yang ditolak yang dapat di-reassign" 
    };
  }

  const reviewerData = await getReviewerByIdDb(id_reviewer_baru);
  if (!reviewerData || !reviewerData.is_active) {
    return { 
      error: true, 
      message: "Reviewer baru tidak valid atau tidak aktif" 
    };
  }

  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    await updateDistribusiStatusDb(client, id_distribusi, 3);

    const distribusiBaru = await insertDistribusiDb(client, [
      distribusi.id_proposal,
      id_reviewer_baru,
      distribusi.tahap,
      admin_id
    ]);

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
  } catch (e) {
    await client.query("ROLLBACK");
    return { 
      error: true, 
      message: e.message 
    };
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