const pool = require("../../../config/db");

const getDashboardStatsDb = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT
      COUNT(*) FILTER (WHERE p.status >= 1)                          AS total_proposal,
      COUNT(*) FILTER (WHERE p.status IN (2, 3, 4))                  AS total_tahap1,
      COUNT(*) FILTER (WHERE p.status = 4)                           AS lolos_desk,
      COUNT(*) FILTER (WHERE p.status = 3)                           AS tidak_lolos_desk,
      COUNT(*) FILTER (WHERE p.status IN (5, 6, 7, 8))               AS total_tahap2,
      COUNT(*) FILTER (WHERE p.status IN (7, 8))                     AS lolos_wawancara,
      COUNT(*) FILTER (WHERE p.status = 6)                           AS tidak_lolos_wawancara,
      COUNT(*) FILTER (WHERE p.status = 1)                           AS menunggu_distribusi,
      COUNT(*) FILTER (WHERE p.status IN (8, 9))                     AS total_bimbingan
     FROM t_proposal p
     WHERE p.id_program = $1`,
    [id_program]
  );
  return rows[0];
};

const getProposalPerStatusDb = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT p.status, COUNT(*)::int AS total
     FROM t_proposal p
     WHERE p.id_program = $1 AND p.status >= 1
     GROUP BY p.status
     ORDER BY p.status ASC`,
    [id_program]
  );
  return rows;
};

const getProposalPerKategoriDb = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT k.nama_kategori, COUNT(p.id_proposal)::int AS total
     FROM t_proposal p
     JOIN m_kategori k ON k.id_kategori = p.id_kategori
     WHERE p.id_program = $1 AND p.status >= 1
     GROUP BY k.id_kategori, k.nama_kategori
     ORDER BY total DESC`,
    [id_program]
  );
  return rows;
};

const getRecentProposalDb = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT
      p.id_proposal, p.judul, p.status, p.tanggal_submit,
      t.nama_tim, k.nama_kategori
     FROM t_proposal p
     JOIN t_tim t ON t.id_tim = p.id_tim
     JOIN m_kategori k ON k.id_kategori = p.id_kategori
     WHERE p.id_program = $1 AND p.status >= 1
     ORDER BY p.tanggal_submit DESC
     LIMIT 5`,
    [id_program]
  );
  return rows;
};

const getPendingDistribusiDb = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM t_distribusi_reviewer dr
     JOIN t_proposal p ON p.id_proposal = dr.id_proposal
     WHERE p.id_program = $1 AND dr.status = 2`,
    [id_program]
  );
  return rows[0].total;
};

const getDistribusiDitolakDb = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM t_distribusi_reviewer dr
     JOIN t_proposal p ON p.id_proposal = dr.id_proposal
     WHERE p.id_program = $1 AND dr.status = 2
       AND dr.id_distribusi IN (
         SELECT id_distribusi FROM t_penilaian_reviewer WHERE status = 2
       )`,
    [id_program]
  );
  return rows[0].total;
};

const getPendingVerifikasiDb = async () => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM m_user u
     JOIN m_role r ON r.id_role = u.id_role
     WHERE u.email_verified_at IS NULL
     AND u.is_active = true
     AND r.nama_role IN ('mahasiswa','dosen')`
  );

  return rows[0].total;
};

const getPendingPembimbingDb = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM t_pengajuan_pembimbing
     WHERE id_program = $1
     AND status = 0`,
    [id_program]
  );
  return rows[0].total;
};

const getMenungguFinalisasiDb = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM (
       SELECT p.id_proposal
       FROM t_proposal p
       WHERE p.id_program = $1 AND p.status = 2
         AND (
           SELECT COUNT(*) FROM t_distribusi_reviewer dr
           WHERE dr.id_proposal = p.id_proposal AND dr.status IN (1,3,4)
         ) > 0
         AND (
           SELECT COUNT(*) FROM t_distribusi_reviewer dr
           WHERE dr.id_proposal = p.id_proposal AND dr.status IN (1,3,4)
         ) = (
           SELECT COUNT(*) FROM t_penilaian_reviewer pr
           JOIN t_distribusi_reviewer dr ON dr.id_distribusi = pr.id_distribusi
           WHERE dr.id_proposal = p.id_proposal AND pr.status = 1
         )
       UNION
       SELECT p.id_proposal
       FROM t_proposal p
       WHERE p.id_program = $1 AND p.status = 5
         AND (
           SELECT COUNT(*) FROM t_distribusi_reviewer dr
           JOIN m_tahap_penilaian tp ON tp.id_program = p.id_program AND tp.urutan = dr.tahap AND tp.urutan = 2
           WHERE dr.id_proposal = p.id_proposal AND dr.status IN (1,3,4)
         ) + (
           SELECT COUNT(*) FROM t_distribusi_juri dj
           JOIN m_tahap_penilaian tp ON tp.id_program = p.id_program AND tp.urutan = dj.tahap AND tp.urutan = 2
           WHERE dj.id_proposal = p.id_proposal AND dj.status IN (1,3,4)
         ) > 0
     ) sub`,
    [id_program]
  );
  return rows[0].total;
};

module.exports = {
  getDashboardStatsDb,
  getProposalPerStatusDb,
  getProposalPerKategoriDb,
  getRecentProposalDb,
  getPendingDistribusiDb,
  getDistribusiDitolakDb,
  getPendingVerifikasiDb,
  getPendingPembimbingDb,
  getMenungguFinalisasiDb,
};