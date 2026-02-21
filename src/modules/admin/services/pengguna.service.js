const bcrypt = require("bcrypt");
const {
  getMahasiswaListDb, getDosenListDb, getReviewerListDb, getJuriListDb,
  getUserByIdDb, checkEmailExistsDb, checkUsernameExistsDb, checkNimExistsDb, checkNipExistsDb,
  insertMahasiswaDb, insertDosenDb, insertReviewerDb, insertJuriDb,
  updateUserBaseDb, updateMahasiswaDetailDb, updateDosenDetailDb, updateReviewerDetailDb, updateJuriDetailDb,
  toggleUserActiveDb, resetPasswordDb, getPoolClient,
} = require("../db/pengguna.db");

const getMahasiswaList = async (filters) => {
  const data = await getMahasiswaListDb(filters);
  return { error: false, message: "Daftar mahasiswa", data };
};

const getDosenList = async (filters) => {
  const data = await getDosenListDb(filters);
  return { error: false, message: "Daftar dosen", data };
};

const getReviewerList = async (filters) => {
  const data = await getReviewerListDb(filters);
  return { error: false, message: "Daftar reviewer", data };
};

const getJuriList = async (filters) => {
  const data = await getJuriListDb(filters);
  return { error: false, message: "Daftar juri", data };
};

const createMahasiswa = async (payload) => {
  const { username, email, password, nama_lengkap, no_hp, alamat, nim, id_prodi, tahun_masuk } = payload;
  if (!username || !email || !password || !nama_lengkap || !nim || !id_prodi || !tahun_masuk)
    return { error: true, message: "Semua field wajib diisi", data: null };
  if (password.length < 8)
    return { error: true, message: "Password minimal 8 karakter", data: null };
  if (await checkEmailExistsDb(email))
    return { error: true, message: "Email sudah digunakan", data: null };
  if (await checkUsernameExistsDb(username))
    return { error: true, message: "Username sudah digunakan", data: null };
  if (await checkNimExistsDb(nim))
    return { error: true, message: "NIM sudah digunakan", data: null };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    const id_user = await insertMahasiswaDb({ username, email, password, nama_lengkap, no_hp, alamat }, { nim, id_prodi, tahun_masuk }, client);
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
  if (!username || !email || !password || !nama_lengkap || !nip || !id_prodi)
    return { error: true, message: "Semua field wajib diisi", data: null };
  if (password.length < 8)
    return { error: true, message: "Password minimal 8 karakter", data: null };
  if (await checkEmailExistsDb(email))
    return { error: true, message: "Email sudah digunakan", data: null };
  if (await checkUsernameExistsDb(username))
    return { error: true, message: "Username sudah digunakan", data: null };
  if (await checkNipExistsDb(nip))
    return { error: true, message: "NIP sudah digunakan", data: null };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    const id_user = await insertDosenDb({ username, email, password, nama_lengkap, no_hp, alamat }, { nip, id_prodi, bidang_keahlian }, client);
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
  if (!username || !email || !password || !nama_lengkap)
    return { error: true, message: "Semua field wajib diisi", data: null };
  if (password.length < 8)
    return { error: true, message: "Password minimal 8 karakter", data: null };
  if (await checkEmailExistsDb(email))
    return { error: true, message: "Email sudah digunakan", data: null };
  if (await checkUsernameExistsDb(username))
    return { error: true, message: "Username sudah digunakan", data: null };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    const id_user = await insertReviewerDb({ username, email, password, nama_lengkap, no_hp, alamat }, { institusi, bidang_keahlian }, client);
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
  if (!username || !email || !password || !nama_lengkap)
    return { error: true, message: "Semua field wajib diisi", data: null };
  if (password.length < 8)
    return { error: true, message: "Password minimal 8 karakter", data: null };
  if (await checkEmailExistsDb(email))
    return { error: true, message: "Email sudah digunakan", data: null };
  if (await checkUsernameExistsDb(username))
    return { error: true, message: "Username sudah digunakan", data: null };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    const id_user = await insertJuriDb({ username, email, password, nama_lengkap, no_hp, alamat }, { institusi, bidang_keahlian }, client);
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
  if (!nama_lengkap || !email || !nim || !id_prodi || !tahun_masuk)
    return { error: true, message: "Semua field wajib diisi", data: null };
  if (await checkEmailExistsDb(email, id_user))
    return { error: true, message: "Email sudah digunakan", data: null };
  if (await checkNimExistsDb(nim, id_user))
    return { error: true, message: "NIM sudah digunakan", data: null };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    await updateUserBaseDb(id_user, { nama_lengkap, email, no_hp, alamat }, client);
    await updateMahasiswaDetailDb(id_user, { nim, id_prodi, tahun_masuk }, client);
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
  if (!nama_lengkap || !email || !nip || !id_prodi)
    return { error: true, message: "Semua field wajib diisi", data: null };
  if (await checkEmailExistsDb(email, id_user))
    return { error: true, message: "Email sudah digunakan", data: null };
  if (await checkNipExistsDb(nip, id_user))
    return { error: true, message: "NIP sudah digunakan", data: null };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    await updateUserBaseDb(id_user, { nama_lengkap, email, no_hp, alamat }, client);
    await updateDosenDetailDb(id_user, { nip, id_prodi, bidang_keahlian }, client);
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
  if (!nama_lengkap || !email)
    return { error: true, message: "Nama lengkap dan email wajib diisi", data: null };
  if (await checkEmailExistsDb(email, id_user))
    return { error: true, message: "Email sudah digunakan", data: null };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    await updateUserBaseDb(id_user, { nama_lengkap, email, no_hp, alamat }, client);
    await updateReviewerDetailDb(id_user, { institusi, bidang_keahlian }, client);
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
  if (!nama_lengkap || !email)
    return { error: true, message: "Nama lengkap dan email wajib diisi", data: null };
  if (await checkEmailExistsDb(email, id_user))
    return { error: true, message: "Email sudah digunakan", data: null };

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    await updateUserBaseDb(id_user, { nama_lengkap, email, no_hp, alamat }, client);
    await updateJuriDetailDb(id_user, { institusi, bidang_keahlian }, client);
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
  if (!password || password.length < 8)
    return { error: true, message: "Password minimal 8 karakter", data: null };
  const user = await getUserByIdDb(id_user);
  if (!user) return { error: true, message: "User tidak ditemukan", data: null };
  const password_hash = await bcrypt.hash(password, 10);
  await resetPasswordDb(id_user, password_hash);
  return { error: false, message: "Password berhasil direset", data: null };
};

module.exports = {
  getMahasiswaList, getDosenList, getReviewerList, getJuriList,
  createMahasiswa, createDosen, createReviewer, createJuri,
  updateMahasiswa, updateDosen, updateReviewer, updateJuri,
  toggleUserActive, resetPassword,
};