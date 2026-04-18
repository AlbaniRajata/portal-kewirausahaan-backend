const {
  getMahasiswaListDb, getMahasiswaCountDb,
  getDosenListDb, getDosenCountDb,
  getReviewerListDb, getReviewerCountDb,
  getJuriListDb, getJuriCountDb,
  getUserByIdDb,
  checkEmailExistsDb, checkUsernameExistsDb, checkNimExistsDb, checkNipExistsDb,
  insertMahasiswaDb, insertDosenDb, insertReviewerDb, insertJuriDb,
  updateUserBaseDb, updateMahasiswaDetailDb, updateDosenDetailDb, updateReviewerDetailDb, updateJuriDetailDb,
  toggleUserActiveDb, resetPasswordDb, getPoolClient,
} = require("../db/pengguna.db");
const { hashPassword } = require("../../../helpers/password.helper");
const { parsePaginationParams } = require("../../../utils/pagination");

const getMahasiswaList = async (filters) => {
  const { page, limit } = parsePaginationParams(filters);
  const [data, total] = await Promise.all([
    getMahasiswaListDb({ ...filters, page, limit }),
    getMahasiswaCountDb(filters)
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    error: false,
    message: "Daftar mahasiswa berhasil diambil",
    data: data,
    pagination: { page, limit, total, total_pages: totalPages, has_next: page < totalPages, has_prev: page > 1 }
  };
};

const getDosenList = async (filters) => {
  const { page, limit } = parsePaginationParams(filters);
  const [data, total] = await Promise.all([
    getDosenListDb({ ...filters, page, limit }),
    getDosenCountDb(filters)
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    error: false,
    message: "Daftar dosen berhasil diambil",
    data: data,
    pagination: { page, limit, total, total_pages: totalPages, has_next: page < totalPages, has_prev: page > 1 }
  };
};

const getReviewerList = async (filters) => {
  const { page, limit } = parsePaginationParams(filters);
  const [data, total] = await Promise.all([
    getReviewerListDb({ ...filters, page, limit }),
    getReviewerCountDb(filters)
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    error: false,
    message: "Daftar reviewer berhasil diambil",
    data: data,
    pagination: { page, limit, total, total_pages: totalPages, has_next: page < totalPages, has_prev: page > 1 }
  };
};

const getJuriList = async (filters) => {
  const { page, limit } = parsePaginationParams(filters);
  const [data, total] = await Promise.all([
    getJuriListDb({ ...filters, page, limit }),
    getJuriCountDb(filters)
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    error: false,
    message: "Daftar juri berhasil diambil",
    data: data,
    pagination: { page, limit, total, total_pages: totalPages, has_next: page < totalPages, has_prev: page > 1 }
  };
};

const createMahasiswa = async (payload) => {
  const { username, email, password, nama_lengkap, no_hp, alamat, nim, id_prodi, tahun_masuk } = payload;

  const missing = [];
  if (!username) missing.push("username");
  if (!email) missing.push("email");
  if (!password) missing.push("password");
  if (!nama_lengkap) missing.push("nama_lengkap");
  if (!nim) missing.push("nim");
  if (!id_prodi) missing.push("id_prodi");
  if (!tahun_masuk) missing.push("tahun_masuk");
  if (missing.length) return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };

  if (password.length < 8) return { error: true, message: "Password minimal 8 karakter", data: null };

  const [emailExists, usernameExists, nimExists] = await Promise.all([
    checkEmailExistsDb(email),
    checkUsernameExistsDb(username),
    checkNimExistsDb(nim),
  ]);
  if (emailExists) return { error: true, message: "Email sudah digunakan", data: { field: "email" } };
  if (usernameExists) return { error: true, message: "Username sudah digunakan", data: { field: "username" } };
  if (nimExists) return { error: true, message: "NIM sudah digunakan", data: { field: "nim" } };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    const id_user = await insertMahasiswaDb(client, { username, email, password, nama_lengkap, no_hp, alamat }, { nim, id_prodi: parseInt(id_prodi), tahun_masuk: parseInt(tahun_masuk) });
    await client.query("COMMIT");
    return { error: false, message: "Mahasiswa berhasil dibuat", data: { id_user } };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const createDosen = async (payload) => {
  const { username, email, password, nama_lengkap, no_hp, alamat, nip, id_prodi, bidang_keahlian } = payload;

  const missing = [];
  if (!username) missing.push("username");
  if (!email) missing.push("email");
  if (!password) missing.push("password");
  if (!nama_lengkap) missing.push("nama_lengkap");
  if (!nip) missing.push("nip");
  if (!id_prodi) missing.push("id_prodi");
  if (missing.length) return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };

  if (password.length < 8) return { error: true, message: "Password minimal 8 karakter", data: null };

  const [emailExists, usernameExists, nipExists] = await Promise.all([
    checkEmailExistsDb(email),
    checkUsernameExistsDb(username),
    checkNipExistsDb(nip),
  ]);
  if (emailExists) return { error: true, message: "Email sudah digunakan", data: { field: "email" } };
  if (usernameExists) return { error: true, message: "Username sudah digunakan", data: { field: "username" } };
  if (nipExists) return { error: true, message: "NIP sudah digunakan", data: { field: "nip" } };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    const id_user = await insertDosenDb(client, { username, email, password, nama_lengkap, no_hp, alamat }, { nip, id_prodi: parseInt(id_prodi), bidang_keahlian });
    await client.query("COMMIT");
    return { error: false, message: "Dosen berhasil dibuat", data: { id_user } };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const createReviewer = async (payload) => {
  const { username, email, password, nama_lengkap, no_hp, alamat, institusi, bidang_keahlian } = payload;

  const missing = [];
  if (!username) missing.push("username");
  if (!email) missing.push("email");
  if (!password) missing.push("password");
  if (!nama_lengkap) missing.push("nama_lengkap");
  if (missing.length) return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };

  if (password.length < 8) return { error: true, message: "Password minimal 8 karakter", data: null };

  const [emailExists, usernameExists] = await Promise.all([
    checkEmailExistsDb(email),
    checkUsernameExistsDb(username),
  ]);
  if (emailExists) return { error: true, message: "Email sudah digunakan", data: { field: "email" } };
  if (usernameExists) return { error: true, message: "Username sudah digunakan", data: { field: "username" } };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    const id_user = await insertReviewerDb(client, { username, email, password, nama_lengkap, no_hp, alamat }, { institusi, bidang_keahlian });
    await client.query("COMMIT");
    return { error: false, message: "Reviewer berhasil dibuat", data: { id_user } };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const createJuri = async (payload) => {
  const { username, email, password, nama_lengkap, no_hp, alamat, institusi, bidang_keahlian } = payload;

  const missing = [];
  if (!username) missing.push("username");
  if (!email) missing.push("email");
  if (!password) missing.push("password");
  if (!nama_lengkap) missing.push("nama_lengkap");
  if (missing.length) return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };

  if (password.length < 8) return { error: true, message: "Password minimal 8 karakter", data: null };

  const [emailExists, usernameExists] = await Promise.all([
    checkEmailExistsDb(email),
    checkUsernameExistsDb(username),
  ]);
  if (emailExists) return { error: true, message: "Email sudah digunakan", data: { field: "email" } };
  if (usernameExists) return { error: true, message: "Username sudah digunakan", data: { field: "username" } };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    const id_user = await insertJuriDb(client, { username, email, password, nama_lengkap, no_hp, alamat }, { institusi, bidang_keahlian });
    await client.query("COMMIT");
    return { error: false, message: "Juri berhasil dibuat", data: { id_user } };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const updateMahasiswa = async (id_user, payload) => {
  const { nama_lengkap, email, no_hp, alamat, nim, id_prodi, tahun_masuk } = payload;

  const missing = [];
  if (!nama_lengkap) missing.push("nama_lengkap");
  if (!email) missing.push("email");
  if (!nim) missing.push("nim");
  if (!id_prodi) missing.push("id_prodi");
  if (!tahun_masuk) missing.push("tahun_masuk");
  if (missing.length) return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };

  const [emailExists, nimExists] = await Promise.all([
    checkEmailExistsDb(email, id_user),
    checkNimExistsDb(nim, id_user),
  ]);
  if (emailExists) return { error: true, message: "Email sudah digunakan", data: { field: "email" } };
  if (nimExists) return { error: true, message: "NIM sudah digunakan", data: { field: "nim" } };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    await updateUserBaseDb(client, id_user, { nama_lengkap, email, no_hp, alamat });
    await updateMahasiswaDetailDb(client, id_user, { nim, id_prodi: parseInt(id_prodi), tahun_masuk: parseInt(tahun_masuk) });
    await client.query("COMMIT");
    return { error: false, message: "Data mahasiswa berhasil diperbarui", data: null };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const updateDosen = async (id_user, payload) => {
  const { nama_lengkap, email, no_hp, alamat, nip, id_prodi, bidang_keahlian } = payload;

  const missing = [];
  if (!nama_lengkap) missing.push("nama_lengkap");
  if (!email) missing.push("email");
  if (!nip) missing.push("nip");
  if (!id_prodi) missing.push("id_prodi");
  if (missing.length) return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };

  const [emailExists, nipExists] = await Promise.all([
    checkEmailExistsDb(email, id_user),
    checkNipExistsDb(nip, id_user),
  ]);
  if (emailExists) return { error: true, message: "Email sudah digunakan", data: { field: "email" } };
  if (nipExists) return { error: true, message: "NIP sudah digunakan", data: { field: "nip" } };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    await updateUserBaseDb(client, id_user, { nama_lengkap, email, no_hp, alamat });
    await updateDosenDetailDb(client, id_user, { nip, id_prodi: parseInt(id_prodi), bidang_keahlian });
    await client.query("COMMIT");
    return { error: false, message: "Data dosen berhasil diperbarui", data: null };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const updateReviewer = async (id_user, payload) => {
  const { nama_lengkap, email, no_hp, alamat, institusi, bidang_keahlian } = payload;

  if (!nama_lengkap || !email) return { error: true, message: "Nama lengkap dan email wajib diisi", data: null };

  if (await checkEmailExistsDb(email, id_user)) return { error: true, message: "Email sudah digunakan", data: { field: "email" } };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    await updateUserBaseDb(client, id_user, { nama_lengkap, email, no_hp, alamat });
    await updateReviewerDetailDb(client, id_user, { institusi, bidang_keahlian });
    await client.query("COMMIT");
    return { error: false, message: "Data reviewer berhasil diperbarui", data: null };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const updateJuri = async (id_user, payload) => {
  const { nama_lengkap, email, no_hp, alamat, institusi, bidang_keahlian } = payload;

  if (!nama_lengkap || !email) return { error: true, message: "Nama lengkap dan email wajib diisi", data: null };

  if (await checkEmailExistsDb(email, id_user)) return { error: true, message: "Email sudah digunakan", data: { field: "email" } };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    await updateUserBaseDb(client, id_user, { nama_lengkap, email, no_hp, alamat });
    await updateJuriDetailDb(client, id_user, { institusi, bidang_keahlian });
    await client.query("COMMIT");
    return { error: false, message: "Data juri berhasil diperbarui", data: null };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const toggleUserActive = async (id_user, is_active) => {
  const user = await getUserByIdDb(id_user);
  if (!user) return { error: true, message: "User tidak ditemukan", data: null };
  const updated = await toggleUserActiveDb(id_user, is_active);
  return { error: false, message: `User berhasil ${is_active ? "diaktifkan" : "dinonaktifkan"}`, data: updated };
};

const resetPassword = async (id_user, payload) => {
  const { password } = payload;
  if (!password || password.length < 8) return { error: true, message: "Password minimal 8 karakter", data: null };

  const user = await getUserByIdDb(id_user);
  if (!user) return { error: true, message: "User tidak ditemukan", data: null };

  const password_hash = await hashPassword(password);
  await resetPasswordDb(id_user, password_hash);
  return { error: false, message: "Password berhasil direset", data: null };
};

module.exports = {
  getMahasiswaList, getDosenList, getReviewerList, getJuriList,
  createMahasiswa, createDosen, createReviewer, createJuri,
  updateMahasiswa, updateDosen, updateReviewer, updateJuri,
  toggleUserActive, resetPassword,
};