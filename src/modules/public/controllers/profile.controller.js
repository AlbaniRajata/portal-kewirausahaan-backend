
const { getProfile } = require("../services/profile.service");

const getProfileController = async (req, res) => {
  const { id_user } = req.user;

  const result = await getProfile(id_user);

  if (result.error) {
    return res.status(404).json({
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
  getProfileController,
};