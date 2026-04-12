const pool = require("../../../config/db");

const createEmailTokenDb = async ({ id_user, token, expired_at }) => {
  await pool.query(
    `INSERT INTO t_email_verification (id_user, token, expired_at)
     VALUES ($1, $2, $3)`,
    [id_user, token, expired_at]
  );
};

const getValidTokenDb = async (id_user, token) => {
  const { rows } = await pool.query(
    `SELECT *
     FROM t_email_verification
     WHERE id_user = $1
       AND token = $2
       AND used = false
       AND expired_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [id_user, token]
  );
  return rows[0] || null;
};

const getLastTokenDb = async (id_user) => {
  const { rows } = await pool.query(
    `SELECT created_at
     FROM t_email_verification
     WHERE id_user = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [id_user]
  );
  return rows[0] || null;
};

const markTokenUsedDb = async (id) => {
  await pool.query(
    `UPDATE t_email_verification SET used = true WHERE id = $1`,
    [id]
  );
};

const verifyEmailUserDb = async (id_user) => {
  await pool.query(
    `UPDATE m_user SET email_verified_at = NOW(), is_active = true WHERE id_user = $1`,
    [id_user]
  );
};

const approveDosenAfterEmailVerificationDb = async (id_user) => {
  await pool.query(
    `UPDATE m_dosen SET status_verifikasi = 1 WHERE id_user = $1`,
    [id_user]
  );
};

const deleteOldTokensDb = async (id_user) => {
  await pool.query(
    `DELETE FROM t_email_verification WHERE id_user = $1`,
    [id_user]
  );
};

const getUserByEmailDb = async (email) => {
  const { rows } = await pool.query(
    `SELECT id_user, email_verified_at FROM m_user WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
};

const getUserByIdDb = async (id_user) => {
  const { rows } = await pool.query(
    `SELECT u.id_user, u.email_verified_at, r.nama_role
     FROM m_user u
     JOIN m_role r ON r.id_role = u.id_role
     WHERE u.id_user = $1`,
    [id_user]
  );
  return rows[0] || null;
};

const cancelRegistrasiDb = async (id_user) => {
  await pool.query(
    `DELETE FROM m_user WHERE id_user = $1 AND email_verified_at IS NULL`,
    [id_user]
  );
};

module.exports = {
  createEmailTokenDb,
  getValidTokenDb,
  getLastTokenDb,
  markTokenUsedDb,
  verifyEmailUserDb,
  approveDosenAfterEmailVerificationDb,
  deleteOldTokensDb,
  getUserByEmailDb,
  getUserByIdDb,
  cancelRegistrasiDb,
};