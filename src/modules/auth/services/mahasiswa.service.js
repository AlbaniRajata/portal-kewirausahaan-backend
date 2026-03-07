const pool = require("../../../config/db");
const { createBaseUser } = require("../../auth/services/auth.service");
const { createMahasiswaDb } = require("../db/mahasiswa.db");
const { createVerificationToken } = require("../../auth/services/emailVerification.service");
const ROLE = require("../../../constants/role");

const registerMahasiswa = async (data) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const user = await createBaseUser(
      {
        username: data.username,
        email: data.email,
        password: data.password,
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

    await client.query("COMMIT");

    const token = await createVerificationToken(user.id_user);

    return { user, token };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { registerMahasiswa };