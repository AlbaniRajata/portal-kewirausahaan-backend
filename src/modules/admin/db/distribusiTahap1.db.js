const pool = require("../../../config/db");

// ============ EXISTING FUNCTIONS ============

const getTahapAktifDb = async (id_program, urutan) => {
  const q = `
    SELECT id_tahap, urutan, status
    FROM m_tahap_penilaian
    WHERE id_program = $1
      AND urutan = $2
      AND status = 1
  `;
  const { rows } = await pool.query(q, [id_program, urutan]);
  return rows[0] || null;
};

const getReviewerAktifDb = async () => {
  const q = `
    SELECT r.id_user, u.nama_lengkap, r.institusi, r.bidang_keahlian
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

const getProposalSiapDistribusiDb = async (id_program, tahap) => {
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
      AND p.id_program = $1
      AND NOT EXISTS (
        SELECT 1
        FROM t_distribusi_reviewer d
        WHERE d.id_proposal = p.id_proposal
          AND d.tahap = $2
      )
    ORDER BY p.id_proposal
  `;

  const { rows } = await pool.query(q, [id_program, tahap]);
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

const getReviewerByIdDb = async (id_reviewer) => {
  const q = `
    SELECT 
      r.id_user,
      u.nama_lengkap,
      r.institusi,
      r.bidang_keahlian,
      u.is_active
    FROM m_reviewer r
    JOIN m_user u ON u.id_user = r.id_user
    WHERE r.id_user = $1
  `;
  const { rows } = await pool.query(q, [id_reviewer]);
  return rows[0] || null;
};

const getProposalBasicDb = async (id_proposal) => {
  const q = `
    SELECT 
      p.id_proposal,
      p.judul,
      p.id_program,
      t.nama_tim
    FROM t_proposal p
    JOIN t_tim t ON t.id_tim = p.id_tim
    WHERE p.id_proposal = $1
  `;
  const { rows } = await pool.query(q, [id_proposal]);
  return rows[0] || null;
};

const getDistribusiHistoryDb = async (id_program, tahap) => {
  const q = `
    SELECT 
      d.id_distribusi,
      d.id_proposal,
      p.judul,
      t.nama_tim,
      d.id_reviewer,
      u.nama_lengkap as nama_reviewer,
      r.institusi,
      d.tahap,
      d.status,
      d.assigned_at,
      d.assigned_by,
      admin.nama_lengkap as admin_name,
      d.responded_at,
      d.catatan_reviewer
    FROM t_distribusi_reviewer d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_reviewer r ON r.id_user = d.id_reviewer
    JOIN m_user u ON u.id_user = r.id_user
    JOIN m_user admin ON admin.id_user = d.assigned_by
    WHERE p.id_program = $1 
      AND d.tahap = $2
      AND d.status != 3
    ORDER BY d.assigned_at DESC
  `;
  
  const { rows } = await pool.query(q, [id_program, tahap]);
  return rows;
};

const getDistribusiByIdDb = async (id_distribusi) => {
  const q = `
    SELECT 
      d.*,
      p.id_program,
      p.status as proposal_status,
      p.judul,
      u.nama_lengkap as reviewer_name
    FROM t_distribusi_reviewer d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN m_user u ON u.id_user = d.id_reviewer
    WHERE d.id_distribusi = $1
  `;
  const { rows } = await pool.query(q, [id_distribusi]);
  return rows[0] || null;
};

const getDistribusiDetailDb = async (id_distribusi) => {
  const q = `
    SELECT 
      d.id_distribusi,
      d.id_proposal,
      d.id_reviewer,
      d.tahap,
      d.status,
      d.assigned_at,
      d.assigned_by,
      d.responded_at,
      d.catatan_reviewer,
      p.judul,
      p.modal_diajukan,
      p.id_program,
      t.nama_tim,
      u_reviewer.nama_lengkap as nama_reviewer,
      r.institusi,
      r.bidang_keahlian,
      u_admin.nama_lengkap as admin_name,
      pr.keterangan,
      k.nama_kategori,
      tp.nama_tahap
    FROM t_distribusi_reviewer d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_reviewer r ON r.id_user = d.id_reviewer
    JOIN m_user u_reviewer ON u_reviewer.id_user = r.id_user
    JOIN m_user u_admin ON u_admin.id_user = d.assigned_by
    JOIN m_program pr ON pr.id_program = p.id_program
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    LEFT JOIN m_tahap_penilaian tp ON tp.id_program = p.id_program AND tp.urutan = d.tahap
    WHERE d.id_distribusi = $1
  `;
  const { rows } = await pool.query(q, [id_distribusi]);
  return rows[0] || null;
};

const updateDistribusiStatusDb = async (client, id_distribusi, status) => {
  const q = `
    UPDATE t_distribusi_reviewer
    SET status = $2
    WHERE id_distribusi = $1
    RETURNING *
  `;
  const { rows } = await client.query(q, [id_distribusi, status]);
  return rows[0];
};

const updateProposalStatusDb = async (client, id_proposal, status) => {
  const q = `
    UPDATE t_proposal
    SET status = $2
    WHERE id_proposal = $1
    RETURNING *
  `;
  const { rows } = await client.query(q, [id_proposal, status]);
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
  getReviewerByIdDb,
  getProposalBasicDb,
  getDistribusiHistoryDb,
  getDistribusiByIdDb,
  getDistribusiDetailDb,
  updateDistribusiStatusDb,
  updateProposalStatusDb,
};