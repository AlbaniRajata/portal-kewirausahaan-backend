const {
  getAllProgramListDb,
  getAllProgramCountDb,
  getProgramListForNavbarDb,
  getProgramByAdminDb,
  getProgramByIdAndAdminDb,
  updateProgramTimelineDb,
  getTahapByProgramDb,
  getTahapByIdDb,
  checkUrutanExistsDb,
  insertTahapDb,
  updateTahapDb,
  deleteTahapDb,
  getKriteriaByTahapDb,
  getKriteriaByIdDb,
  checkUrutanKriteriaExistsDb,
  insertKriteriaDb,
  updateKriteriaDb,
  deleteKriteriaDb,
} = require("../db/program.db");
const { parsePaginationParams } = require("../../../utils/pagination");

const isValidDate = (val) => !isNaN(new Date(val).getTime());

const getAllProgramList = async (filters) => {
  const { page, limit } = parsePaginationParams(filters || {});
  const [data, total] = await Promise.all([
    getAllProgramListDb({ page, limit }),
    getAllProgramCountDb()
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    error: false,
    message: "Daftar program berhasil diambil",
    data: data,
    pagination: { page, limit, total, total_pages: totalPages, has_next: page < totalPages, has_prev: page > 1 }
  };
};

const getProgramListForNavbar = async (id_user) => {
  const data = await getProgramListForNavbarDb(id_user);
  return { error: false, message: "Daftar program berhasil diambil", data };
};

const getProgramAdmin = async (id_user) => {
  const program = await getProgramByAdminDb(id_user);
  if (!program) return { error: true, message: "Program tidak ditemukan atau akses ditolak", data: null };
  return { error: false, message: "Data program admin berhasil diambil", data: program };
};

const setProgramTimeline = async (id_user, id_program, data) => {
  const program = await getProgramByIdAndAdminDb(id_program, id_user);
  if (!program) return { error: true, message: "Program tidak ditemukan atau akses ditolak", data: null };

  const { pendaftaran_mulai, pendaftaran_selesai } = data;

  if (!pendaftaran_mulai || !pendaftaran_selesai) {
    return { error: true, message: "Tanggal mulai dan selesai wajib diisi", data: null };
  }

  if (!isValidDate(pendaftaran_mulai) || !isValidDate(pendaftaran_selesai)) {
    return { error: true, message: "Format tanggal tidak valid", data: null };
  }

  const mulai = new Date(pendaftaran_mulai);
  const selesai = new Date(pendaftaran_selesai);

  if (mulai >= selesai) {
    return { error: true, message: "Tanggal selesai harus lebih besar dari tanggal mulai", data: null };
  }

  const updated = await updateProgramTimelineDb(id_program, { pendaftaran_mulai: mulai, pendaftaran_selesai: selesai });
  return { error: false, message: "Timeline pendaftaran berhasil diperbarui", data: updated };
};

const getTahapProgram = async (id_user, id_program) => {
  const program = await getProgramByIdAndAdminDb(id_program, id_user);
  if (!program) return { error: true, message: "Program tidak ditemukan atau akses ditolak", data: null };

  const tahap = await getTahapByProgramDb(id_program);
  return { error: false, message: "Daftar tahap penilaian berhasil diambil", data: tahap };
};

const createTahapProgram = async (id_user, id_program, payload) => {
  const program = await getProgramByIdAndAdminDb(id_program, id_user);
  if (!program) return { error: true, message: "Program tidak ditemukan atau akses ditolak", data: null };

  const { nama_tahap, urutan, penilaian_mulai, penilaian_selesai } = payload;

  const missing = [];
  if (!nama_tahap) missing.push("nama_tahap");
  if (!urutan) missing.push("urutan");
  if (!penilaian_mulai) missing.push("penilaian_mulai");
  if (!penilaian_selesai) missing.push("penilaian_selesai");
  if (missing.length > 0) return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };

  const urutanNum = parseInt(urutan);
  if (isNaN(urutanNum) || urutanNum < 1) return { error: true, message: "Urutan harus berupa angka minimal 1", data: null };

  if (!isValidDate(penilaian_mulai) || !isValidDate(penilaian_selesai)) {
    return { error: true, message: "Format tanggal tidak valid", data: null };
  }

  const mulai = new Date(penilaian_mulai);
  const selesai = new Date(penilaian_selesai);
  if (mulai >= selesai) return { error: true, message: "Tanggal selesai harus lebih besar dari tanggal mulai", data: null };

  const urutanExists = await checkUrutanExistsDb(id_program, urutanNum);
  if (urutanExists) return { error: true, message: `Urutan ${urutanNum} sudah digunakan`, data: null };

  const inserted = await insertTahapDb(id_program, {
    nama_tahap: nama_tahap.trim(),
    urutan: urutanNum,
    penilaian_mulai: mulai,
    penilaian_selesai: selesai,
  });
  return { error: false, message: "Tahap berhasil dibuat", data: inserted };
};

const updateJadwalTahap = async (id_user, id_tahap, payload) => {
  const tahap = await getTahapByIdDb(id_tahap);
  if (!tahap) return { error: true, message: "Tahap tidak ditemukan", data: null };

  const program = await getProgramByIdAndAdminDb(tahap.id_program, id_user);
  if (!program) return { error: true, message: "Akses ditolak", data: null };

  const { penilaian_mulai, penilaian_selesai } = payload;

  if (!penilaian_mulai || !penilaian_selesai) {
    return { error: true, message: "Tanggal mulai dan selesai wajib diisi", data: null };
  }

  if (!isValidDate(penilaian_mulai) || !isValidDate(penilaian_selesai)) {
    return { error: true, message: "Format tanggal tidak valid", data: null };
  }

  const mulai = new Date(penilaian_mulai);
  const selesai = new Date(penilaian_selesai);
  if (mulai >= selesai) return { error: true, message: "Tanggal selesai harus lebih besar dari tanggal mulai", data: null };

  const updated = await updateTahapDb(id_tahap, { penilaian_mulai: mulai, penilaian_selesai: selesai });
  return { error: false, message: "Jadwal tahap berhasil diperbarui", data: updated };
};

const deleteTahap = async (id_user, id_tahap) => {
  const tahap = await getTahapByIdDb(id_tahap);
  if (!tahap) return { error: true, message: "Tahap tidak ditemukan", data: null };

  const program = await getProgramByIdAndAdminDb(tahap.id_program, id_user);
  if (!program) return { error: true, message: "Akses ditolak", data: null };

  const deleted = await deleteTahapDb(id_tahap);
  return { error: false, message: "Tahap berhasil dihapus", data: deleted };
};

const getKriteriaPenilaian = async (id_user, id_tahap) => {
  const tahap = await getTahapByIdDb(id_tahap);
  if (!tahap) return { error: true, message: "Tahap tidak ditemukan", data: null };

  const program = await getProgramByIdAndAdminDb(tahap.id_program, id_user);
  if (!program) return { error: true, message: "Akses ditolak", data: null };

  const kriteria = await getKriteriaByTahapDb(id_tahap);
  return { error: false, message: "Daftar kriteria penilaian berhasil diambil", data: { tahap, kriteria } };
};

const createKriteriaPenilaian = async (id_user, id_tahap, payload) => {
  const tahap = await getTahapByIdDb(id_tahap);
  if (!tahap) return { error: true, message: "Tahap tidak ditemukan", data: null };

  const program = await getProgramByIdAndAdminDb(tahap.id_program, id_user);
  if (!program) return { error: true, message: "Akses ditolak", data: null };

  const { nama_kriteria, deskripsi, bobot, urutan, status } = payload;

  const missing = [];
  if (!nama_kriteria) missing.push("nama_kriteria");
  if (bobot === undefined || bobot === null || bobot === "") missing.push("bobot");
  if (urutan === undefined || urutan === null || urutan === "") missing.push("urutan");
  if (missing.length > 0) return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };

  const bobotNum = parseInt(bobot);
  const urutanNum = parseInt(urutan);

  if (isNaN(bobotNum) || bobotNum < 1 || bobotNum > 100) return { error: true, message: "Bobot harus berupa angka antara 1 hingga 100", data: null };
  if (isNaN(urutanNum) || urutanNum < 1) return { error: true, message: "Urutan harus berupa angka minimal 1", data: null };

  const urutanExists = await checkUrutanKriteriaExistsDb(id_tahap, urutanNum);
  if (urutanExists) return { error: true, message: `Urutan ${urutanNum} sudah digunakan`, data: null };

  const inserted = await insertKriteriaDb(id_tahap, {
    nama_kriteria: nama_kriteria.trim(),
    deskripsi: deskripsi?.trim() || null,
    bobot: bobotNum,
    urutan: urutanNum,
    status: status !== undefined ? parseInt(status) : 1,
  });
  return { error: false, message: "Kriteria berhasil dibuat", data: inserted };
};

const updateKriteriaPenilaian = async (id_user, id_kriteria, payload) => {
  const kriteria = await getKriteriaByIdDb(id_kriteria);
  if (!kriteria) return { error: true, message: "Kriteria tidak ditemukan", data: null };

  const program = await getProgramByIdAndAdminDb(kriteria.id_program, id_user);
  if (!program) return { error: true, message: "Akses ditolak", data: null };

  const { nama_kriteria, deskripsi, bobot, urutan, status } = payload;

  const missing = [];
  if (!nama_kriteria) missing.push("nama_kriteria");
  if (bobot === undefined || bobot === null || bobot === "") missing.push("bobot");
  if (urutan === undefined || urutan === null || urutan === "") missing.push("urutan");
  if (status === undefined || status === null || status === "") missing.push("status");
  if (missing.length > 0) return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };

  const bobotNum = parseInt(bobot);
  const urutanNum = parseInt(urutan);
  const statusNum = parseInt(status);

  if (isNaN(bobotNum) || bobotNum < 1 || bobotNum > 100) return { error: true, message: "Bobot harus berupa angka antara 1 hingga 100", data: null };
  if (isNaN(urutanNum) || urutanNum < 1) return { error: true, message: "Urutan harus berupa angka minimal 1", data: null };
  if (![0, 1].includes(statusNum)) return { error: true, message: "Status harus bernilai 0 atau 1", data: null };

  const urutanExists = await checkUrutanKriteriaExistsDb(kriteria.id_tahap, urutanNum, id_kriteria);
  if (urutanExists) return { error: true, message: `Urutan ${urutanNum} sudah digunakan`, data: null };

  const updated = await updateKriteriaDb(id_kriteria, {
    nama_kriteria: nama_kriteria.trim(),
    deskripsi: deskripsi?.trim() || null,
    bobot: bobotNum,
    urutan: urutanNum,
    status: statusNum,
  });
  return { error: false, message: "Kriteria berhasil diperbarui", data: updated };
};

const deleteKriteriaPenilaian = async (id_user, id_kriteria) => {
  const kriteria = await getKriteriaByIdDb(id_kriteria);
  if (!kriteria) return { error: true, message: "Kriteria tidak ditemukan", data: null };

  const program = await getProgramByIdAndAdminDb(kriteria.id_program, id_user);
  if (!program) return { error: true, message: "Akses ditolak", data: null };

  const deleted = await deleteKriteriaDb(id_kriteria);
  return { error: false, message: "Kriteria berhasil dihapus", data: deleted };
};

module.exports = {
  getProgramAdmin,
  setProgramTimeline,
  getTahapProgram,
  createTahapProgram,
  updateJadwalTahap,
  deleteTahap,
  getKriteriaPenilaian,
  createKriteriaPenilaian,
  updateKriteriaPenilaian,
  deleteKriteriaPenilaian,
};