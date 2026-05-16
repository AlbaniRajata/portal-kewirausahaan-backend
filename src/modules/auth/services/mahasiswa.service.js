const pool = require("../../../config/db");
const { createBaseUser } = require("../../auth/services/auth.service");
const { createMahasiswaDb, deleteRejectedMahasiswaDb } = require("../db/mahasiswa.db");
const { createVerificationToken } = require("../../auth/services/emailVerification.service");
const { ROLE } = require("../../../constants/role");

const registerMahasiswa = async (data) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // generate a username from nama_lengkap or email local-part
    const sanitizeBase = (str) =>
      (str || "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/(^\.|\.$)/g, "")
        .slice(0, 40);

    const base = data.nama_lengkap ? sanitizeBase(data.nama_lengkap) : (data.email || "").split("@")[0];
    let candidate = base || "user";
    let suffix = 0;
    while (true) {
      const res = await client.query(`SELECT 1 FROM m_user WHERE username = $1 LIMIT 1`, [candidate]);
      if (res.rows.length === 0) break;
      suffix += 1;
      candidate = `${base}${suffix}`.slice(0, 50);
    }

    await deleteRejectedMahasiswaDb(
      { email: data.email, username: candidate, nim: data.nim },
      client
    );

    const user = await createBaseUser(
      {
        username: candidate,
        email: data.email,        nama_lengkap: data.nama_lengkap || null,        password: data.password,
        id_role: ROLE.MAHASISWA,
      },
      client
    );

    await createMahasiswaDb(
      {
        id_user: user.id_user,
        nim: data.nim,
        id_prodi: data.id_prodi,
        tahun_masuk: data.tahun_masuk,
        foto_ktm: data.foto_ktm,
      },
      client
    );

    await createVerificationToken(user.id_user, data.email, client);

    await client.query("COMMIT");

    return { user };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { registerMahasiswa };