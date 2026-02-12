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

const getPenugasanDb = async (id_juri, urutan, status_filter = null) => {
  const values = [id_juri, urutan];
  let statusClause = "";

  if (status_filter !== null && status_filter !== "") {
    statusClause = "AND d.status = $3";
    values.push(status_filter);
  }

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
      pr.nama_program,
      pr.keterangan,
      t.nama_tim

    FROM t_distribusi_juri d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN m_program pr ON pr.id_program = p.id_program

    WHERE d.id_juri = $1
      AND d.tahap = $2
      ${statusClause}

    ORDER BY d.assigned_at DESC
  `;
  const { rows } = await pool.query(q, values);
  return rows;
};

const getDetailPenugasanDb = async (id_distribusi, id_juri) => {
  const q = `
    SELECT
      d.id_distribusi,
      d.id_proposal,
      d.id_juri,
      d.status,
      d.tahap,
      d.assigned_at,
      d.responded_at,
      d.catatan_juri,

      p.id_program,
      p.judul,
      p.file_proposal,
      p.modal_diajukan,
      p.status AS status_proposal,

      k.nama_kategori,
      pr.nama_program,
      pr.keterangan,
      t.nama_tim,

      tp.nama_tahap,
      tp.penilaian_mulai,
      tp.penilaian_selesai

    FROM t_distribusi_juri d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN m_program pr ON pr.id_program = p.id_program
    LEFT JOIN m_tahap_penilaian tp ON tp.id_program = p.id_program AND tp.urutan = 2

    WHERE d.id_distribusi = $1
      AND d.id_juri = $2
  `;
  const { rows } = await pool.query(q, [id_distribusi, id_juri]);
  return rows[0] || null;
};

const acceptDistribusiDb = async (id_distribusi, id_juri) => {
  const q = `
    UPDATE t_distribusi_juri
    SET status = 1,
        responded_at = now()
    WHERE id_distribusi = $1
      AND id_juri = $2
      AND status = 0
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_distribusi, id_juri]);
  return rows[0] || null;
};

const rejectDistribusiDb = async (id_distribusi, id_juri, catatan) => {
  const q = `
    UPDATE t_distribusi_juri
    SET status = 2,
        catatan_juri = $3,
        responded_at = now()
    WHERE id_distribusi = $1
      AND id_juri = $2
      AND status = 0
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_distribusi, id_juri, catatan]);
  return rows[0] || null;
};

module.exports = {
  getTahapAktifDb,
  getPenugasanDb,
  getDetailPenugasanDb,
  acceptDistribusiDb,
  rejectDistribusiDb,
};