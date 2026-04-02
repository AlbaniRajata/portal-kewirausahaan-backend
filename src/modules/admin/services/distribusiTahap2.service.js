const pool = require("../../../config/db");
const {
  getTahap2AktifDb,
  getProposalTahap2Db,
  getReviewerAktifDb,
  getJuriAktifDb,
  getReviewerByIdDb,
  getJuriByIdDb,
  getDistribusiAktifReviewerByProposalDb,
  getDistribusiAktifJuriByProposalDb,
  getDistribusiReviewerByIdDb,
  getDistribusiJuriByIdDb,
  insertReviewerTahap2Db,
  insertJuriTahap2Db,
  updateDistribusiReviewerStatusDb,
  updateDistribusiJuriStatusDb,
  reaktifkanDistribusiReviewerDb,
  reaktifkanDistribusiJuriDb,
  updateProposalStatusPanelDb,
  getPanelTahap2HistoryDb,
  getDistribusiReviewerByProposalUserDb,
  getDistribusiJuriByProposalUserDb,
} = require("../db/distribusiTahap2.db");

const assignReviewerKeProposal = async (client, id_proposal, id_reviewer, id_tahap, admin_id) => {
  const existing = await getDistribusiReviewerByProposalUserDb(client, id_proposal, id_reviewer, id_tahap);

  if (!existing) {
    return insertReviewerTahap2Db(client, id_proposal, id_reviewer, id_tahap, admin_id);
  }
  if (existing.status === 5) {
    return reaktifkanDistribusiReviewerDb(client, existing.id_distribusi, admin_id);
  }
  if (existing.status === 2) {
    await updateDistribusiReviewerStatusDb(client, existing.id_distribusi, 5);
    return reaktifkanDistribusiReviewerDb(client, existing.id_distribusi, admin_id);
  }
  return existing;
};

const assignJuriKeProposal = async (client, id_proposal, id_juri, id_tahap, admin_id) => {
  const existing = await getDistribusiJuriByProposalUserDb(client, id_proposal, id_juri, id_tahap);

  if (!existing) {
    return insertJuriTahap2Db(client, id_proposal, id_juri, id_tahap, admin_id);
  }
  if (existing.status === 5) {
    return reaktifkanDistribusiJuriDb(client, existing.id_distribusi, admin_id);
  }
  if (existing.status === 2) {
    await updateDistribusiJuriStatusDb(client, existing.id_distribusi, 5);
    return reaktifkanDistribusiJuriDb(client, existing.id_distribusi, admin_id);
  }
  return existing;
};

const getReviewerSudahAktifDb = async (id_tahap) => {
  const { rows } = await pool.query(
    `SELECT DISTINCT id_reviewer FROM t_distribusi_reviewer
     WHERE tahap = $1 AND status NOT IN (2, 5)`,
    [id_tahap]
  );
  return rows.map((r) => r.id_reviewer);
};

const getJuriSudahAktifDb = async (id_tahap) => {
  const { rows } = await pool.query(
    `SELECT DISTINCT id_juri FROM t_distribusi_juri
     WHERE tahap = $1 AND status NOT IN (2, 5)`,
    [id_tahap]
  );
  return rows.map((r) => r.id_juri);
};

const previewDistribusiTahap2 = async (id_program) => {
  const tahapAktif = await getTahap2AktifDb(id_program);
  if (!tahapAktif) {
    return { error: true, message: "Tahap 2 (Wawancara) belum dibuat atau sudah ditutup", data: { id_program } };
  }

  const [proposals, reviewers, juries] = await Promise.all([
    getProposalTahap2Db(id_program),
    getReviewerAktifDb(),
    getJuriAktifDb(),
  ]);

  if (!proposals.length) return { error: true, message: "Tidak ada proposal yang siap masuk panel wawancara", data: { id_program } };
  if (!reviewers.length) return { error: true, message: "Tidak ada reviewer aktif", data: null };
  if (!juries.length) return { error: true, message: "Tidak ada juri aktif", data: null };

  const sudahTerdistribusi = [];
  const belumTerdistribusi = [];

  for (const p of proposals) {
    const reviewerAktif = await getDistribusiAktifReviewerByProposalDb(p.id_proposal, tahapAktif.id_tahap);
    const juriAktif = await getDistribusiAktifJuriByProposalDb(p.id_proposal, tahapAktif.id_tahap);

    if (reviewerAktif && juriAktif) {
      sudahTerdistribusi.push({
        ...p,
        reviewer: { id_user: reviewerAktif.id_reviewer, nama_lengkap: reviewerAktif.reviewer_name },
        juri: { id_user: juriAktif.id_juri, nama_lengkap: juriAktif.juri_name },
      });
    } else {
      belumTerdistribusi.push(p);
    }
  }

  const reviewerSudahAktif = await getReviewerSudahAktifDb(tahapAktif.id_tahap);
  const juriSudahAktif = await getJuriSudahAktifDb(tahapAktif.id_tahap);

  const reviewerBelumAktif = reviewers.filter((r) => !reviewerSudahAktif.includes(r.id_user));
  const juriBelumAktif = juries.filter((j) => !juriSudahAktif.includes(j.id_user));

  const poolReviewer = reviewerBelumAktif.length > 0 ? reviewerBelumAktif : reviewers;
  const poolJuri = juriBelumAktif.length > 0 ? juriBelumAktif : juries;

  const jumlahPasang = Math.min(poolReviewer.length, poolJuri.length);

  const rencanaPasangan = belumTerdistribusi.map((p, idx) => {
    const pasanganIdx = idx % jumlahPasang;
    return {
      id_proposal: p.id_proposal,
      judul: p.judul,
      reviewer: { id_user: poolReviewer[pasanganIdx].id_user, nama_lengkap: poolReviewer[pasanganIdx].nama_lengkap },
      juri: { id_user: poolJuri[pasanganIdx].id_user, nama_lengkap: poolJuri[pasanganIdx].nama_lengkap },
    };
  });

  return {
    error: false,
    message: "Preview distribusi panel wawancara siap",
    data: {
      id_program,
      id_tahap: tahapAktif.id_tahap,
      total_proposal: proposals.length,
      total_reviewer: reviewers.length,
      total_juri: juries.length,
      jumlah_pasang: jumlahPasang,
      sudah_terdistribusi: sudahTerdistribusi.length,
      belum_terdistribusi: belumTerdistribusi.length,
      detail_sudah: sudahTerdistribusi,
      rencana_distribusi: rencanaPasangan,
    },
  };
};

const autoDistribusiTahap2 = async (admin_id, id_program) => {
  const preview = await previewDistribusiTahap2(id_program);
  if (preview.error) return preview;

  if (preview.data.belum_terdistribusi === 0) {
    return {
      error: false,
      message: "Semua proposal sudah terdistribusi",
      data: { id_program, total_didistribusi: 0 },
    };
  }

  const { id_tahap, rencana_distribusi } = preview.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let totalDidistribusi = 0;

    for (const rencana of rencana_distribusi) {
      const reviewerAktif = await getDistribusiAktifReviewerByProposalDb(rencana.id_proposal, id_tahap);
      const juriAktif = await getDistribusiAktifJuriByProposalDb(rencana.id_proposal, id_tahap);

      if (!reviewerAktif) {
        await assignReviewerKeProposal(client, rencana.id_proposal, rencana.reviewer.id_user, id_tahap, admin_id);
      }
      if (!juriAktif) {
        await assignJuriKeProposal(client, rencana.id_proposal, rencana.juri.id_user, id_tahap, admin_id);
      }

      await updateProposalStatusPanelDb(client, id_program, rencana.id_proposal);
      totalDidistribusi++;
    }

    await client.query("COMMIT");

    return {
      error: false,
      message: `Auto distribusi panel wawancara berhasil`,
      data: { id_program, id_tahap, total_didistribusi: totalDidistribusi },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const manualDistribusiTahap2 = async (admin_id, id_program, payload) => {
  const { id_proposal, id_reviewer, id_juri } = payload;

  if (!id_proposal || !id_reviewer || !id_juri) {
    return { error: true, message: "id_proposal, id_reviewer, dan id_juri wajib diisi", data: null };
  }

  const tahapAktif = await getTahap2AktifDb(id_program);
  if (!tahapAktif) {
    return { error: true, message: "Tahap 2 (Wawancara) belum dibuat atau sudah ditutup", data: { id_program } };
  }

  const id_tahap = tahapAktif.id_tahap;

  const reviewerAktif = await getDistribusiAktifReviewerByProposalDb(id_proposal, id_tahap);
  if (reviewerAktif && reviewerAktif.id_reviewer !== id_reviewer) {
    return {
      error: true,
      message: `Proposal ini sudah memiliki reviewer aktif (${reviewerAktif.reviewer_name}). Gunakan fitur reassign untuk mengganti.`,
      data: null,
    };
  }

  const juriAktif = await getDistribusiAktifJuriByProposalDb(id_proposal, id_tahap);
  if (juriAktif && juriAktif.id_juri !== id_juri) {
    return {
      error: true,
      message: `Proposal ini sudah memiliki juri aktif (${juriAktif.juri_name}). Gunakan fitur reassign untuk mengganti.`,
      data: null,
    };
  }

  const [reviewerData, juriData] = await Promise.all([
    getReviewerByIdDb(id_reviewer),
    getJuriByIdDb(id_juri),
  ]);

  if (!reviewerData || !reviewerData.is_active) {
    return { error: true, message: "Reviewer tidak valid atau tidak aktif", data: null };
  }
  if (!juriData || !juriData.is_active) {
    return { error: true, message: "Juri tidak valid atau tidak aktif", data: null };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const distReviewer = await assignReviewerKeProposal(client, id_proposal, id_reviewer, id_tahap, admin_id);
    const distJuri = await assignJuriKeProposal(client, id_proposal, id_juri, id_tahap, admin_id);
    await updateProposalStatusPanelDb(client, id_program, id_proposal);

    await client.query("COMMIT");

    return {
      error: false,
      message: "Distribusi manual panel wawancara berhasil",
      data: {
        id_proposal,
        reviewer: { id_distribusi: distReviewer.id_distribusi, nama: reviewerData.nama_lengkap },
        juri: { id_distribusi: distJuri.id_distribusi, nama: juriData.nama_lengkap },
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
    return { error: true, message: "Distribusi tidak sesuai program atau tahap", data: null };
  }
  if (distribusi.status !== 2) {
    return { error: true, message: "Hanya distribusi yang ditolak yang dapat di-reassign", data: null };
  }

  const reviewerData = await getReviewerByIdDb(id_reviewer_baru);
  if (!reviewerData || !reviewerData.is_active) {
    return { error: true, message: "Reviewer baru tidak valid atau tidak aktif", data: null };
  }

  const reviewerAktifLain = await getDistribusiAktifReviewerByProposalDb(distribusi.id_proposal, distribusi.tahap);
  if (reviewerAktifLain) {
    return {
      error: true,
      message: `Proposal ini sudah memiliki reviewer aktif lain (${reviewerAktifLain.reviewer_name})`,
      data: null,
    };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await updateDistribusiReviewerStatusDb(client, id_distribusi, 5);

    const existingBaru = await getDistribusiReviewerByProposalUserDb(client, distribusi.id_proposal, id_reviewer_baru, distribusi.tahap);
    let distribusiBaru;

    if (existingBaru) {
      distribusiBaru = await reaktifkanDistribusiReviewerDb(client, existingBaru.id_distribusi, admin_id);
    } else {
      distribusiBaru = await insertReviewerTahap2Db(client, distribusi.id_proposal, id_reviewer_baru, distribusi.tahap, admin_id);
    }

    if (!distribusiBaru) {
      await client.query("ROLLBACK");
      return { error: true, message: "Gagal melakukan reassign reviewer", data: null };
    }

    await updateProposalStatusPanelDb(client, id_program, distribusi.id_proposal);
    await client.query("COMMIT");

    const juriAktif = await getDistribusiAktifJuriByProposalDb(distribusi.id_proposal, distribusi.tahap);

    return {
      error: false,
      message: "Reviewer berhasil diganti",
      data: {
        id_proposal: distribusi.id_proposal,
        judul: distribusi.judul,
        reviewer: { id_distribusi: distribusiBaru.id_distribusi, nama: reviewerData.nama_lengkap },
        juri: juriAktif ? { id_distribusi: juriAktif.id_distribusi, nama: juriAktif.juri_name } : null,
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
    return { error: true, message: "Distribusi tidak sesuai program atau tahap", data: null };
  }
  if (distribusi.status !== 2) {
    return { error: true, message: "Hanya distribusi yang ditolak yang dapat di-reassign", data: null };
  }

  const juriData = await getJuriByIdDb(id_juri_baru);
  if (!juriData || !juriData.is_active) {
    return { error: true, message: "Juri baru tidak valid atau tidak aktif", data: null };
  }

  const juriAktifLain = await getDistribusiAktifJuriByProposalDb(distribusi.id_proposal, distribusi.tahap);
  if (juriAktifLain) {
    return {
      error: true,
      message: `Proposal ini sudah memiliki juri aktif lain (${juriAktifLain.juri_name})`,
      data: null,
    };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await updateDistribusiJuriStatusDb(client, id_distribusi, 5);

    const existingBaru = await getDistribusiJuriByProposalUserDb(client, distribusi.id_proposal, id_juri_baru, distribusi.tahap);
    let distribusiBaru;

    if (existingBaru) {
      distribusiBaru = await reaktifkanDistribusiJuriDb(client, existingBaru.id_distribusi, admin_id);
    } else {
      distribusiBaru = await insertJuriTahap2Db(client, distribusi.id_proposal, id_juri_baru, distribusi.tahap, admin_id);
    }

    if (!distribusiBaru) {
      await client.query("ROLLBACK");
      return { error: true, message: "Gagal melakukan reassign juri", data: null };
    }

    await updateProposalStatusPanelDb(client, id_program, distribusi.id_proposal);
    await client.query("COMMIT");

    const reviewerAktif = await getDistribusiAktifReviewerByProposalDb(distribusi.id_proposal, distribusi.tahap);

    return {
      error: false,
      message: "Juri berhasil diganti",
      data: {
        id_proposal: distribusi.id_proposal,
        judul: distribusi.judul,
        reviewer: reviewerAktif ? { id_distribusi: reviewerAktif.id_distribusi, nama: reviewerAktif.reviewer_name } : null,
        juri: { id_distribusi: distribusiBaru.id_distribusi, nama: juriData.nama_lengkap },
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getPanelTahap2History = async (id_program) => {
  const history = await getPanelTahap2HistoryDb(id_program);
  return { error: false, message: "History panel wawancara berhasil dimuat", data: history };
};

module.exports = {
  previewDistribusiTahap2,
  autoDistribusiTahap2,
  manualDistribusiTahap2,
  reassignReviewerTahap2,
  reassignJuriTahap2,
  getPanelTahap2History,
};