const {
  getRoleByNameDb,
  checkDuplicateUserDb,
  createUserDb,
} = require("../db/user.db");

const { 
  createJuriDb, 
  getJurisDb, 
  getJuriDetailDb
} = require("../db/juri.db");

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
  const data = await getJurisDb();
  return { error: false, data };
};

const getJuriDetail = async (id_user) => {
  const data = await getJuriDetailDb(id_user);

  if (!data) {
    return {
      error: true,
      message: "Juri tidak ditemukan",
      data: { id_user },
    };
  }

  return { error: false, data };
};

module.exports = {
  createJuri,
  getJuris,
  getJuriDetail,
};