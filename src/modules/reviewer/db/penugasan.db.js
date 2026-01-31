const pool = require("../../../config/db");

const getTahapAktifDb = async (tahap) => {
  const q = `
    SELECT id_tahap, status, penilaian_mulai, penilaian_selesai
    FROM m_tahap_penilaian
    WHERE id_tahap = $1
      AND status = 1
  `;
  const { rows } = await pool.query(q, [tahap]);
  return rows[0];
};

const getPenugasanDb = async (id_reviewer, tahap) => {
  const q = `
    SELECT
      d.id_distribusi,
      d.status,
      d.tahap,
      d.assigned_at,
      d.responded_at,
      p.id_proposal,
      p.judul,
      p.modal_diajukan,
      p.status AS status_proposal,
      k.nama_kategori,
      pr.nama_program
    FROM t_distribusi_reviewer d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN m_program pr ON pr.id_program = p.id_program
    WHERE d.id_reviewer = $1
      AND d.tahap = $2
    ORDER BY d.assigned_at DESC
  `;
  const { rows } = await pool.query(q, [id_reviewer, tahap]);
  return rows;
};

const getDetailPenugasanDb = async (id_distribusi, id_reviewer) => {
  const q = `
    SELECT
      d.id_distribusi,
      d.id_proposal,
      d.id_reviewer,
      d.status,
      d.tahap,
      d.assigned_at,
      d.responded_at,
      d.catatan_reviewer,
      p.judul,
      p.file_proposal,
      p.modal_diajukan,
      p.status AS status_proposal,
      k.nama_kategori,
      pr.nama_program,
      t.nama_tim
    FROM t_distribusi_reviewer d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN m_program pr ON pr.id_program = p.id_program
    WHERE d.id_distribusi = $1
      AND d.id_reviewer = $2
  `;
  const { rows } = await pool.query(q, [id_distribusi, id_reviewer]);
  return rows[0];
};

const acceptDistribusiDb = async (id_distribusi, id_reviewer) => {
  const q = `
    UPDATE t_distribusi_reviewer
    SET status = 1,
        responded_at = now()
    WHERE id_distribusi = $1
      AND id_reviewer = $2
      AND status = 0
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_distribusi, id_reviewer]);
  return rows[0];
};

const rejectDistribusiDb = async (id_distribusi, id_reviewer, catatan) => {
  const q = `
    UPDATE t_distribusi_reviewer
    SET status = 2,
        catatan_reviewer = $3,
        responded_at = now()
    WHERE id_distribusi = $1
      AND id_reviewer = $2
      AND status = 0
    RETURNING *
  `;
  const { rows } = await pool.query(q, [
    id_distribusi,
    id_reviewer,
    catatan,
  ]);
  return rows[0];
};

const rollbackStatusProposalDb = async (id_proposal) => {
  const q = `
    UPDATE t_proposal
    SET status = 1
    WHERE id_proposal = $1
      AND status = 2
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_proposal]);
  return rows[0];
};

module.exports = {
  getTahapAktifDb,
  getPenugasanDb,
  getDetailPenugasanDb,
  acceptDistribusiDb,
  rejectDistribusiDb,
  rollbackStatusProposalDb,
};
