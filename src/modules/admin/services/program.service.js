const {
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

const getProgramAdmin = async (id_user) => {
  const program = await getProgramByAdminDb(id_user);

  if (!program) {
    return {
      error: true,
      message: "Program tidak ditemukan atau akses ditolak",
      data: null,
    };
  }

  return {
    error: false,
    message: "Data program admin",
    data: program,
  };
};

const setProgramTimeline = async (id_user, id_program, data) => {
  const program = await getProgramByIdAndAdminDb(id_program, id_user);

  if (!program) {
    return {
      error: true,
      message: "Akses ditolak",
      data: null,
    };
  }

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

  const updated = await updateProgramTimelineDb(id_program, {
    pendaftaran_mulai: mulai,
    pendaftaran_selesai: selesai,
  });

  return {
    error: false,
    message: "Timeline pendaftaran berhasil diperbarui",
    data: updated,
  };
};

const getTahapProgram = async (id_user, id_program) => {
  const program = await getProgramByIdAndAdminDb(id_program, id_user);

  if (!program) {
    return {
      error: true,
      message: "Akses ditolak",
      data: null,
    };
  }

  const tahap = await getTahapByProgramDb(id_program);

  return {
    error: false,
    message: "Daftar tahap penilaian",
    data: tahap,
  };
};

const createTahapProgram = async (id_user, id_program, payload) => {
  const program = await getProgramByIdAndAdminDb(id_program, id_user);

  if (!program) {
    return {
      error: true,
      message: "Akses ditolak",
      data: null,
    };
  }

  const { nama_tahap, urutan, penilaian_mulai, penilaian_selesai } = payload;

  if (!nama_tahap || !urutan || !penilaian_mulai || !penilaian_selesai) {
    return {
      error: true,
      message: "Semua field wajib diisi",
      data: null,
    };
  }

  if (Number(urutan) < 1) {
    return {
      error: true,
      message: "Urutan minimal 1",
      data: null,
    };
  }

  const mulai = new Date(penilaian_mulai);
  const selesai = new Date(penilaian_selesai);

  if (mulai >= selesai) {
    return {
      error: true,
      message: "Tanggal selesai harus lebih besar dari tanggal mulai",
      data: null,
    };
  }

  const urutanExists = await checkUrutanExistsDb(id_program, urutan);

  if (urutanExists) {
    return {
      error: true,
      message: `Urutan ${urutan} sudah digunakan`,
      data: null,
    };
  }

  const inserted = await insertTahapDb(id_program, {
    nama_tahap,
    urutan: Number(urutan),
    penilaian_mulai: mulai,
    penilaian_selesai: selesai,
  });

  return {
    error: false,
    message: "Tahap berhasil dibuat",
    data: inserted,
  };
};

const updateJadwalTahap = async (id_user, id_tahap, payload) => {
  const tahap = await getTahapByIdDb(id_tahap);

  if (!tahap) {
    return {
      error: true,
      message: "Tahap tidak ditemukan",
      data: null,
    };
  }

  const program = await getProgramByIdAndAdminDb(tahap.id_program, id_user);

  if (!program) {
    return {
      error: true,
      message: "Akses ditolak",
      data: null,
    };
  }

  const { penilaian_mulai, penilaian_selesai } = payload;

  if (!penilaian_mulai || !penilaian_selesai) {
    return {
      error: true,
      message: "Tanggal mulai dan selesai wajib diisi",
      data: null,
    };
  }

  const mulai = new Date(penilaian_mulai);
  const selesai = new Date(penilaian_selesai);

  if (mulai >= selesai) {
    return {
      error: true,
      message: "Tanggal selesai harus lebih besar dari tanggal mulai",
      data: null,
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

const deleteTahap = async (id_user, id_tahap) => {
  const tahap = await getTahapByIdDb(id_tahap);

  if (!tahap) {
    return {
      error: true,
      message: "Tahap tidak ditemukan",
      data: null,
    };
  }

  const program = await getProgramByIdAndAdminDb(tahap.id_program, id_user);

  if (!program) {
    return {
      error: true,
      message: "Akses ditolak",
      data: null,
    };
  }

  const deleted = await deleteTahapDb(id_tahap);

  return {
    error: false,
    message: "Tahap berhasil dihapus",
    data: deleted,
  };
};

const getKriteriaPenilaian = async (id_user, id_tahap) => {
  const tahap = await getTahapByIdDb(id_tahap);

  if (!tahap) {
    return {
      error: true,
      message: "Tahap tidak ditemukan",
      data: null,
    };
  }

  const program = await getProgramByIdAndAdminDb(tahap.id_program, id_user);

  if (!program) {
    return {
      error: true,
      message: "Akses ditolak",
      data: null,
    };
  }

  const kriteria = await getKriteriaByTahapDb(id_tahap);

  return {
    error: false,
    message: "Daftar kriteria penilaian",
    data: {
      tahap,
      kriteria,
    },
  };
};

const createKriteriaPenilaian = async (id_user, id_tahap, payload) => {
  const tahap = await getTahapByIdDb(id_tahap);

  if (!tahap) {
    return {
      error: true,
      message: "Tahap tidak ditemukan",
      data: null,
    };
  }

  const program = await getProgramByIdAndAdminDb(tahap.id_program, id_user);

  if (!program) {
    return {
      error: true,
      message: "Akses ditolak",
      data: null,
    };
  }

  const { nama_kriteria, deskripsi, bobot, urutan, status } = payload;

  if (!nama_kriteria || bobot === undefined || urutan === undefined) {
    return {
      error: true,
      message: "Nama kriteria, bobot, dan urutan wajib diisi",
      data: null,
    };
  }

  if (Number(bobot) < 1 || Number(bobot) > 100) {
    return {
      error: true,
      message: "Bobot harus antara 1-100",
      data: null,
    };
  }

  if (Number(urutan) < 1) {
    return {
      error: true,
      message: "Urutan minimal 1",
      data: null,
    };
  }

  const urutanExists = await checkUrutanKriteriaExistsDb(id_tahap, urutan);

  if (urutanExists) {
    return {
      error: true,
      message: `Urutan ${urutan} sudah digunakan`,
      data: null,
    };
  }

  const inserted = await insertKriteriaDb(id_tahap, {
    nama_kriteria,
    deskripsi,
    bobot: Number(bobot),
    urutan: Number(urutan),
    status: status !== undefined ? Number(status) : 1,
  });

  return {
    error: false,
    message: "Kriteria berhasil dibuat",
    data: inserted,
  };
};

const updateKriteriaPenilaian = async (id_user, id_kriteria, payload) => {
  const kriteria = await getKriteriaByIdDb(id_kriteria);

  if (!kriteria) {
    return {
      error: true,
      message: "Kriteria tidak ditemukan",
      data: null,
    };
  }

  const program = await getProgramByIdAndAdminDb(kriteria.id_program, id_user);

  if (!program) {
    return {
      error: true,
      message: "Akses ditolak",
      data: null,
    };
  }

  const { nama_kriteria, deskripsi, bobot, urutan, status } = payload;

  if (!nama_kriteria || bobot === undefined || urutan === undefined || status === undefined) {
    return {
      error: true,
      message: "Semua field wajib diisi",
      data: null,
    };
  }

  if (Number(bobot) < 1 || Number(bobot) > 100) {
    return {
      error: true,
      message: "Bobot harus antara 1-100",
      data: null,
    };
  }

  if (Number(urutan) < 1) {
    return {
      error: true,
      message: "Urutan minimal 1",
      data: null,
    };
  }

  const urutanExists = await checkUrutanKriteriaExistsDb(
    kriteria.id_tahap,
    urutan,
    id_kriteria
  );

  if (urutanExists) {
    return {
      error: true,
      message: `Urutan ${urutan} sudah digunakan`,
      data: null,
    };
  }

  const updated = await updateKriteriaDb(id_kriteria, {
    nama_kriteria,
    deskripsi,
    bobot: Number(bobot),
    urutan: Number(urutan),
    status: Number(status),
  });

  return {
    error: false,
    message: "Kriteria berhasil diperbarui",
    data: updated,
  };
};

const deleteKriteriaPenilaian = async (id_user, id_kriteria) => {
  const kriteria = await getKriteriaByIdDb(id_kriteria);

  if (!kriteria) {
    return {
      error: true,
      message: "Kriteria tidak ditemukan",
      data: null,
    };
  }

  const program = await getProgramByIdAndAdminDb(kriteria.id_program, id_user);

  if (!program) {
    return {
      error: true,
      message: "Akses ditolak",
      data: null,
    };
  }

  const deleted = await deleteKriteriaDb(id_kriteria);

  return {
    error: false,
    message: "Kriteria berhasil dihapus",
    data: deleted,
  };
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