const pool = require("../config/db");

const createEmailTokenDb = async ({ id_user, token, expired_at }) => {
  await pool.query(
    `
    INSERT INTO t_email_verification (id_user, token, expired_at)
    VALUES ($1, $2, $3)
    `,
    [id_user, token, expired_at]
  );
};

const getValidTokenDb = async (token) => {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM t_email_verification
    WHERE token = $1
      AND used = false
      AND expired_at > NOW()
    `,
    [token]
  );
  return rows[0];
};

const markTokenUsedDb = async (id) => {
  await pool.query(
    `UPDATE t_email_verification SET used = true WHERE id = $1`,
    [id]
  );
};

const verifyEmailUserDb = async (id_user) => {
  await pool.query(
    `UPDATE m_user SET email_verified_at = NOW() WHERE id_user = $1`,
    [id_user]
  );
};

module.exports = {
  createEmailTokenDb,
  getValidTokenDb,
  markTokenUsedDb,
  verifyEmailUserDb,
};
