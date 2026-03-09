const pool = require("../../../config/db");

const getTahap2AktifDb = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT id_tahap FROM m_tahap_penilaian
     WHERE id_program = $1 AND urutan = 2 AND status = 1`,
    [id_program]
  );
  return rows[0] || null;
};

const getProposalTahap2Db = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT id_proposal, judul FROM t_proposal
     WHERE status = 4 AND id_program = $1
     ORDER BY id_proposal`,
    [id_program]
  );
  return rows;
};

const getReviewerAktifDb = async () => {
  const { rows } = await pool.query(
    `SELECT r.id_user, u.nama_lengkap, r.institusi, r.bidang_keahlian
     FROM m_reviewer r
     JOIN m_user u ON u.id_user = r.id_user
     WHERE u.is_active = true
     ORDER BY u.nama_lengkap`
  );
  return rows;
};

const getJuriAktifDb = async () => {
  const { rows } = await pool.query(
    `SELECT j.id_user, u.nama_lengkap, u.email
     FROM m_juri j
     JOIN m_user u ON u.id_user = j.id_user
     WHERE u.is_active = true
     ORDER BY u.nama_lengkap`
  );
  return rows;
};

const insertReviewerTahap2Db = async (client, id_proposal, id_reviewer, id_tahap, admin_id) => {
  const { rows } = await client.query(
    `INSERT INTO t_distribusi_reviewer (id_proposal, id_reviewer, tahap, assigned_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id_proposal, id_reviewer, tahap) DO NOTHING
     RETURNING *`,
    [id_proposal, id_reviewer, id_tahap, admin_id]
  );
  return rows[0] || null;
};

const insertJuriTahap2Db = async (client, id_proposal, id_juri, id_tahap, admin_id) => {
  const { rows } = await client.query(
    `INSERT INTO t_distribusi_juri (id_proposal, id_juri, tahap, assigned_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id_proposal, id_juri, tahap) DO NOTHING
     RETURNING *`,
    [id_proposal, id_juri, id_tahap, admin_id]
  );
  return rows[0] || null;
};

const updateProposalStatusPanelDb = async (client, id_program, id_proposal) => {
  const { rows } = await client.query(
    `UPDATE t_proposal SET status = 5
     WHERE id_proposal = $1 AND id_program = $2 AND status = 4
     RETURNING *`,
    [id_proposal, id_program]
  );
  return rows[0] || null;
};

const getDistribusiReviewerHistoryTahap2Db = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT
      d.id_distribusi, d.id_proposal, p.judul, t.nama_tim,
      d.id_reviewer, u.nama_lengkap AS nama_reviewer, r.institusi,
      d.tahap, d.status, d.assigned_at, d.assigned_by,
      admin.nama_lengkap AS admin_name,
      d.responded_at, d.catatan_reviewer
     FROM t_distribusi_reviewer d
     JOIN t_proposal p ON p.id_proposal = d.id_proposal
     JOIN t_tim t ON t.id_tim = p.id_tim
     JOIN m_reviewer r ON r.id_user = d.id_reviewer
     JOIN m_user u ON u.id_user = r.id_user
     JOIN m_user admin ON admin.id_user = d.assigned_by
     WHERE p.id_program = $1 AND d.tahap = 2 AND d.status != 3
     ORDER BY d.assigned_at DESC`,
    [id_program]
  );
  return rows;
};

const getDistribusiJuriHistoryTahap2Db = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT
      d.id_distribusi, d.id_proposal, p.judul, t.nama_tim,
      d.id_juri, u.nama_lengkap AS nama_juri,
      d.tahap, d.status, d.assigned_at, d.assigned_by,
      admin.nama_lengkap AS admin_name,
      d.responded_at, d.catatan_juri
     FROM t_distribusi_juri d
     JOIN t_proposal p ON p.id_proposal = d.id_proposal
     JOIN t_tim t ON t.id_tim = p.id_tim
     JOIN m_juri j ON j.id_user = d.id_juri
     JOIN m_user u ON u.id_user = j.id_user
     JOIN m_user admin ON admin.id_user = d.assigned_by
     WHERE p.id_program = $1 AND d.tahap = 2 AND d.status != 3
     ORDER BY d.assigned_at DESC`,
    [id_program]
  );
  return rows;
};

module.exports = {
  getTahap2AktifDb,
  getProposalTahap2Db,
  getReviewerAktifDb,
  getJuriAktifDb,
  insertReviewerTahap2Db,
  insertJuriTahap2Db,
  updateProposalStatusPanelDb,
  getDistribusiReviewerHistoryTahap2Db,
  getDistribusiJuriHistoryTahap2Db,
};