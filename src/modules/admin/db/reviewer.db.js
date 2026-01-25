const pool = require("../../../config/db");

const createReviewerDb = async (id_user, data) => {
  const { institusi, bidang_keahlian } = data;

  const { rows } = await pool.query(
    `
    INSERT INTO m_reviewer (id_user, institusi, bidang_keahlian)
    VALUES ($1,$2,$3)
    RETURNING *
    `,
    [id_user, institusi, bidang_keahlian]
  );

  return rows[0];
};

module.exports = {
  createReviewerDb,
};
