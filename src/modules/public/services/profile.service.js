
const { getProfileByIdDb } = require("../db/profile.db");

const getProfile = async (id_user) => {
  const user = await getProfileByIdDb(id_user);

  if (!user) {
    return {
      error: true,
      message: "User tidak ditemukan",
      data: null,
    };
  }

  return {
    error: false,
    message: "Profile user",
    data: user,
  };
};

module.exports = {
  getProfile,
};