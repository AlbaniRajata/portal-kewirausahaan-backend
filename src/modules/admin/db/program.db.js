const pool = require("../../../config/db");

const getProgramByIdDb = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT * FROM m_program WHERE id_program = $1`,
    [id_program]
  );
  return rows[0];
};

const updateProgramTimelineDb = async (id_program, data) => {
  const q = `
    UPDATE m_program
    SET pendaftaran_mulai = $1,
        pendaftaran_selesai = $2
    WHERE id_program = $3
  `;
  await pool.query(q, [
    data.pendaftaran_mulai,
    data.pendaftaran_selesai,
    id_program,
  ]);
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

  return rows[0];
};

module.exports = {
  getProgramByIdDb,
  updateProgramTimelineDb,
  getTahapByProgramDb,
  insertTahapDb,
  updateTahapDb,
};
