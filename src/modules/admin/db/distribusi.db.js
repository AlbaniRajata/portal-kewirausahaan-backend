const pool = require("../../../config/db");

const getTahapAktifDb = async (tahap) => {
  const q = `
    SELECT id_tahap, status
    FROM m_tahap_penilaian
    WHERE id_tahap = $1
      AND status = 1
  `;
  const { rows } = await pool.query(q, [tahap]);
  return rows[0];
};

const getReviewerAktifDb = async () => {
  const q = `
    SELECT r.id_user, u.nama_lengkap
    FROM m_reviewer r
    JOIN m_user u ON u.id_user = r.id_user
    WHERE u.is_active = true
    ORDER BY u.nama_lengkap
  `;
  const { rows } = await pool.query(q);
  return rows;
};

const checkReviewerValidDb = async (id_reviewer) => {
  const q = `
    SELECT 1
    FROM m_reviewer r
    JOIN m_user u ON u.id_user = r.id_user
    WHERE r.id_user = $1
      AND u.is_active = true
  `;
  const { rows } = await pool.query(q, [id_reviewer]);
  return rows.length > 0;
};

const getProposalSiapDistribusiDb = async (tahap) => {
  const q = `
    SELECT
      p.id_proposal,
      p.judul,
      p.modal_diajukan,
      p.status,
      p.tanggal_submit,
      t.id_tim,
      t.nama_tim,
      pr.id_program,
      pr.nama_program,
      k.id_kategori,
      k.nama_kategori
    FROM t_proposal p
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_program pr ON pr.id_program = p.id_program
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    WHERE p.status = 1
      AND NOT EXISTS (
        SELECT 1
        FROM t_distribusi_reviewer d
        WHERE d.id_proposal = p.id_proposal
          AND d.tahap = $1
      )
    ORDER BY p.id_proposal
  `;
  const { rows } = await pool.query(q, [tahap]);
  return rows;
};

const lockProposalForDistribusiDb = async (client, id_proposal, tahap) => {
  const q = `
    SELECT p.id_proposal
    FROM t_proposal p
    WHERE p.id_proposal = $1
      AND p.status = 1
      AND NOT EXISTS (
        SELECT 1 FROM t_distribusi_reviewer d
        WHERE d.id_proposal = p.id_proposal
          AND d.tahap = $2
      )
    FOR UPDATE
  `;
  const { rows } = await client.query(q, [id_proposal, tahap]);
  return rows.length > 0;
};

const insertDistribusiDb = async (client, data) => {
  const q = `
    INSERT INTO t_distribusi_reviewer
      (id_proposal, id_reviewer, tahap, assigned_by)
    VALUES ($1,$2,$3,$4)
    RETURNING *
  `;
  const { rows } = await client.query(q, data);
  return rows[0];
};

const updateStatusProposalDistribusiDb = async (client, id_proposal) => {
  const q = `
    UPDATE t_proposal
    SET status = 2
    WHERE id_proposal = $1
      AND status = 1
    RETURNING *
  `;
  const { rows } = await client.query(q, [id_proposal]);
  return rows[0];
};

module.exports = {
  getTahapAktifDb,
  getReviewerAktifDb,
  checkReviewerValidDb,
  getProposalSiapDistribusiDb,
  lockProposalForDistribusiDb,
  insertDistribusiDb,
  updateStatusProposalDistribusiDb,
};
