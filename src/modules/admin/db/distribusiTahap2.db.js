const pool = require("../../../config/db");

const getTahap2AktifDb = async () => {
  const q = `
    SELECT id_tahap
    FROM m_tahap_penilaian
    WHERE id_tahap = 2
      AND status = 1
  `;
  const { rows } = await pool.query(q);
  return rows[0] || null;
};

const getProposalTahap2Db = async () => {
  const q = `
    SELECT id_proposal, judul
    FROM t_proposal
    WHERE status = 4
    ORDER BY id_proposal
  `;
  const { rows } = await pool.query(q);
  return rows;
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

const getJuriAktifDb = async () => {
  const q = `
    SELECT j.id_user, u.nama_lengkap
    FROM m_juri j
    JOIN m_user u ON u.id_user = j.id_user
    WHERE u.is_active = true
    ORDER BY u.nama_lengkap
  `;
  const { rows } = await pool.query(q);
  return rows;
};

const insertReviewerTahap2Db = async (
  client,
  id_proposal,
  id_reviewer,
  admin_id
) => {
  const q = `
    INSERT INTO t_distribusi_reviewer
      (id_proposal, id_reviewer, tahap, assigned_by)
    VALUES ($1,$2,2,$3)
    ON CONFLICT (id_proposal, id_reviewer, tahap)
    DO NOTHING
    RETURNING *
  `;
  const { rows } = await client.query(q, [
    id_proposal,
    id_reviewer,
    admin_id,
  ]);
  return rows[0] || null;
};

const insertJuriTahap2Db = async (
  client,
  id_proposal,
  id_juri,
  admin_id
) => {
  const q = `
    INSERT INTO t_distribusi_juri
      (id_proposal, id_juri, tahap, assigned_by)
    VALUES ($1,$2,2,$3)
    ON CONFLICT (id_proposal, id_juri, tahap)
    DO NOTHING
    RETURNING *
  `;
  const { rows } = await client.query(q, [
    id_proposal,
    id_juri,
    admin_id,
  ]);
  return rows[0] || null;
};

module.exports = {
  getTahap2AktifDb,
  getProposalTahap2Db,
  getReviewerAktifDb,
  getJuriAktifDb,
  insertReviewerTahap2Db,
  insertJuriTahap2Db,
};
