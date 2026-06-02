const pool = require("../../../config/db");

const createJuriDb = async (id_user, institusi, bidang_keahlian, id_program) => {
  const { rows } = await pool.query(
    `INSERT INTO m_juri (id_user, institusi, bidang_keahlian, id_program)
     VALUES ($1, $2, $3, $4)
     RETURNING id_user, institusi, bidang_keahlian, id_program`,
    [id_user, institusi, bidang_keahlian, id_program || null]
  );
  return rows[0];
};

const getJurisDb = async () => {
  const { rows } = await pool.query(
    `SELECT
      u.id_user, u.nama_lengkap, u.username, u.email, u.no_hp,
      j.institusi, j.bidang_keahlian, j.id_program,
      p.nama_program,
      u.is_active, u.created_at
     FROM m_user u
     JOIN m_juri j ON j.id_user = u.id_user
     LEFT JOIN m_program p ON p.id_program = j.id_program
     ORDER BY u.nama_lengkap ASC`
  );
  return rows;
};

const getJuriDetailDb = async (id_user) => {
  const { rows } = await pool.query(
    `SELECT
      u.id_user, u.nama_lengkap, u.username, u.email, u.no_hp,
      j.institusi, j.bidang_keahlian, j.id_program,
      p.nama_program,
      u.is_active, u.created_at
     FROM m_user u
     JOIN m_juri j ON j.id_user = u.id_user
     LEFT JOIN m_program p ON p.id_program = j.id_program
     WHERE u.id_user = $1`,
    [id_user]
  );
  return rows[0] || null;
};

const updateJuriProgramDb = async (id_user, id_program) => {
  const { rows } = await pool.query(
    `UPDATE m_juri SET id_program = $2 WHERE id_user = $1 RETURNING *`,
    [id_user, id_program || null]
  );
  return rows[0];
};

module.exports = { createJuriDb, getJurisDb, getJuriDetailDb, updateJuriProgramDb };