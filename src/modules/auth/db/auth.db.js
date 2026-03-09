const pool = require("../../../config/db");

const getUserForLoginDb = async (email) => {
  const query = `
    SELECT
      u.id_user, u.id_role, u.email, u.username,
      u.password_hash, u.is_active, u.email_verified_at,
      r.nama_role,
      m.status_verifikasi AS mahasiswa_verifikasi,
      d.status_verifikasi AS dosen_verifikasi
    FROM m_user u
    JOIN m_role r ON u.id_role = r.id_role
    LEFT JOIN m_mahasiswa m ON u.id_user = m.id_user
    LEFT JOIN m_dosen d ON u.id_user = d.id_user
    WHERE u.email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

const createUserDb = async (data, client) => {
  const db = client || pool;
  const query = `
    INSERT INTO m_user (username, email, password_hash, id_role)
    VALUES ($1, $2, $3, $4)
    RETURNING id_user, username, email, id_role
  `;
  const result = await db.query(query, [
    data.username,
    data.email,
    data.password_hash,
    data.id_role,
  ]);
  return result.rows[0];
};

const saveRefreshTokenDb = async (id_user, token, expires_at) => {
  const query = `
    INSERT INTO t_refresh_token (id_user, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id_refresh_token
  `;
  const result = await pool.query(query, [id_user, token, expires_at]);
  return result.rows[0];
};

const getRefreshTokenDb = async (token) => {
  const query = `
    SELECT
      rt.id_refresh_token, rt.id_user, rt.token, rt.expires_at,
      u.id_role, u.email, u.username, u.is_active,
      r.nama_role
    FROM t_refresh_token rt
    JOIN m_user u ON rt.id_user = u.id_user
    JOIN m_role r ON u.id_role = r.id_role
    WHERE rt.token = $1
  `;
  const result = await pool.query(query, [token]);
  return result.rows[0] || null;
};

const deleteRefreshTokenDb = async (token) => {
  const query = `DELETE FROM t_refresh_token WHERE token = $1`;
  await pool.query(query, [token]);
};

const deleteAllRefreshTokensByUserDb = async (id_user) => {
  const query = `DELETE FROM t_refresh_token WHERE id_user = $1`;
  await pool.query(query, [id_user]);
};

const deleteExpiredRefreshTokensDb = async () => {
  const query = `DELETE FROM t_refresh_token WHERE expires_at < NOW()`;
  await pool.query(query);
};

module.exports = {
  getUserForLoginDb,
  createUserDb,
  saveRefreshTokenDb,
  getRefreshTokenDb,
  deleteRefreshTokenDb,
  deleteAllRefreshTokensByUserDb,
  deleteExpiredRefreshTokensDb,
};