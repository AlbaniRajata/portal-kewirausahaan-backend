const { 
  getProgramByIdDb, 
  updateProgramTimelineDb,
  getTahapByProgramDb,
  insertTahapDb,
  updateTahapDb
} = require("../db/program.db");

const setProgramTimeline = async (id_program, data) => {
  if (!data.pendaftaran_mulai || !data.pendaftaran_selesai) {
    return {
      error: true,
      message: "Tanggal mulai dan selesai wajib diisi",
      data: null,
    };
  }

  const mulai = new Date(data.pendaftaran_mulai);
  const selesai = new Date(data.pendaftaran_selesai);

  if (mulai >= selesai) {
    return {
      error: true,
      message: "Tanggal selesai harus lebih besar dari tanggal mulai",
      data: null,
    };
  }

  const program = await getProgramByIdDb(id_program);
  if (!program) {
    return {
      error: true,
      message: "Program tidak ditemukan",
      data: null,
    };
  }

  await updateProgramTimelineDb(id_program, {
    pendaftaran_mulai: mulai,
    pendaftaran_selesai: selesai,
  });

  const updated = await getProgramByIdDb(id_program);

  return {
    error: false,
    data: updated,
  };
};

const getTahapProgram = async (id_program) => {
  const tahap = await getTahapByProgramDb(id_program);

  return {
    error: false,
    data: tahap,
  };
};

const createTahapProgram = async (id_program, payload) => {
  const { nama_tahap, urutan, penilaian_mulai, penilaian_selesai } = payload;

  if (!nama_tahap || !urutan || !penilaian_mulai || !penilaian_selesai) {
    return {
      error: true,
      message: "Semua field wajib diisi",
      data: payload,
    };
  }

  const mulai = new Date(penilaian_mulai);
  const selesai = new Date(penilaian_selesai);

  if (mulai >= selesai) {
    return {
      error: true,
      message: "Tanggal mulai harus sebelum tanggal selesai",
      data: payload,
    };
  }

  const inserted = await insertTahapDb(id_program, {
    nama_tahap,
    urutan,
    penilaian_mulai: mulai,
    penilaian_selesai: selesai,
  });

  return {
    error: false,
    message: "Tahap berhasil dibuat",
    data: inserted,
  };
};

const updateJadwalTahap = async (id_tahap, payload) => {
  const { penilaian_mulai, penilaian_selesai } = payload;

  const mulai = new Date(penilaian_mulai);
  const selesai = new Date(penilaian_selesai);

  if (mulai >= selesai) {
    return {
      error: true,
      message: "Tanggal tidak valid",
      data: payload,
    };
  }

  const updated = await updateTahapDb(id_tahap, {
    penilaian_mulai: mulai,
    penilaian_selesai: selesai,
  });

  return {
    error: false,
    message: "Jadwal tahap berhasil diperbarui",
    data: updated,
  };
};

module.exports = {
  setProgramTimeline,
  getTahapProgram,
  createTahapProgram,
  updateJadwalTahap,
};
