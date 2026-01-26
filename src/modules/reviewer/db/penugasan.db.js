const pool = require("../../../config/db");

const getPenugasanDb = async (id_reviewer) => {
  const q = `
    SELECT
      d.id_distribusi,
      d.status,
      d.assigned_at,
      p.id_proposal,
      p.judul,
      p.modal_diajukan,
      k.nama_kategori,
      pr.nama_program
    FROM t_distribusi_reviewer d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN m_program pr ON pr.id_program = p.id_program
    WHERE d.id_reviewer = $1
    ORDER BY d.assigned_at DESC
  `;
  const { rows } = await pool.query(q, [id_reviewer]);
  return rows;
};

const getDetailPenugasanDb = async (id_distribusi) => {
  const q = `
    SELECT
      d.*,
      p.judul,
      p.file_proposal,
      p.modal_diajukan,
      k.nama_kategori,
      pr.nama_program,
      t.nama_tim
    FROM t_distribusi_reviewer d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN m_program pr ON pr.id_program = p.id_program
    WHERE d.id_distribusi = $1
  `;
  const { rows } = await pool.query(q, [id_distribusi]);
  return rows[0];
};

const updateStatusDistribusiDb = async (id_distribusi, status, catatan) => {
  const q = `
    UPDATE t_distribusi_reviewer
    SET status = $1,
        catatan_reviewer = $2,
        responded_at = now()
    WHERE id_distribusi = $3
    RETURNING *
  `;
  const { rows } = await pool.query(q, [status, catatan, id_distribusi]);
  return rows[0];
};

module.exports = {
  getPenugasanDb,
  getDetailPenugasanDb,
  updateStatusDistribusiDb,
};
