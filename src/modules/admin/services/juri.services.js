const {
  getRoleByNameDb,
  checkDuplicateUserDb,
  createUserDb,
} = require("../db/user.db");

const { createJuriDb } = require("../db/juri.db");
const pool = require("../../../config/db");

const createJuri = async (data) => {
  const required = [
    "nama_lengkap",
    "username",
    "email",
    "password",
    "no_hp",
    "institusi",
    "bidang_keahlian",
  ];

  const missing = required.filter((f) => !data[f]);
  if (missing.length > 0) {
    return {
      error: true,
      message: "Field wajib belum diisi",
      data: { missing_fields: missing },
    };
  }

  const duplicate = await checkDuplicateUserDb(data);

  if (duplicate.username_count > 0) {
    return {
      error: true,
      message: "Username sudah terdaftar",
      data: { field: "username", value: data.username },
    };
  }

  if (duplicate.email_count > 0) {
    return {
      error: true,
      message: "Email sudah terdaftar",
      data: { field: "email", value: data.email },
    };
  }

  if (duplicate.no_hp_count > 0) {
    return {
      error: true,
      message: "No HP sudah terdaftar",
      data: { field: "no_hp", value: data.no_hp },
    };
  }

  const role = await getRoleByNameDb("juri");
  if (!role) {
    return {
      error: true,
      message: "Role juri eksternal tidak ditemukan",
      data: null,
    };
  }

  const user = await createUserDb({
    ...data,
    id_role: role.id_role,
  });

  const juri = await createJuriDb(user.id_user, data);

  return {
    error: false,
    data: {
      user,
      juri,
    },
  };
};

const getJuris = async () => {
  const { rows } = await pool.query(`
    SELECT
      u.id_user,
      u.nama_lengkap,
      u.username,
      u.email,
      u.no_hp,
      j.institusi,
      j.bidang_keahlian
    FROM m_user u
    JOIN m_juri j ON j.id_user = u.id_user
    ORDER BY u.created_at DESC
  `);

  return { error: false, data: rows };
};

const getJuriDetail = async (id_user) => {
  const { rows } = await pool.query(
    `
    SELECT
      u.id_user,
      u.nama_lengkap,
      u.username,
      u.email,
      u.no_hp,
      j.institusi,
      j.bidang_keahlian
    FROM m_user u
    JOIN m_juri j ON j.id_user = u.id_user
    WHERE u.id_user = $1
    `,
    [id_user]
  );

  if (!rows[0]) {
    return {
      error: true,
      message: "Juri tidak ditemukan",
      data: { id_user },
    };
  }

  return { error: false, data: rows[0] };
};

module.exports = {
  createJuri,
  getJuris,
  getJuriDetail,
};
