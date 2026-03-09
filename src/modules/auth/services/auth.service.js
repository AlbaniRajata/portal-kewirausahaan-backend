const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { hashPassword, comparePassword } = require("../../../helpers/password.helper");
const {
  createUserDb,
  getUserForLoginDb,
  saveRefreshTokenDb,
  getRefreshTokenDb,
  deleteRefreshTokenDb,
  deleteAllRefreshTokensByUserDb,
} = require("../db/auth.db");

const REFRESH_TOKEN_EXPIRES_DAYS = 7;

const generateAccessToken = (user) => {
  return jwt.sign(
    { id_user: user.id_user, id_role: user.id_role, role: user.nama_role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

const createBaseUser = async (data, client) => {
  const password_hash = await hashPassword(data.password);
  return createUserDb(
    { username: data.username, email: data.email, password_hash, id_role: data.id_role },
    client
  );
};

const login = async ({ email, password }) => {
  const user = await getUserForLoginDb(email);

  if (!user) {
    return { error: "Email atau password salah.", field: "credentials" };
  }

  const match = await comparePassword(password, user.password_hash);
  if (!match) {
    return { error: "Email atau password salah.", field: "credentials" };
  }

  if (!user.email_verified_at) {
    return {
      error: "Email Anda belum diverifikasi. Silakan cek inbox email Anda.",
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

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await saveRefreshTokenDb(user.id_user, refreshToken, expiresAt);

  return {
    token: accessToken,
    refresh_token: refreshToken,
    user: {
      id_user: user.id_user,
      id_role: user.id_role,
      email: user.email,
      username: user.username,
      role: user.nama_role,
    },
  };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) {
    return { error: "Refresh token tidak ditemukan", code: 401 };
  }

  const stored = await getRefreshTokenDb(refreshToken);

  if (!stored) {
    return { error: "Refresh token tidak valid", code: 401 };
  }

  if (new Date(stored.expires_at) < new Date()) {
    await deleteRefreshTokenDb(refreshToken);
    return { error: "Refresh token telah kedaluwarsa. Silakan login kembali.", code: 401 };
  }

  if (stored.is_active !== true) {
    return { error: "Akun tidak aktif", code: 403 };
  }

  const newAccessToken = generateAccessToken(stored);

  return { token: newAccessToken };
};

const logout = async (refreshToken, id_user) => {
  if (refreshToken) {
    await deleteRefreshTokenDb(refreshToken);
  } else if (id_user) {
    await deleteAllRefreshTokensByUserDb(id_user);
  }
};

module.exports = { createBaseUser, login, refresh, logout };