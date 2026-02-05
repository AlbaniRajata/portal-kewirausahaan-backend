const pool = require("../../../config/db");
const { createBaseUser } = require("../../auth/services/auth.service");
const {
  createMahasiswaDb,
} = require("../db/mahasiswa.db");

const registerMahasiswa = async (data) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const user = await createBaseUser(data, client);

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
    return user;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

module.exports = { registerMahasiswa };
