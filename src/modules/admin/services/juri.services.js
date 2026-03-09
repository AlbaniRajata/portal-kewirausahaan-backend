const { getRoleByNameDb, checkDuplicateUserDb, createUserDb } = require("../db/user.db");
const { createJuriDb, getJurisDb, getJuriDetailDb } = require("../db/juri.db");
const { hashPassword } = require("../../../helpers/password.helper");

const createJuri = async (data) => {
  const { nama_lengkap, username, email, password, no_hp, institusi, bidang_keahlian } = data;

  const missing = [];
  if (!nama_lengkap) missing.push("nama_lengkap");
  if (!username) missing.push("username");
  if (!email) missing.push("email");
  if (!password) missing.push("password");
  if (!no_hp) missing.push("no_hp");
  if (!institusi) missing.push("institusi");
  if (!bidang_keahlian) missing.push("bidang_keahlian");
  if (missing.length) return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };

  const duplicate = await checkDuplicateUserDb({ username, email, no_hp });
  if (duplicate.username_count > 0) return { error: true, message: "Username sudah terdaftar", data: { field: "username" } };
  if (duplicate.email_count > 0) return { error: true, message: "Email sudah terdaftar", data: { field: "email" } };
  if (duplicate.no_hp_count > 0) return { error: true, message: "No HP sudah terdaftar", data: { field: "no_hp" } };

  const role = await getRoleByNameDb("juri");
  if (!role) return { error: true, message: "Role juri tidak ditemukan di sistem", data: null };

  const hashed = await hashPassword(password);
  const user = await createUserDb({ nama_lengkap, username, email, password: hashed, no_hp, id_role: role.id_role });
  const juri = await createJuriDb(user.id_user, institusi.trim(), bidang_keahlian.trim());

  return { error: false, message: "Juri berhasil didaftarkan", data: { user, juri } };
};

const getJuris = async () => {
  const data = await getJurisDb();
  return { error: false, message: "Daftar juri berhasil diambil", data };
};

const getJuriDetail = async (id_user) => {
  const data = await getJuriDetailDb(id_user);
  if (!data) return { error: true, message: "Juri tidak ditemukan", data: null };
  return { error: false, message: "Detail juri berhasil diambil", data };
};

module.exports = { createJuri, getJuris, getJuriDetail };