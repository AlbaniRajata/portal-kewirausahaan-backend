const {
  createJuri,
  getJuris,
  getJuriDetail,
} = require("../services/juri.services");

const createJuriController = async (req, res) => {
  try {
    const result = await createJuri(req.body);

    if (result.error) {
      return res.status(400).json(result);
    }

    return res.json({
      message: "Juri eksternal berhasil didaftarkan",
      data: result.data,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada sistem",
      data: { error: err.message },
    });
  }
};

const getJurisController = async (req, res) => {
  const result = await getJuris();
  return res.json({
    message: "Daftar juri eksternal",
    data: result.data,
  });
};

const getJuriDetailController = async (req, res) => {
  const result = await getJuriDetail(req.params.id_user);

  if (result.error) {
    return res.status(404).json(result);
  }

  return res.json({
    message: "Detail juri eksternal",
    data: result.data,
  });
};

module.exports = {
  createJuriController,
  getJurisController,
  getJuriDetailController,
};
