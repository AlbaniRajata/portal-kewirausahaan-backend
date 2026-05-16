const pool = require("../../../config/db");
const { createBaseUser } = require("../../auth/services/auth.service");
const { createDosenDb, deleteRejectedDosenDb } = require("../db/dosen.db");
const { createVerificationToken } = require("../../auth/services/emailVerification.service");
const { ROLE } = require("../../../constants/role");

const registerDosen = async (data) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // generate username from nama_lengkap or email local part
    const makeBase = (s) => (s || "").toLowerCase().normalize('NFKD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '').slice(0, 40);
    const baseCandidate = makeBase(data.nama_lengkap) || String((data.email || "").split("@")[0]).toLowerCase();
    let usernameCandidate = baseCandidate || 'user';
    let suffix = 0;
    // remove any trailing dots
    usernameCandidate = usernameCandidate.replace(/\.+$/g, '');

    // ensure uniqueness by checking DB
    while (true) {
      const { rows } = await client.query('SELECT 1 FROM m_user WHERE username = $1 LIMIT 1', [usernameCandidate]);
      if (rows.length === 0) break;
      suffix += 1;
      usernameCandidate = (baseCandidate + suffix).slice(0, 50);
    }

    await deleteRejectedDosenDb(
      { email: data.email, username: usernameCandidate, nip: data.nip },
      client
    );

    const user = await createBaseUser(
      {
        username: usernameCandidate,
        email: data.email,
        nama_lengkap: data.nama_lengkap || null,
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

module.exports = { registerDosen };