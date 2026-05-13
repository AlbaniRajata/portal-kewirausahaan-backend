const {
  getTimListDb, getTimCountDb,
  getTimDetailDb,
  getPesertaListDb,
  getPesertaDetailDb,
  updateTimStatusDb,
  deleteTimDb,
} = require("../db/timpeserta.db");
const { parsePaginationParams } = require("../../../utils/pagination");

const getTimList = async (filters) => {
  const { page, limit } = parsePaginationParams(filters);
  const [data, total] = await Promise.all([
    getTimListDb({ ...filters, page, limit }),
    getTimCountDb(filters)
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    error: false,
    message: "Daftar tim berhasil diambil",
    data: data,
    pagination: { page, limit, total, total_pages: totalPages, has_next: page < totalPages, has_prev: page > 1 }
  };
};

const getTimDetail = async (id_tim) => {
  const data = await getTimDetailDb(id_tim);
  if (!data) return { error: true, message: "Tim tidak ditemukan", data: null };
  return { error: false, message: "Detail tim berhasil diambil", data };
};

const withdrawTim = async (id_tim) => {
  const data = await getTimDetailDb(id_tim);
  if (!data) return { error: true, message: "Tim tidak ditemukan", data: null };
  if (parseInt(data.status, 10) !== 0) {
    return { error: true, message: "Tim hanya bisa dinonaktifkan jika masih aktif", data: null };
  }

  const updated = await updateTimStatusDb(id_tim, 2);
  if (!updated) {
    return { error: true, message: "Gagal memperbarui status tim", data: null };
  }

  return { error: false, message: "Tim berhasil dinonaktifkan (mengundurkan diri)", data: updated };
};

const deleteTim = async (id_tim) => {
  const data = await getTimDetailDb(id_tim);
  if (!data) return { error: true, message: "Tim tidak ditemukan", data: null };
  if (parseInt(data.status, 10) !== 2) {
    return { error: true, message: "Tim hanya bisa dihapus setelah dinonaktifkan", data: null };
  }

  const deleted = await deleteTimDb(id_tim);
  if (!deleted || deleted.blocked) {
    return { error: true, message: "Tim hanya bisa dihapus setelah dinonaktifkan", data: null };
  }

  return { error: false, message: "Tim berhasil dihapus", data: deleted };
};

const getPesertaList = async (filters) => {
  const { page, limit } = parsePaginationParams(filters);
  const data = await getPesertaListDb({ ...filters, page, limit });
  return {
    error: false,
    message: "Daftar peserta program berhasil diambil",
    data: data,
    pagination: { page, limit, total: data.length, total_pages: 1, has_next: false, has_prev: page > 1 }
  };
};

const getPesertaDetail = async (id_user, id_program) => {
  const data = await getPesertaDetailDb(id_user, id_program);
  if (!data) return { error: true, message: "Peserta tidak ditemukan", data: null };
  return { error: false, message: "Detail peserta berhasil diambil", data };
};

module.exports = { getTimList, getTimDetail, withdrawTim, deleteTim, getPesertaList, getPesertaDetail };