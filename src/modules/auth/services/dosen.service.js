const pool = require("../../../config/db");
const { createBaseUser } = require("../../auth/services/auth.service");
const { createDosenDb, deleteRejectedDosenDb } = require("../db/dosen.db");
const { createVerificationToken } = require("../../auth/services/emailVerification.service");
const { ROLE } = require("../../../constants/role");

const registerDosen = async (data) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await deleteRejectedDosenDb(
      { email: data.email, username: data.username, nip: data.nip },
      client
    );

    const user = await createBaseUser(
      {
        username: data.username,
        email: data.email,
        password: data.password,
        id_role: ROLE.DOSEN,
      },
      client
    );

    await createDosenDb(
      {
        id_user: user.id_user,
        nip: data.nip,
        id_prodi: data.id_prodi,
        bidang_keahlian: data.bidang_keahlian || null,
      },
      client
    );

    await client.query("COMMIT");

    await createVerificationToken(user.id_user, data.email);

    return { user };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { registerDosen };