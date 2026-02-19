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

const getKampus = async () => {
  const data = await getAllKampusDb();
  return {
    error: false,
    message: "Daftar kampus",
    data,
  };
};

const getKampusById = async (id_kampus) => {
  const data = await getKampusByIdDb(id_kampus);
  if (!data) {
    return {
      error: true,
      message: "Kampus tidak ditemukan",
      data: null,
    };
  }
  return {
    error: false,
    message: "Detail kampus",
    data,
  };
};

const createKampus = async (payload) => {
  const { nama_kampus } = payload;

  if (!nama_kampus) {
    return {
      error: true,
      message: "Nama kampus wajib diisi",
      data: null,
    };
  }

  const exists = await getKampusByNamaDb(nama_kampus);
  if (exists) {
    return {
      error: true,
      message: "Nama kampus sudah digunakan",
      data: null,
    };
  }

  const inserted = await insertKampusDb({ nama_kampus });
  return {
    error: false,
    message: "Kampus berhasil dibuat",
    data: inserted,
  };
};

const updateKampus = async (id_kampus, payload) => {
  const kampus = await getKampusByIdDb(id_kampus);
  if (!kampus) {
    return {
      error: true,
      message: "Kampus tidak ditemukan",
      data: null,
    };
  }

  const { nama_kampus } = payload;

  if (!nama_kampus) {
    return {
      error: true,
      message: "Nama kampus wajib diisi",
      data: null,
    };
  }

  const exists = await getKampusByNamaDb(nama_kampus, id_kampus);
  if (exists) {
    return {
      error: true,
      message: "Nama kampus sudah digunakan",
      data: null,
    };
  }

  const updated = await updateKampusDb(id_kampus, { nama_kampus });
  return {
    error: false,
    message: "Kampus berhasil diperbarui",
    data: updated,
  };
};

const deleteKampus = async (id_kampus) => {
  const kampus = await getKampusByIdDb(id_kampus);
  if (!kampus) {
    return {
      error: true,
      message: "Kampus tidak ditemukan",
      data: null,
    };
  }

  const deleted = await deleteKampusDb(id_kampus);
  return {
    error: false,
    message: "Kampus berhasil dihapus",
    data: deleted,
  };
};

const getJurusan = async () => {
  const data = await getAllJurusanDb();
  return {
    error: false,
    message: "Daftar jurusan",
    data,
  };
};

const getJurusanById = async (id_jurusan) => {
  const data = await getJurusanByIdDb(id_jurusan);
  if (!data) {
    return {
      error: true,
      message: "Jurusan tidak ditemukan",
      data: null,
    };
  }
  return {
    error: false,
    message: "Detail jurusan",
    data,
  };
};

const createJurusan = async (payload) => {
  const { nama_jurusan } = payload;

  if (!nama_jurusan) {
    return {
      error: true,
      message: "Nama jurusan wajib diisi",
      data: null,
    };
  }

  const exists = await getJurusanByNamaDb(nama_jurusan);
  if (exists) {
    return {
      error: true,
      message: "Nama jurusan sudah digunakan",
      data: null,
    };
  }

  const inserted = await insertJurusanDb({ nama_jurusan });
  return {
    error: false,
    message: "Jurusan berhasil dibuat",
    data: inserted,
  };
};

const updateJurusan = async (id_jurusan, payload) => {
  const jurusan = await getJurusanByIdDb(id_jurusan);
  if (!jurusan) {
    return {
      error: true,
      message: "Jurusan tidak ditemukan",
      data: null,
    };
  }

  const { nama_jurusan } = payload;

  if (!nama_jurusan) {
    return {
      error: true,
      message: "Nama jurusan wajib diisi",
      data: null,
    };
  }

  const exists = await getJurusanByNamaDb(nama_jurusan, id_jurusan);
  if (exists) {
    return {
      error: true,
      message: "Nama jurusan sudah digunakan",
      data: null,
    };
  }

  const updated = await updateJurusanDb(id_jurusan, { nama_jurusan });
  return {
    error: false,
    message: "Jurusan berhasil diperbarui",
    data: updated,
  };
};

const deleteJurusan = async (id_jurusan) => {
  const jurusan = await getJurusanByIdDb(id_jurusan);
  if (!jurusan) {
    return {
      error: true,
      message: "Jurusan tidak ditemukan",
      data: null,
    };
  }

  const deleted = await deleteJurusanDb(id_jurusan);
  return {
    error: false,
    message: "Jurusan berhasil dihapus",
    data: deleted,
  };
};

const JENJANG_VALID = ["D3", "D4", "S1", "S2", "S3"];

const getProdi = async () => {
  const data = await getAllProdiDb();
  return {
    error: false,
    message: "Daftar prodi",
    data,
  };
};

const getProdiById = async (id_prodi) => {
  const data = await getProdiByIdDb(id_prodi);
  if (!data) {
    return {
      error: true,
      message: "Prodi tidak ditemukan",
      data: null,
    };
  }
  return {
    error: false,
    message: "Detail prodi",
    data,
  };
};

const createProdi = async (payload) => {
  const { id_jurusan, id_kampus, nama_prodi, jenjang } = payload;

  if (!id_jurusan || !id_kampus || !nama_prodi || !jenjang) {
    return {
      error: true,
      message: "Semua field wajib diisi",
      data: null,
    };
  }

  if (!JENJANG_VALID.includes(jenjang)) {
    return {
      error: true,
      message: `Jenjang harus salah satu dari: ${JENJANG_VALID.join(", ")}`,
      data: null,
    };
  }

  const duplicate = await checkProdiDuplicateDb(id_kampus, nama_prodi, jenjang);
  if (duplicate) {
    return {
      error: true,
      message: "Prodi dengan nama, jenjang, dan kampus yang sama sudah ada",
      data: null,
    };
  }

  const inserted = await insertProdiDb({ id_jurusan, id_kampus, nama_prodi, jenjang });
  return {
    error: false,
    message: "Prodi berhasil dibuat",
    data: inserted,
  };
};

const updateProdi = async (id_prodi, payload) => {
  const prodi = await getProdiByIdDb(id_prodi);
  if (!prodi) {
    return {
      error: true,
      message: "Prodi tidak ditemukan",
      data: null,
    };
  }

  const { id_jurusan, id_kampus, nama_prodi, jenjang } = payload;

  if (!id_jurusan || !id_kampus || !nama_prodi || !jenjang) {
    return {
      error: true,
      message: "Semua field wajib diisi",
      data: null,
    };
  }

  if (!JENJANG_VALID.includes(jenjang)) {
    return {
      error: true,
      message: `Jenjang harus salah satu dari: ${JENJANG_VALID.join(", ")}`,
      data: null,
    };
  }

  const duplicate = await checkProdiDuplicateDb(id_kampus, nama_prodi, jenjang, id_prodi);
  if (duplicate) {
    return {
      error: true,
      message: "Prodi dengan nama, jenjang, dan kampus yang sama sudah ada",
      data: null,
    };
  }

  const updated = await updateProdiDb(id_prodi, { id_jurusan, id_kampus, nama_prodi, jenjang });
  return {
    error: false,
    message: "Prodi berhasil diperbarui",
    data: updated,
  };
};

const deleteProdi = async (id_prodi) => {
  const prodi = await getProdiByIdDb(id_prodi);
  if (!prodi) {
    return {
      error: true,
      message: "Prodi tidak ditemukan",
      data: null,
    };
  }

  const deleted = await deleteProdiDb(id_prodi);
  return {
    error: false,
    message: "Prodi berhasil dihapus",
    data: deleted,
  };
};

module.exports = {
  getKampus,
  getKampusById,
  createKampus,
  updateKampus,
  deleteKampus,
  getJurusan,
  getJurusanById,
  createJurusan,
  updateJurusan,
  deleteJurusan,
  getProdi,
  getProdiById,
  createProdi,
  updateProdi,
  deleteProdi,
};