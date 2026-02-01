const pool = require("../../../config/db");

const getTahapAktifDb = async (id_program, urutan) => {
  const q = `
    SELECT id_tahap, status
    FROM m_tahap_penilaian
    WHERE id_program = $1
      AND urutan = $2
      AND status = 1
  `;
  const { rows } = await pool.query(q, [id_program, urutan]);
  return rows[0] || null;
};

const getPenugasanDb = async (id_reviewer, urutan) => {
  const q = `
    SELECT
      d.id_distribusi,
      d.status,
      d.tahap AS urutan_tahap,
      d.assigned_at,
      d.responded_at,

      p.id_program,
      p.id_proposal,
      p.judul,
      p.file_proposal,
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

  const { rows } = await pool.query(q, [id_reviewer, urutan]);
  return rows;
};

const getDetailPenugasanDb = async (id_distribusi, id_reviewer) => {
  const q = `
    SELECT
      d.id_distribusi,
      d.id_proposal,
      d.id_reviewer,
      d.status,
      d.tahap AS urutan_tahap,
      d.assigned_at,
      d.responded_at,
      d.catatan_reviewer,

      p.id_program,
      p.judul,
      p.file_proposal,
      p.modal_diajukan,
      p.status AS status_proposal,

      k.nama_kategori,
      pr.nama_program,
      tm.nama_tim

    FROM t_distribusi_reviewer d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN t_tim tm ON tm.id_tim = p.id_tim
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN m_program pr ON pr.id_program = p.id_program

    WHERE d.id_distribusi = $1
      AND d.id_reviewer = $2
  `;

  const { rows } = await pool.query(q, [id_distribusi, id_reviewer]);
  return rows[0] || null;
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
  return rows[0] || null;
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

  return rows[0] || null;
};

module.exports = {
  getTahapAktifDb,
  getPenugasanDb,
  getDetailPenugasanDb,
  acceptDistribusiDb,
  rejectDistribusiDb,
};
