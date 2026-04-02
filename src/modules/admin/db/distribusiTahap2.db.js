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
     WHERE status IN (4, 5) AND id_program = $1
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

const getReviewerByIdDb = async (id_reviewer) => {
  const { rows } = await pool.query(
    `SELECT r.id_user, u.nama_lengkap, u.is_active
     FROM m_reviewer r
     JOIN m_user u ON u.id_user = r.id_user
     WHERE r.id_user = $1`,
    [id_reviewer]
  );
  return rows[0] || null;
};

const getJuriByIdDb = async (id_juri) => {
  const { rows } = await pool.query(
    `SELECT j.id_user, u.nama_lengkap, u.is_active
     FROM m_juri j
     JOIN m_user u ON u.id_user = j.id_user
     WHERE j.id_user = $1`,
    [id_juri]
  );
  return rows[0] || null;
};

const getDistribusiAktifReviewerByProposalDb = async (id_proposal, tahap) => {
  const { rows } = await pool.query(
    `SELECT d.*, u.nama_lengkap AS reviewer_name
     FROM t_distribusi_reviewer d
     JOIN m_user u ON u.id_user = d.id_reviewer
     WHERE d.id_proposal = $1 AND d.tahap = $2
       AND d.status NOT IN (2, 5)`,
    [id_proposal, tahap]
  );
  return rows[0] || null;
};

const getDistribusiAktifJuriByProposalDb = async (id_proposal, tahap) => {
  const { rows } = await pool.query(
    `SELECT d.*, u.nama_lengkap AS juri_name
     FROM t_distribusi_juri d
     JOIN m_user u ON u.id_user = d.id_juri
     WHERE d.id_proposal = $1 AND d.tahap = $2
       AND d.status NOT IN (2, 5)`,
    [id_proposal, tahap]
  );
  return rows[0] || null;
};

const getDistribusiReviewerByIdDb = async (id_distribusi) => {
  const { rows } = await pool.query(
    `SELECT d.*, p.id_program, p.judul, u.nama_lengkap AS reviewer_name
     FROM t_distribusi_reviewer d
     JOIN t_proposal p ON p.id_proposal = d.id_proposal
     JOIN m_user u ON u.id_user = d.id_reviewer
     WHERE d.id_distribusi = $1`,
    [id_distribusi]
  );
  return rows[0] || null;
};

const getDistribusiJuriByIdDb = async (id_distribusi) => {
  const { rows } = await pool.query(
    `SELECT d.*, p.id_program, p.judul, u.nama_lengkap AS juri_name
     FROM t_distribusi_juri d
     JOIN t_proposal p ON p.id_proposal = d.id_proposal
     JOIN m_user u ON u.id_user = d.id_juri
     WHERE d.id_distribusi = $1`,
    [id_distribusi]
  );
  return rows[0] || null;
};

const insertReviewerTahap2Db = async (client, id_proposal, id_reviewer, id_tahap, admin_id) => {
  const { rows } = await client.query(
    `INSERT INTO t_distribusi_reviewer (id_proposal, id_reviewer, tahap, assigned_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id_proposal, id_reviewer, id_tahap, admin_id]
  );
  return rows[0] || null;
};

const insertJuriTahap2Db = async (client, id_proposal, id_juri, id_tahap, admin_id) => {
  const { rows } = await client.query(
    `INSERT INTO t_distribusi_juri (id_proposal, id_juri, tahap, assigned_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id_proposal, id_juri, id_tahap, admin_id]
  );
  return rows[0] || null;
};

const updateDistribusiReviewerStatusDb = async (client, id_distribusi, status) => {
  const { rows } = await client.query(
    `UPDATE t_distribusi_reviewer SET status = $2
     WHERE id_distribusi = $1 RETURNING *`,
    [id_distribusi, status]
  );
  return rows[0] || null;
};

const updateDistribusiJuriStatusDb = async (client, id_distribusi, status) => {
  const { rows } = await client.query(
    `UPDATE t_distribusi_juri SET status = $2
     WHERE id_distribusi = $1 RETURNING *`,
    [id_distribusi, status]
  );
  return rows[0] || null;
};

const reaktifkanDistribusiReviewerDb = async (client, id_distribusi, assigned_by) => {
  const { rows } = await client.query(
    `UPDATE t_distribusi_reviewer
     SET status = 0, assigned_by = $2, assigned_at = NOW(), responded_at = NULL, catatan_reviewer = NULL
     WHERE id_distribusi = $1 RETURNING *`,
    [id_distribusi, assigned_by]
  );
  return rows[0] || null;
};

const reaktifkanDistribusiJuriDb = async (client, id_distribusi, assigned_by) => {
  const { rows } = await client.query(
    `UPDATE t_distribusi_juri
     SET status = 0, assigned_by = $2, assigned_at = NOW(), responded_at = NULL, catatan_juri = NULL
     WHERE id_distribusi = $1 RETURNING *`,
    [id_distribusi, assigned_by]
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

const getPanelTahap2HistoryDb = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT
      p.id_proposal,
      p.judul,
      t.nama_tim,
      p.status AS status_proposal,
      dr.id_distribusi AS id_distribusi_reviewer,
      dr.id_reviewer AS id_reviewer,
      ur.nama_lengkap AS nama_reviewer,
      dr.status AS status_reviewer,
      dr.assigned_at AS assigned_at_reviewer,
      dj.id_distribusi AS id_distribusi_juri,
      dj.id_juri AS id_juri,
      uj.nama_lengkap AS nama_juri,
      dj.status AS status_juri,
      dj.assigned_at AS assigned_at_juri
     FROM t_proposal p
     JOIN t_tim t ON t.id_tim = p.id_tim
     LEFT JOIN t_distribusi_reviewer dr ON dr.id_proposal = p.id_proposal
       AND dr.tahap = 2 AND dr.status NOT IN (2, 5)
     LEFT JOIN m_user ur ON ur.id_user = dr.id_reviewer
     LEFT JOIN t_distribusi_juri dj ON dj.id_proposal = p.id_proposal
       AND dj.tahap = 2 AND dj.status NOT IN (2, 5)
     LEFT JOIN m_user uj ON uj.id_user = dj.id_juri
     WHERE p.id_program = $1 AND p.status IN (4, 5)
     ORDER BY p.id_proposal ASC`,
    [id_program]
  );
  return rows;
};

const getDistribusiReviewerByProposalUserDb = async (client, id_proposal, id_reviewer, tahap) => {
  const { rows } = await client.query(
    `SELECT * FROM t_distribusi_reviewer
     WHERE id_proposal = $1 AND id_reviewer = $2 AND tahap = $3`,
    [id_proposal, id_reviewer, tahap]
  );
  return rows[0] || null;
};

const getDistribusiJuriByProposalUserDb = async (client, id_proposal, id_juri, tahap) => {
  const { rows } = await client.query(
    `SELECT * FROM t_distribusi_juri
     WHERE id_proposal = $1 AND id_juri = $2 AND tahap = $3`,
    [id_proposal, id_juri, tahap]
  );
  return rows[0] || null;
};

module.exports = {
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
};