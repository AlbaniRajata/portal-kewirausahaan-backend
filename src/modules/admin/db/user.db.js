const pool = require("../../../config/db");
const bcrypt = require("bcrypt");

const getRoleByNameDb = async (nama_role) => {
  const { rows } = await pool.query(
    `SELECT id_role, nama_role FROM m_role WHERE nama_role = $1`,
    [nama_role]
  );
  return rows[0];
};

const checkDuplicateUserDb = async ({ username, email, no_hp }) => {
  const { rows } = await pool.query(
    `
    SELECT
      (SELECT COUNT(*) FROM m_user WHERE username = $1) AS username_count,
      (SELECT COUNT(*) FROM m_user WHERE email = $2) AS email_count,
      (SELECT COUNT(*) FROM m_user WHERE no_hp = $3) AS no_hp_count
    `,
    [username, email, no_hp]
  );
  return rows[0];
};

const createUserDb = async (data) => {
  const {
    id_role,
    nama_lengkap,
    username,
    email,
    password,
    no_hp,
  } = data;

  if (!password) {
    throw new Error("Password wajib diisi");
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { rows } = await pool.query(
    `
    INSERT INTO m_user
    (id_role, nama_lengkap, username, email, password_hash, no_hp, is_active, email_verified_at)
    VALUES ($1,$2,$3,$4,$5,$6,true,now())
    RETURNING id_user, nama_lengkap, username, email, no_hp, id_role
    `,
    [id_role, nama_lengkap, username, email, password_hash, no_hp]
  );

  return rows[0];
};

const getReviewerUsersDb = async () => {
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
  getRoleByNameDb,
  checkDuplicateUserDb,
  createUserDb,
  getReviewerUsersDb,
  getReviewerDetailDb,
};
