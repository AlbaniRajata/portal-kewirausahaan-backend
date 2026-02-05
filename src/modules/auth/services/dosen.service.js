const pool = require("../../../config/db");
const { createBaseUser } = require("../../auth/services/auth.service");
const { createDosenDb } = require("../db/dosen.db");

const registerDosen = async (data) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const user = await createBaseUser(data, client);

    await createDosenDb(
      {
        id_user: user.id_user,
        nip: data.nip,
        id_prodi: data.id_prodi,
        bidang_keahlian: data.bidang_keahlian,
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

module.exports = { registerDosen };
