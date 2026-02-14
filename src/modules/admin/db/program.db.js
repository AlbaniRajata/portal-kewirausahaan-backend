const pool = require("../../../config/db");

const getProgramByAdminDb = async (id_user) => {
  const q = `
    SELECT
      p.id_program,
      p.nama_program,
      p.keterangan,
      p.pendaftaran_mulai,
      p.pendaftaran_selesai
    FROM m_program p
    JOIN t_admin_program ap ON ap.id_program = p.id_program
    WHERE ap.id_user = $1
      AND ap.is_active = true
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_user]);
  return rows[0] || null;
};

const getProgramByIdAndAdminDb = async (id_program, id_user) => {
  const q = `
    SELECT
      p.id_program,
      p.nama_program,
      p.keterangan,
      p.pendaftaran_mulai,
      p.pendaftaran_selesai
    FROM m_program p
    JOIN t_admin_program ap ON ap.id_program = p.id_program
    WHERE p.id_program = $1
      AND ap.id_user = $2
      AND ap.is_active = true
  `;
  const { rows } = await pool.query(q, [id_program, id_user]);
  return rows[0] || null;
};

const updateProgramTimelineDb = async (id_program, data) => {
  const q = `
    UPDATE m_program
    SET pendaftaran_mulai = $1,
        pendaftaran_selesai = $2
    WHERE id_program = $3
    RETURNING *
  `;
  const { rows } = await pool.query(q, [
    data.pendaftaran_mulai,
    data.pendaftaran_selesai,
    id_program,
  ]);
  return rows[0] || null;
};

const getTahapByProgramDb = async (id_program) => {
  const q = `
    SELECT *
    FROM m_tahap_penilaian
    WHERE id_program = $1
    ORDER BY urutan ASC
  `;
  const { rows } = await pool.query(q, [id_program]);
  return rows;
};

const getTahapByIdDb = async (id_tahap) => {
  const q = `
    SELECT
      t.*,
      p.id_program
    FROM m_tahap_penilaian t
    JOIN m_program p ON p.id_program = t.id_program
    WHERE t.id_tahap = $1
  `;
  const { rows } = await pool.query(q, [id_tahap]);
  return rows[0] || null;
};

const checkUrutanExistsDb = async (id_program, urutan, exclude_id_tahap = null) => {
  let q = `
    SELECT id_tahap
    FROM m_tahap_penilaian
    WHERE id_program = $1
      AND urutan = $2
  `;
  const values = [id_program, urutan];

  if (exclude_id_tahap) {
    q += ` AND id_tahap != $3`;
    values.push(exclude_id_tahap);
  }

  const { rows } = await pool.query(q, values);
  return rows.length > 0;
};

const insertTahapDb = async (id_program, data) => {
  const q = `
    INSERT INTO m_tahap_penilaian
      (id_program, nama_tahap, urutan, penilaian_mulai, penilaian_selesai)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const { rows } = await pool.query(q, [
    id_program,
    data.nama_tahap,
    data.urutan,
    data.penilaian_mulai,
    data.penilaian_selesai,
  ]);
  return rows[0];
};

const updateTahapDb = async (id_tahap, data) => {
  const q = `
    UPDATE m_tahap_penilaian
    SET penilaian_mulai = $2,
        penilaian_selesai = $3
    WHERE id_tahap = $1
    RETURNING *
  `;
  const { rows } = await pool.query(q, [
    id_tahap,
    data.penilaian_mulai,
    data.penilaian_selesai,
  ]);
  return rows[0] || null;
};

const deleteTahapDb = async (id_tahap) => {
  const q = `
    DELETE FROM m_tahap_penilaian
    WHERE id_tahap = $1
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_tahap]);
  return rows[0] || null;
};

module.exports = {
  getProgramByAdminDb,
  getProgramByIdAndAdminDb,
  updateProgramTimelineDb,
  getTahapByProgramDb,
  getTahapByIdDb,
  checkUrutanExistsDb,
  insertTahapDb,
  updateTahapDb,
  deleteTahapDb,
};