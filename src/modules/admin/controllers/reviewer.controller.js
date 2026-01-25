const {
  createReviewer,
  getReviewers,
  getReviewerDetail,
} = require("../services/reviewer.service");

const createReviewerController = async (req, res) => {
  try {
    const result = await createReviewer(req.body);

    if (result.error) {
      return res.status(400).json(result);
    }

    return res.json({
      message: "Reviewer internal berhasil didaftarkan",
      data: result.data,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada sistem",
      data: { error: err.message },
    });
  }
};

const getReviewersController = async (req, res) => {
  const result = await getReviewers();
  return res.json({
    message: "Daftar reviewer internal",
    data: result.data,
  });
};

const getReviewerDetailController = async (req, res) => {
  const result = await getReviewerDetail(req.params.id_user);

  if (result.error) {
    return res.status(404).json(result);
  }

  return res.json({
    message: "Detail reviewer internal",
    data: result.data,
  });
};

module.exports = {
  createReviewerController,
  getReviewersController,
  getReviewerDetailController,
};
