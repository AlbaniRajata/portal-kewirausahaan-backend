const { setProgramTimeline } = require("../services/program.service");

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

module.exports = {
  setProgramTimelineController,
};
