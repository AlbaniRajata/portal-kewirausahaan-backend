const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { hashPassword, comparePassword } = require("../../../helpers/password.helper");
const {
  createUserDb,
  getUserForLoginDb,
  getUserByEmailForResetDb,
  getUserByIdForResetDb,
  saveRefreshTokenDb,
  getRefreshTokenDb,
  deleteRefreshTokenDb,
  deleteAllRefreshTokensByUserDb,
  updateUserPasswordHashDb,
} = require("../db/auth.db");
const { sendResetPasswordEmail } = require("../../../helpers/email.helper");

const REFRESH_TOKEN_EXPIRES_DAYS = 7;
const RESET_PASSWORD_EXPIRES_MINUTES = 15;

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
      error: "Email Anda belum diverifikasi. Silahkan cek inbox email Anda.",
      field: "email_verified",
    };
  }

  if (user.is_active !== true) {
    return {
      error: "Akun Anda belum aktif. Silahkan tunggu verifikasi admin.",
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
    return { error: "Refresh token telah kedaluwarsa. Silahkan login kembali.", code: 401 };
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

const requestPasswordReset = async (email) => {
  const user = await getUserByEmailForResetDb(email);

  if (!user || user.is_active !== true || !user.email_verified_at) {
    return {
      ok: true,
      message:
        "Jika email terdaftar, kami akan mengirimkan link reset password ke inbox Anda.",
    };
  }

  const resetSecret = `${process.env.JWT_SECRET}${user.password_hash}`;
  const token = jwt.sign(
    { sub: user.id_user, purpose: "reset_password" },
    resetSecret,
    { expiresIn: `${RESET_PASSWORD_EXPIRES_MINUTES}m` }
  );

  const frontendBaseUrl =
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    (process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")[0]
      : "http://localhost:5173");

  const resetLink = `${frontendBaseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;

  await sendResetPasswordEmail(user.email, resetLink);

  return {
    ok: true,
    message:
      "Jika email terdaftar, kami akan mengirimkan link reset password ke inbox Anda.",
  };
};

const resetPassword = async ({ token, newPassword }) => {
  let decoded;

  try {
    const unsafeDecoded = jwt.decode(token);

    if (!unsafeDecoded?.sub || unsafeDecoded?.purpose !== "reset_password") {
      return { error: "Token reset password tidak valid." };
    }

    const user = await getUserByIdForResetDb(unsafeDecoded.sub);
    if (!user || user.is_active !== true || !user.email_verified_at) {
      return { error: "Token reset password tidak valid." };
    }

    const resetSecret = `${process.env.JWT_SECRET}${user.password_hash}`;
    decoded = jwt.verify(token, resetSecret);

    if (!decoded?.sub || decoded?.purpose !== "reset_password") {
      return { error: "Token reset password tidak valid." };
    }

    const newHash = await hashPassword(newPassword);
    await updateUserPasswordHashDb(user.id_user, newHash);
    await deleteAllRefreshTokensByUserDb(user.id_user);

    return { ok: true };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { error: "Token reset password sudah kedaluwarsa." };
    }

    return { error: "Token reset password tidak valid." };
  }
};

module.exports = {
  createBaseUser,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
};