const pool = require("../../../config/db");

const createReviewerDb = async (id_user, institusi, bidang_keahlian, id_program) => {
  const { rows } = await pool.query(
    `INSERT INTO m_reviewer (id_user, institusi, bidang_keahlian, id_program)
     VALUES ($1, $2, $3, $4)
     RETURNING id_user, institusi, bidang_keahlian, id_program`,
    [id_user, institusi, bidang_keahlian, id_program || null]
  );
  return rows[0];
};

const getReviewersDb = async () => {
  const { rows } = await pool.query(
    `SELECT
      u.id_user, u.nama_lengkap, u.username, u.email, u.no_hp,
      r.institusi, r.bidang_keahlian, r.id_program,
      p.nama_program,
      u.is_active, u.created_at
     FROM m_user u
     JOIN m_reviewer r ON r.id_user = u.id_user
     LEFT JOIN m_program p ON p.id_program = r.id_program
     ORDER BY u.created_at DESC`
  );
  return rows;
};

const getReviewerDetailDb = async (id_user) => {
  const { rows } = await pool.query(
    `SELECT
      u.id_user, u.nama_lengkap, u.username, u.email, u.no_hp,
      r.institusi, r.bidang_keahlian, r.id_program,
      p.nama_program,
      u.is_active, u.created_at
     FROM m_user u
     JOIN m_reviewer r ON r.id_user = u.id_user
     LEFT JOIN m_program p ON p.id_program = r.id_program
     WHERE u.id_user = $1`,
    [id_user]
  );
  return rows[0] || null;
};

const updateReviewerProgramDb = async (id_user, id_program) => {
  const { rows } = await pool.query(
    `UPDATE m_reviewer SET id_program = $2 WHERE id_user = $1 RETURNING *`,
    [id_user, id_program || null]
  );
  return rows[0];
};

module.exports = { createReviewerDb, getReviewersDb, getReviewerDetailDb, updateReviewerProgramDb };