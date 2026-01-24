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
  return rows[0];
};

const updateBiodataDb = async (id_user, data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userFields = [];
    const userValues = [];
    let userIndex = 1;

    if (data.nama_lengkap !== undefined) {
      userFields.push(`nama_lengkap = $${userIndex++}`);
      userValues.push(data.nama_lengkap);
    }

    if (data.username !== undefined) {
      userFields.push(`username = $${userIndex++}`);
      userValues.push(data.username);
    }

    if (data.no_hp !== undefined) {
      userFields.push(`no_hp = $${userIndex++}`);
      userValues.push(data.no_hp);
    }

    if (data.foto !== undefined) {
      userFields.push(`foto = $${userIndex++}`);
      userValues.push(data.foto);
    }

    if (userFields.length > 0) {
      userValues.push(id_user);
      const qUser = `
        UPDATE m_user 
        SET ${userFields.join(", ")}
        WHERE id_user = $${userIndex}
      `;
      await client.query(qUser, userValues);
    }

    await client.query("COMMIT");

    const updated = await getProfileDb(id_user);
    return updated;

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const updatePasswordDb = async (id_user, password_hash) => {
  await pool.query(
    `UPDATE m_user SET password_hash = $1 WHERE id_user = $2`,
    [password_hash, id_user]
  );
};

const getPasswordHashDb = async (id_user) => {
  const { rows } = await pool.query(
    `SELECT password_hash FROM m_user WHERE id_user = $1`,
    [id_user]
  );
  return rows[0]?.password_hash;
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
    SELECT username, no_hp
    FROM m_user
    WHERE (${conditions.join(" OR ")})
    AND id_user != $${idx}
    LIMIT 1
  `;

  const { rows } = await pool.query(q, values);
  return rows[0];
};

module.exports = {
  getProfileDb,
  updateBiodataDb,
  updatePasswordDb,
  getPasswordHashDb,
  checkDuplicateBiodataDb,
};