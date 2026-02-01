const { 
  setProgramTimeline,
  getTahapProgram,
  createTahapProgram,
  updateJadwalTahap
} = require("../services/program.service");

const setProgramTimelineController = async (req, res) => {
  try {
    const { id_program } = req.params;
    const { pendaftaran_mulai, pendaftaran_selesai } = req.body;

    const result = await setProgramTimeline(id_program, {
      pendaftaran_mulai,
      pendaftaran_selesai,
    });

    if (result.error) {
      return res.status(400).json({
        message: result.message,
        data: result.data,
      });
    }

    return res.json({
      message: "Timeline pendaftaran berhasil diperbarui",
      data: result.data,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada sistem",
      data: null,
    });
  }
};

const getTahapProgramController = async (req, res) => {
  const { id_program } = req.params;

  const result = await getTahapProgram(id_program);

  return res.json({
    success: true,
    data: result.data,
  });
};

const createTahapProgramController = async (req, res) => {
  const { id_program } = req.params;

  const result = await createTahapProgram(id_program, req.body);

  if (result.error) {
    return res.status(400).json({
      success: false,
      message: result.message,
      data: result.data,
    });
  }

  return res.json({
    success: true,
    message: result.message,
    data: result.data,
  });
};

const updateJadwalTahapController = async (req, res) => {
  const { id_tahap } = req.params;

  const result = await updateJadwalTahap(id_tahap, req.body);

  if (result.error) {
    return res.status(400).json({
      success: false,
      message: result.message,
      data: result.data,
    });
  }

  return res.json({
    success: true,
    message: result.message,
    data: result.data,
  });
};

module.exports = {
  setProgramTimelineController,
  getTahapProgramController,
  createTahapProgramController,
  updateJadwalTahapController,
};
