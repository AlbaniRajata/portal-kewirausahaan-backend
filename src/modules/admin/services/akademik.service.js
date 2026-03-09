const {
  getAllKampusDb,
  getKampusByIdDb,
  getKampusByNamaDb,
  insertKampusDb,
  updateKampusDb,
  deleteKampusDb,
  getAllJurusanDb,
  getJurusanByIdDb,
  getJurusanByNamaDb,
  insertJurusanDb,
  updateJurusanDb,
  deleteJurusanDb,
  getAllProdiDb,
  getProdiByIdDb,
  checkProdiDuplicateDb,
  insertProdiDb,
  updateProdiDb,
  deleteProdiDb,
} = require("../db/akademik.db");

const JENJANG_VALID = ["D3", "D4", "S2"];

const getKampus = async () => {
  const data = await getAllKampusDb();
  return { error: false, message: "Daftar kampus berhasil diambil", data };
};

const getKampusById = async (id_kampus) => {
  const data = await getKampusByIdDb(id_kampus);
  if (!data) return { error: true, message: "Kampus tidak ditemukan", data: null };
  return { error: false, message: "Detail kampus berhasil diambil", data };
};

const createKampus = async (payload) => {
  const nama_kampus = payload.nama_kampus?.trim();

  if (!nama_kampus) {
    return { error: true, message: "Nama kampus wajib diisi", data: null };
  }

  if (nama_kampus.length > 100) {
    return { error: true, message: "Nama kampus maksimal 100 karakter", data: null };
  }

  const exists = await getKampusByNamaDb(nama_kampus);
  if (exists) return { error: true, message: "Nama kampus sudah digunakan", data: null };

  const inserted = await insertKampusDb(nama_kampus);
  return { error: false, message: "Kampus berhasil dibuat", data: inserted };
};

const updateKampus = async (id_kampus, payload) => {
  const kampus = await getKampusByIdDb(id_kampus);
  if (!kampus) return { error: true, message: "Kampus tidak ditemukan", data: null };

  const nama_kampus = payload.nama_kampus?.trim();

  if (!nama_kampus) {
    return { error: true, message: "Nama kampus wajib diisi", data: null };
  }

  if (nama_kampus.length > 100) {
    return { error: true, message: "Nama kampus maksimal 100 karakter", data: null };
  }

  const exists = await getKampusByNamaDb(nama_kampus, id_kampus);
  if (exists) return { error: true, message: "Nama kampus sudah digunakan", data: null };

  const updated = await updateKampusDb(id_kampus, nama_kampus);
  return { error: false, message: "Kampus berhasil diperbarui", data: updated };
};

const deleteKampus = async (id_kampus) => {
  const kampus = await getKampusByIdDb(id_kampus);
  if (!kampus) return { error: true, message: "Kampus tidak ditemukan", data: null };

  const deleted = await deleteKampusDb(id_kampus);
  return { error: false, message: "Kampus berhasil dihapus", data: deleted };
};

const getJurusan = async () => {
  const data = await getAllJurusanDb();
  return { error: false, message: "Daftar jurusan berhasil diambil", data };
};

const getJurusanById = async (id_jurusan) => {
  const data = await getJurusanByIdDb(id_jurusan);
  if (!data) return { error: true, message: "Jurusan tidak ditemukan", data: null };
  return { error: false, message: "Detail jurusan berhasil diambil", data };
};

const createJurusan = async (payload) => {
  const nama_jurusan = payload.nama_jurusan?.trim();

  if (!nama_jurusan) {
    return { error: true, message: "Nama jurusan wajib diisi", data: null };
  }

  if (nama_jurusan.length > 100) {
    return { error: true, message: "Nama jurusan maksimal 100 karakter", data: null };
  }

  const exists = await getJurusanByNamaDb(nama_jurusan);
  if (exists) return { error: true, message: "Nama jurusan sudah digunakan", data: null };

  const inserted = await insertJurusanDb(nama_jurusan);
  return { error: false, message: "Jurusan berhasil dibuat", data: inserted };
};

const updateJurusan = async (id_jurusan, payload) => {
  const jurusan = await getJurusanByIdDb(id_jurusan);
  if (!jurusan) return { error: true, message: "Jurusan tidak ditemukan", data: null };

  const nama_jurusan = payload.nama_jurusan?.trim();

  if (!nama_jurusan) {
    return { error: true, message: "Nama jurusan wajib diisi", data: null };
  }

  if (nama_jurusan.length > 100) {
    return { error: true, message: "Nama jurusan maksimal 100 karakter", data: null };
  }

  const exists = await getJurusanByNamaDb(nama_jurusan, id_jurusan);
  if (exists) return { error: true, message: "Nama jurusan sudah digunakan", data: null };

  const updated = await updateJurusanDb(id_jurusan, nama_jurusan);
  return { error: false, message: "Jurusan berhasil diperbarui", data: updated };
};

const deleteJurusan = async (id_jurusan) => {
  const jurusan = await getJurusanByIdDb(id_jurusan);
  if (!jurusan) return { error: true, message: "Jurusan tidak ditemukan", data: null };

  const deleted = await deleteJurusanDb(id_jurusan);
  return { error: false, message: "Jurusan berhasil dihapus", data: deleted };
};

const getProdi = async () => {
  const data = await getAllProdiDb();
  return { error: false, message: "Daftar prodi berhasil diambil", data };
};

const getProdiById = async (id_prodi) => {
  const data = await getProdiByIdDb(id_prodi);
  if (!data) return { error: true, message: "Prodi tidak ditemukan", data: null };
  return { error: false, message: "Detail prodi berhasil diambil", data };
};

const createProdi = async (payload) => {
  const id_jurusan = parseInt(payload.id_jurusan);
  const id_kampus = parseInt(payload.id_kampus);
  const nama_prodi = payload.nama_prodi?.trim();
  const jenjang = payload.jenjang?.trim();

  const missing = [];
  if (!payload.id_jurusan) missing.push("id_jurusan");
  if (!payload.id_kampus) missing.push("id_kampus");
  if (!nama_prodi) missing.push("nama_prodi");
  if (!jenjang) missing.push("jenjang");

  if (missing.length > 0) {
    return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };
  }

  if (isNaN(id_jurusan) || id_jurusan <= 0) {
    return { error: true, message: "ID jurusan tidak valid", data: null };
  }

  if (isNaN(id_kampus) || id_kampus <= 0) {
    return { error: true, message: "ID kampus tidak valid", data: null };
  }

  if (!JENJANG_VALID.includes(jenjang)) {
    return { error: true, message: `Jenjang harus salah satu dari: ${JENJANG_VALID.join(", ")}`, data: null };
  }

  if (nama_prodi.length > 150) {
    return { error: true, message: "Nama prodi maksimal 150 karakter", data: null };
  }

  const jurusan = await getJurusanByIdDb(id_jurusan);
  if (!jurusan) return { error: true, message: "Jurusan tidak ditemukan", data: null };

  const kampus = await getKampusByIdDb(id_kampus);
  if (!kampus) return { error: true, message: "Kampus tidak ditemukan", data: null };

  const duplicate = await checkProdiDuplicateDb(id_kampus, nama_prodi, jenjang);
  if (duplicate) {
    return { error: true, message: "Prodi dengan nama, jenjang, dan kampus yang sama sudah ada", data: null };
  }

  const inserted = await insertProdiDb({ id_jurusan, id_kampus, nama_prodi, jenjang });
  return { error: false, message: "Prodi berhasil dibuat", data: inserted };
};

const updateProdi = async (id_prodi, payload) => {
  const prodi = await getProdiByIdDb(id_prodi);
  if (!prodi) return { error: true, message: "Prodi tidak ditemukan", data: null };

  const id_jurusan = parseInt(payload.id_jurusan);
  const id_kampus = parseInt(payload.id_kampus);
  const nama_prodi = payload.nama_prodi?.trim();
  const jenjang = payload.jenjang?.trim();

  const missing = [];
  if (!payload.id_jurusan) missing.push("id_jurusan");
  if (!payload.id_kampus) missing.push("id_kampus");
  if (!nama_prodi) missing.push("nama_prodi");
  if (!jenjang) missing.push("jenjang");

  if (missing.length > 0) {
    return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };
  }

  if (isNaN(id_jurusan) || id_jurusan <= 0) {
    return { error: true, message: "ID jurusan tidak valid", data: null };
  }

  if (isNaN(id_kampus) || id_kampus <= 0) {
    return { error: true, message: "ID kampus tidak valid", data: null };
  }

  if (!JENJANG_VALID.includes(jenjang)) {
    return { error: true, message: `Jenjang harus salah satu dari: ${JENJANG_VALID.join(", ")}`, data: null };
  }

  if (nama_prodi.length > 150) {
    return { error: true, message: "Nama prodi maksimal 150 karakter", data: null };
  }

  const jurusan = await getJurusanByIdDb(id_jurusan);
  if (!jurusan) return { error: true, message: "Jurusan tidak ditemukan", data: null };

  const kampus = await getKampusByIdDb(id_kampus);
  if (!kampus) return { error: true, message: "Kampus tidak ditemukan", data: null };

  const duplicate = await checkProdiDuplicateDb(id_kampus, nama_prodi, jenjang, id_prodi);
  if (duplicate) {
    return { error: true, message: "Prodi dengan nama, jenjang, dan kampus yang sama sudah ada", data: null };
  }

  const updated = await updateProdiDb(id_prodi, { id_jurusan, id_kampus, nama_prodi, jenjang });
  return { error: false, message: "Prodi berhasil diperbarui", data: updated };
};

const deleteProdi = async (id_prodi) => {
  const prodi = await getProdiByIdDb(id_prodi);
  if (!prodi) return { error: true, message: "Prodi tidak ditemukan", data: null };

  const deleted = await deleteProdiDb(id_prodi);
  return { error: false, message: "Prodi berhasil dihapus", data: deleted };
};

module.exports = {
  getKampus, getKampusById, createKampus, updateKampus, deleteKampus,
  getJurusan, getJurusanById, createJurusan, updateJurusan, deleteJurusan,
  getProdi, getProdiById, createProdi, updateProdi, deleteProdi,
};