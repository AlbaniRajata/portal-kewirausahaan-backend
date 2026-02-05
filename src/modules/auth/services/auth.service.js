const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  createUserDb,
  getUserForLoginDb,
} = require("../db/auth.db");

const createBaseUser = async (data, client) => {
  const password_hash = await bcrypt.hash(data.password, 10);
  return createUserDb(
    {
      username: data.username,
      email: data.email,
      password_hash,
      id_role: data.id_role,
    },
    client
  );
};

const login = async ({ email, password }) => {
  const user = await getUserForLoginDb(email);

  if (!user) {
    return {
      error: "Email tidak terdaftar dalam sistem.",
      field: "email",
    };
  }

  if (!user.email_verified_at) {
    return {
      error: "Email Anda belum diverifikasi.",
      field: "email_verified",
    };
  }

  if (user.is_active !== true) {
    return {
      error: "Akun Anda belum aktif. Silakan tunggu verifikasi admin.",
      field: "is_active",
    };
  }

  if (user.nama_role === "mahasiswa" && user.mahasiswa_verifikasi !== 1) {
    return {
      error: "Akun mahasiswa masih dalam proses verifikasi admin.",
      field: "status_verifikasi",
    };
  }

  if (user.nama_role === "dosen" && user.dosen_verifikasi !== 1) {
    return {
      error: "Akun dosen masih dalam proses verifikasi admin.",
      field: "status_verifikasi",
    };
  }

  const match = await bcrypt.compare(password, user.password_hash);

  if (!match) {
    return {
      error: "Password salah.",
      field: "password",
    };
  }

  const token = jwt.sign(
    {
      id_user: user.id_user,
      id_role: user.id_role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id_user: user.id_user,
      id_role: user.id_role,
      email: user.email,
      username: user.username,
      role: user.nama_role,
    },
  };
};

module.exports = {
  createBaseUser,
  login,
};
