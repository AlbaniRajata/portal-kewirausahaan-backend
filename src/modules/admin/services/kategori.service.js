const {
  getAllKategoriDb,
  getKategoriByIdDb,
  getKategoriByNamaDb,
  insertKategoriDb,
  updateKategoriDb,
  deleteKategoriDb,
} = require("../db/kategori.db");

const getKategori = async () => {
  const data = await getAllKategoriDb();
  return {
    error: false,
    message: "Daftar kategori",
    data,
  };
};

const getKategoriById = async (id_kategori) => {
  const data = await getKategoriByIdDb(id_kategori);
  if (!data) {
    return {
      error: true,
      message: "Kategori tidak ditemukan",
      data: null,
    };
  }
  return {
    error: false,
    message: "Detail kategori",
    data,
  };
};

const createKategori = async (payload) => {
  const { nama_kategori, keterangan } = payload;

  if (!nama_kategori) {
    return {
      error: true,
      message: "Nama kategori wajib diisi",
      data: null,
    };
  }

  const exists = await getKategoriByNamaDb(nama_kategori);
  if (exists) {
    return {
      error: true,
      message: "Nama kategori sudah digunakan",
      data: null,
    };
  }

  const inserted = await insertKategoriDb({ nama_kategori, keterangan });
  return {
    error: false,
    message: "Kategori berhasil dibuat",
    data: inserted,
  };
};

const updateKategori = async (id_kategori, payload) => {
  const kategori = await getKategoriByIdDb(id_kategori);
  if (!kategori) {
    return {
      error: true,
      message: "Kategori tidak ditemukan",
      data: null,
    };
  }

  const { nama_kategori, keterangan } = payload;

  if (!nama_kategori) {
    return {
      error: true,
      message: "Nama kategori wajib diisi",
      data: null,
    };
  }

  const exists = await getKategoriByNamaDb(nama_kategori, id_kategori);
  if (exists) {
    return {
      error: true,
      message: "Nama kategori sudah digunakan",
      data: null,
    };
  }

  const updated = await updateKategoriDb(id_kategori, { nama_kategori, keterangan });
  return {
    error: false,
    message: "Kategori berhasil diperbarui",
    data: updated,
  };
};

const deleteKategori = async (id_kategori) => {
  const kategori = await getKategoriByIdDb(id_kategori);
  if (!kategori) {
    return {
      error: true,
      message: "Kategori tidak ditemukan",
      data: null,
    };
  }

  const deleted = await deleteKategoriDb(id_kategori);
  return {
    error: false,
    message: "Kategori berhasil dihapus",
    data: deleted,
  };
};

module.exports = {
  getKategori,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori,
};