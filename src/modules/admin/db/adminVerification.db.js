const pool = require("../../../config/db");

const getPendingMahasiswaDb = async () => {
  const q = `
    SELECT
      u.id_user,
      u.username,
      u.email,
      m.nim,
      m.prodi,
      m.foto_ktm,
      u.email_verified_at,
      u.is_active,
      m.status_verifikasi
    FROM m_user u
    JOIN m_mahasiswa m ON m.id_user = u.id_user
    WHERE u.id_role = 1
      AND u.email_verified_at IS NOT NULL
      AND u.is_active = FALSE
      AND m.status_verifikasi = 0
    ORDER BY u.id_user DESC
  `;

  const { rows } = await pool.query(q);
  return rows;
};

const getDetailMahasiswaDb = async (id_user) => {
  const q = `
    SELECT
      u.id_user,
      u.username,
      u.email,
      m.nim,
      m.prodi,
      m.foto_ktm,
      m.status_verifikasi
    FROM m_user u
    JOIN m_mahasiswa m ON m.id_user = u.id_user
    WHERE u.id_user = $1
  `;

  const { rows } = await pool.query(q, [id_user]);
  return rows[0];
};

const approveMahasiswaDb = async (id_user) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE m_user SET is_active = TRUE WHERE id_user = $1`,
      [id_user]
    );

    await client.query(
      `UPDATE m_mahasiswa SET status_verifikasi = 1 WHERE id_user = $1`,
      [id_user]
    );

    const { rows } = await client.query(
      `
      SELECT
        u.id_user,
        u.username,
        u.email,
        m.nim,
        m.prodi,
        m.status_verifikasi
      FROM m_user u
      JOIN m_mahasiswa m ON m.id_user = u.id_user
      WHERE u.id_user = $1
      `,
      [id_user]
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

const rejectMahasiswaDb = async (id_user, catatan) => {
  const update = await pool.query(
    `
    UPDATE m_mahasiswa
    SET status_verifikasi = 2,
        catatan = $2
    WHERE id_user = $1
    RETURNING id_user
    `,
    [id_user, catatan]
  );

  if (update.rowCount === 0) return null;

  const { rows } = await pool.query(
    `
    SELECT 
      u.id_user,
      u.username,
      u.email,
      m.nim,
      m.prodi,
      m.status_verifikasi,
      m.catatan
    FROM m_user u
    JOIN m_mahasiswa m ON m.id_user = u.id_user
    WHERE u.id_user = $1
    `,
    [id_user]
  );

  return rows[0];
};

module.exports = {
  getPendingMahasiswaDb,
  getDetailMahasiswaDb,
  approveMahasiswaDb,
  rejectMahasiswaDb,
};
