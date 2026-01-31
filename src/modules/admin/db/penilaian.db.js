const pool = require("../../../config/db");

const getRekapReviewerTahap1Db = async (id_proposal) => {
  const q = `
    SELECT
      pr.id_proposal,
      pr.judul,

      p.id_penilaian,
      p.submitted_at,

      u.id_user AS id_reviewer,
      u.nama_lengkap AS nama_reviewer,

      k.id_kriteria,
      k.nama_kriteria,
      k.bobot,

      d.skor,
      d.nilai,
      d.catatan

    FROM t_penilaian_reviewer p
    JOIN t_distribusi_reviewer dr ON dr.id_distribusi = p.id_distribusi
    JOIN m_user u ON u.id_user = dr.id_reviewer
    JOIN t_proposal pr ON pr.id_proposal = dr.id_proposal
    JOIN t_penilaian_reviewer_detail d ON d.id_penilaian = p.id_penilaian
    JOIN m_kriteria_penilaian k ON k.id_kriteria = d.id_kriteria

    WHERE pr.id_proposal = $1
      AND p.id_tahap = 1
      AND p.status = 1

    ORDER BY id_reviewer, k.urutan
  `;

  const { rows } = await pool.query(q, [id_proposal]);
  return rows;
};

const countDistribusiReviewerTahap1Db = async (id_proposal) => {
  const q = `
    SELECT COUNT(*)::int AS total
    FROM t_distribusi_reviewer
    WHERE id_proposal = $1
      AND tahap = 1
      AND status IN (1,3)
  `;

  const { rows } = await pool.query(q, [id_proposal]);
  return rows[0].total;
};

const countSubmittedReviewerTahap1Db = async (id_proposal) => {
  const q = `
    SELECT COUNT(*)::int AS total
    FROM t_penilaian_reviewer p
    JOIN t_distribusi_reviewer d ON d.id_distribusi = p.id_distribusi
    WHERE d.id_proposal = $1
      AND p.id_tahap = 1
      AND p.status = 1
  `;

  const { rows } = await pool.query(q, [id_proposal]);
  return rows[0].total;
};

const updateStatusProposalDb = async (id_proposal, status) => {
  const q = `
    UPDATE t_proposal
    SET status = $2
    WHERE id_proposal = $1
    RETURNING *
  `;

  const { rows } = await pool.query(q, [id_proposal, status]);
  return rows[0];
};

module.exports = {
  getRekapReviewerTahap1Db,
  countDistribusiReviewerTahap1Db,
  countSubmittedReviewerTahap1Db,
  updateStatusProposalDb,
};
