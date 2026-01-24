const { getProgramByIdDb, updateProgramTimelineDb } = require("../db/program.db");

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

module.exports = {
  setProgramTimeline,
};
