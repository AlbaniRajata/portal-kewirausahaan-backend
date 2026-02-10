const pool = require("../../../config/db");

const createJuriDb = async (id_user, data) => {
  const { institusi, bidang_keahlian } = data;

  const { rows } = await pool.query(
    `
    INSERT INTO m_juri (id_user, institusi, bidang_keahlian)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [id_user, institusi, bidang_keahlian]
  );

  return rows[0];
};

const getJurisDb = async () => {
  const { rows } = await pool.query(`
    SELECT
      u.id_user,
      u.nama_lengkap,
      u.username,
      u.email,
      u.no_hp,
      j.institusi,
      j.bidang_keahlian
    FROM m_user u
    JOIN m_juri j ON j.id_user = u.id_user
    ORDER BY u.nama_lengkap ASC
  `);

  return rows;
};

const getJuriDetailDb = async (id_user) => {
  const { rows } = await pool.query(
    `
    SELECT
      u.id_user,
      u.nama_lengkap,
      u.username,
      u.email,
      u.no_hp,
      j.institusi,
      j.bidang_keahlian
    FROM m_user u
    JOIN m_juri j ON j.id_user = u.id_user
    WHERE u.id_user = $1
    `,
    [id_user]
  );

  return rows[0];
};

module.exports = {
  createJuriDb,
  getJurisDb,
  getJuriDetailDb,
};