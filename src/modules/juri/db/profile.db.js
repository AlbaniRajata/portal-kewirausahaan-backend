const pool = require("../../../config/db");

const getProfileDb = async (id_user) => {
  const q = `
    SELECT
      u.id_user,
      u.nama_lengkap,
      u.username,
      u.email,
      u.no_hp,
      u.foto,
      u.alamat,
      j.institusi,
      j.bidang_keahlian
    FROM m_user u
    JOIN m_juri j ON j.id_user = u.id_user
    WHERE u.id_user = $1
  `;
  const { rows } = await pool.query(q, [id_user]);
  return rows[0] || null;
};

const updateBiodataDb = async (id_user, data) => {
  const userFields = [];
  const userValues = [];
  let idx = 1;

  const allowedUser = ["nama_lengkap", "no_hp", "alamat", "foto"];
  for (const key of allowedUser) {
    if (data[key] !== undefined) {
      userFields.push(`${key} = $${idx++}`);
      userValues.push(data[key]);
    }
  }

  if (userFields.length > 0) {
    userValues.push(id_user);
    await pool.query(
      `UPDATE m_user SET ${userFields.join(", ")} WHERE id_user = $${idx}`,
      userValues
    );
  }

  const juriFields = [];
  const juriValues = [];
  let jidx = 1;

  const allowedJuri = ["institusi", "bidang_keahlian"];
  for (const key of allowedJuri) {
    if (data[key] !== undefined) {
      juriFields.push(`${key} = $${jidx++}`);
      juriValues.push(data[key]);
    }
  }

  if (juriFields.length > 0) {
    juriValues.push(id_user);
    await pool.query(
      `UPDATE m_juri SET ${juriFields.join(", ")} WHERE id_user = $${jidx}`,
      juriValues
    );
  }

  return getProfileDb(id_user);
};

const getPasswordHashDb = async (id_user) => {
  const { rows } = await pool.query(
    `SELECT password_hash FROM m_user WHERE id_user = $1`,
    [id_user]
  );
  return rows[0]?.password_hash || null;
};

const updatePasswordDb = async (id_user, password_hash) => {
  await pool.query(
    `UPDATE m_user SET password_hash = $1 WHERE id_user = $2`,
    [password_hash, id_user]
  );
};

const checkDuplicateBiodataDb = async (id_user, { no_hp }) => {
  if (no_hp === undefined) return null;

  const { rows } = await pool.query(
    `SELECT no_hp FROM m_user WHERE no_hp = $1 AND id_user != $2 LIMIT 1`,
    [no_hp, id_user]
  );
  return rows[0] || null;
};

module.exports = {
  getProfileDb,
  updateBiodataDb,
  getPasswordHashDb,
  updatePasswordDb,
  checkDuplicateBiodataDb,
};