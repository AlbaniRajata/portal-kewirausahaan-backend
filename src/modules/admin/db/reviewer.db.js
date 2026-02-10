const pool = require("../../../config/db");

const createReviewerDb = async (id_user, data) => {
  const { institusi, bidang_keahlian } = data;
  
  const { rows } = await pool.query(
    `
    INSERT INTO m_reviewer (id_user, institusi, bidang_keahlian)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [id_user, institusi, bidang_keahlian]
  );
  
  return rows[0];
};

const getReviewersDb = async () => {
  const { rows } = await pool.query(`
    SELECT
      u.id_user,
      u.nama_lengkap,
      u.username,
      u.email,
      u.no_hp,
      r.institusi,
      r.bidang_keahlian
    FROM m_user u
    JOIN m_reviewer r ON r.id_user = u.id_user
    ORDER BY u.created_at DESC
  `);

  return rows;
};

const getReviewerDetailDb = async (id_user) => {
  const { rows } = await pool.query(
    `
    SELECT
      u.id_user,
      u.nama_lengkap,
      u.username,
      u.email,
      u.no_hp,
      r.institusi,
      r.bidang_keahlian
    FROM m_user u
    JOIN m_reviewer r ON r.id_user = u.id_user
    WHERE u.id_user = $1
    `,
    [id_user]
  );

  return rows[0];
};

module.exports = {
  createReviewerDb,
  getReviewersDb,
  getReviewerDetailDb,
};