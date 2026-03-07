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
      d.nip,
      d.id_prodi,
      d.bidang_keahlian,
      d.status_verifikasi,
      p.nama_prodi,
      p.jenjang,
      j.id_jurusan,
      j.nama_jurusan
    FROM m_user u
    JOIN m_dosen d ON d.id_user = u.id_user
    JOIN m_prodi p ON p.id_prodi = d.id_prodi
    JOIN m_jurusan j ON j.id_jurusan = p.id_jurusan
    WHERE u.id_user = $1
  `;
  const { rows } = await pool.query(q, [id_user]);
  return rows[0] || null;
};

const updateBiodataDb = async (id_user, data) => {
  const userAllowed = ["nama_lengkap", "username", "no_hp", "alamat", "foto"];
  const userFields = [];
  const userValues = [];
  let idx = 1;

  for (const key of userAllowed) {
    if (data[key] !== undefined) {
      userFields.push(`${key} = $${idx++}`);
      userValues.push(data[key]);
    }
  }

  const dosenFields = [];
  const dosenValues = [];
  let dosenIdx = 1;

  if (data.bidang_keahlian !== undefined) {
    dosenFields.push(`bidang_keahlian = $${dosenIdx++}`);
    dosenValues.push(data.bidang_keahlian);
  }

  if (userFields.length === 0 && dosenFields.length === 0) return null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (userFields.length > 0) {
      userValues.push(id_user);
      await client.query(
        `UPDATE m_user SET ${userFields.join(", ")} WHERE id_user = $${idx}`,
        userValues
      );
    }

    if (dosenFields.length > 0) {
      dosenValues.push(id_user);
      await client.query(
        `UPDATE m_dosen SET ${dosenFields.join(", ")} WHERE id_user = $${dosenIdx}`,
        dosenValues
      );
    }

    await client.query("COMMIT");
    return getProfileDb(id_user);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
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