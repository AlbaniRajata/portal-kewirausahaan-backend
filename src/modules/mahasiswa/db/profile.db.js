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
      m.nim,
      m.id_prodi,
      m.tahun_masuk,
      m.foto_ktm,
      m.status_verifikasi,
      m.status_mahasiswa,
      p.nama_prodi,
      p.jenjang,
      j.id_jurusan,
      j.nama_jurusan
    FROM m_user u
    JOIN m_mahasiswa m ON m.id_user = u.id_user
    JOIN m_prodi p ON p.id_prodi = m.id_prodi
    JOIN m_jurusan j ON j.id_jurusan = p.id_jurusan
    WHERE u.id_user = $1
  `;
  const { rows } = await pool.query(q, [id_user]);
  return rows[0] || null;
};

const updateBiodataDb = async (id_user, data) => {
  const fields = [];
  const values = [];
  let idx = 1;

  const allowed = ["nama_lengkap", "username", "no_hp", "alamat", "foto"];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return null;

  values.push(id_user);
  const q = `UPDATE m_user SET ${fields.join(", ")} WHERE id_user = $${idx} RETURNING id_user`;
  await pool.query(q, values);

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

const checkDuplicateBiodataDb = async (id_user, { username, no_hp }) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (username !== undefined) {
    conditions.push(`username = $${idx++}`);
    values.push(username);
  }

  if (no_hp !== undefined) {
    conditions.push(`no_hp = $${idx++}`);
    values.push(no_hp);
  }

  if (conditions.length === 0) return null;

  values.push(id_user);
  const q = `
    SELECT username, no_hp FROM m_user
    WHERE (${conditions.join(" OR ")}) AND id_user != $${idx}
    LIMIT 1
  `;
  const { rows } = await pool.query(q, values);
  return rows[0] || null;
};

module.exports = {
  getProfileDb,
  updateBiodataDb,
  getPasswordHashDb,
  updatePasswordDb,
  checkDuplicateBiodataDb,
};