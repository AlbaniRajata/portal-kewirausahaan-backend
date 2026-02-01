const pool = require("../../../config/db");

const getTahap2AktifDb = async (id_program) => {
  const q = `
    SELECT id_tahap
    FROM m_tahap_penilaian
    WHERE id_program = $1
      AND urutan = 2
      AND status = 1
  `;
  const { rows } = await pool.query(q, [id_program]);
  return rows[0] || null;
};

const getProposalTahap2Db = async (id_program) => {
  const q = `
    SELECT id_proposal, judul
    FROM t_proposal
    WHERE status = 5
      AND id_program = $1
    ORDER BY id_proposal
  `;
  const { rows } = await pool.query(q, [id_program]);
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
  id_tahap,
  admin_id,
) => {
  const q = `
    INSERT INTO t_distribusi_reviewer
      (id_proposal, id_reviewer, tahap, assigned_by)
    VALUES ($1,$2,$3,$4)
    ON CONFLICT (id_proposal, id_reviewer, tahap)
    DO NOTHING
    RETURNING *
  `;
  const { rows } = await client.query(q, [id_proposal, id_reviewer, id_tahap, admin_id]);
  return rows[0] || null;
};

const insertJuriTahap2Db = async (client, id_proposal, id_juri, id_tahap, admin_id) => {
  const q = `
    INSERT INTO t_distribusi_juri
      (id_proposal, id_juri, tahap, assigned_by)
    VALUES ($1,$2,$3,$4)
    ON CONFLICT (id_proposal, id_juri, tahap)
    DO NOTHING
    RETURNING *
  `;
  const { rows } = await client.query(q, [id_proposal, id_juri, id_tahap, admin_id]);
  return rows[0] || null;
};

const updateProposalStatusPanelDb = async (client, id_tahap, id_proposal) => {
  const q = `
    UPDATE t_proposal
    SET status = 6
    WHERE id_proposal = $1
      AND id_program = $2
      AND status = 5
    RETURNING *
  `;
  const { rows } = await client.query(q, [id_proposal, id_tahap]);
  return rows[0] || null;
};

module.exports = {
  getTahap2AktifDb,
  getProposalTahap2Db,
  getReviewerAktifDb,
  getJuriAktifDb,
  insertReviewerTahap2Db,
  insertJuriTahap2Db,
  updateProposalStatusPanelDb,
};
