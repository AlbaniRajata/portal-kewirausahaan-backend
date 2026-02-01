const pool = require("../../../config/db");

const getRekapReviewerTahap1Db = async (id_program, id_proposal) => {
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

    WHERE pr.id_program = $1
      AND pr.id_proposal = $2
      AND p.id_tahap = 1
      AND p.status = 1

    ORDER BY id_reviewer, k.urutan
  `;

  const { rows } = await pool.query(q, [id_program, id_proposal]);
  return rows;
};

const countDistribusiReviewerTahap1Db = async (id_program, id_proposal) => {
  const q = `
    SELECT COUNT(*)::int AS total
    FROM t_distribusi_reviewer dr
    JOIN t_proposal p ON p.id_proposal = dr.id_proposal

    WHERE p.id_program = $1
      AND dr.id_proposal = $2
      AND dr.tahap = 1
      AND dr.status IN (1,3)
  `;

  const { rows } = await pool.query(q, [id_program, id_proposal]);
  return rows[0].total;
};

const countSubmittedReviewerTahap1Db = async (id_program, id_proposal) => {
  const q = `
    SELECT COUNT(*)::int AS total
    FROM t_penilaian_reviewer pr
    JOIN t_distribusi_reviewer dr ON dr.id_distribusi = pr.id_distribusi
    JOIN t_proposal p ON p.id_proposal = dr.id_proposal

    WHERE p.id_program = $1
      AND dr.id_proposal = $2
      AND pr.id_tahap = 1
      AND pr.status = 1
  `;

  const { rows } = await pool.query(q, [id_program, id_proposal]);
  return rows[0].total;
};

const updateStatusProposalTahap1Db = async (id_program, id_proposal, status) => {
  const q = `
    UPDATE t_proposal
    SET status = $3
    WHERE id_program = $1
      AND id_proposal = $2
    RETURNING *
  `;

  const { rows } = await pool.query(q, [id_program, id_proposal, status]);
  return rows[0];
};

const countDistribusiPanelTahap2Db = async (id_program, id_proposal) => {
  const q = `
    SELECT
      (
        SELECT COUNT(*)
        FROM t_distribusi_reviewer dr
        JOIN t_proposal p ON p.id_proposal = dr.id_proposal
        WHERE p.id_program = $1
          AND dr.id_proposal = $2
          AND dr.tahap = 2
      )
      +
      (
        SELECT COUNT(*)
        FROM t_distribusi_juri dj
        JOIN t_proposal p ON p.id_proposal = dj.id_proposal
        WHERE p.id_program = $1
          AND dj.id_proposal = $2
          AND dj.tahap = 2
      ) AS total
  `;

  const { rows } = await pool.query(q, [id_program, id_proposal]);
  return Number(rows[0].total);
};

const countSubmittedPanelTahap2Db = async (id_program, id_proposal) => {
  const q = `
    SELECT
      (
        SELECT COUNT(*)
        FROM t_penilaian_reviewer pr
        JOIN t_distribusi_reviewer dr ON dr.id_distribusi = pr.id_distribusi
        JOIN t_proposal p ON p.id_proposal = dr.id_proposal

        WHERE p.id_program = $1
          AND dr.id_proposal = $2
          AND pr.id_tahap = 2
          AND pr.status = 1
      )
      +
      (
        SELECT COUNT(*)
        FROM t_penilaian_juri pj
        JOIN t_distribusi_juri dj ON dj.id_distribusi = pj.id_distribusi
        JOIN t_proposal p ON p.id_proposal = dj.id_proposal

        WHERE p.id_program = $1
          AND dj.id_proposal = $2
          AND pj.id_tahap = 2
          AND pj.status = 1
      ) AS total
  `;

  const { rows } = await pool.query(q, [id_program, id_proposal]);
  return Number(rows[0].total);
};

const updateStatusProposalTahap2Db = async (id_program, id_proposal, status) => {
  const q = `
    UPDATE t_proposal
    SET status = $3
    WHERE id_program = $1
      AND id_proposal = $2
    RETURNING *
  `;

  const { rows } = await pool.query(q, [id_program, id_proposal, status]);
  return rows[0];
};

const getRekapReviewerTahap2Db = async (id_program, id_proposal) => {
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

    WHERE pr.id_program = $1
      AND pr.id_proposal = $2
      AND p.id_tahap = 2
      AND p.status = 1

    ORDER BY id_reviewer, k.urutan
  `;

  const { rows } = await pool.query(q, [id_program, id_proposal]);
  return rows;
};

const getRekapJuriTahap2Db = async (id_program, id_proposal) => {
  const q = `
    SELECT
      pr.id_proposal,
      pr.judul,

      p.id_penilaian,
      p.submitted_at,

      u.id_user AS id_juri,
      u.nama_lengkap AS nama_juri,

      k.id_kriteria,
      k.nama_kriteria,
      k.bobot,

      d.skor,
      d.nilai,
      d.catatan

    FROM t_penilaian_juri p
    JOIN t_distribusi_juri dj ON dj.id_distribusi = p.id_distribusi
    JOIN m_user u ON u.id_user = dj.id_juri
    JOIN t_proposal pr ON pr.id_proposal = dj.id_proposal
    JOIN t_penilaian_juri_detail d ON d.id_penilaian = p.id_penilaian
    JOIN m_kriteria_penilaian k ON k.id_kriteria = d.id_kriteria

    WHERE pr.id_program = $1
      AND pr.id_proposal = $2
      AND p.id_tahap = 2
      AND p.status = 1

    ORDER BY id_juri, k.urutan
  `;

  const { rows } = await pool.query(q, [id_program, id_proposal]);
  return rows;
};

module.exports = {
  getRekapReviewerTahap1Db,
  countDistribusiReviewerTahap1Db,
  countSubmittedReviewerTahap1Db,
  updateStatusProposalTahap1Db,

  countDistribusiPanelTahap2Db,
  countSubmittedPanelTahap2Db,
  updateStatusProposalTahap2Db,

  getRekapReviewerTahap2Db,
  getRekapJuriTahap2Db,
};
