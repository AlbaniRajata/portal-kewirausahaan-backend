const {
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
} = require("../services/auth.service");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const loginHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
        data: {
          missing_fields: [
            ...(!email ? ["email"] : []),
            ...(!password ? ["password"] : []),
          ],
        },
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
        data: { field: "email" },
      });
    }

    if (password.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Input tidak valid",
        data: null,
      });
    }

    const result = await login({ email: email.toLowerCase().trim(), password });

    if (result.error) {
      return res.status(401).json({
        success: false,
        message: result.error,
        data: { field: result.field },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const refreshHandler = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token wajib diisi",
        data: null,
      });
    }

    const result = await refresh(refresh_token);

    if (result.error) {
      return res.status(result.code || 401).json({
        success: false,
        message: result.error,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token berhasil diperbarui",
      data: { token: result.token },
    });
  } catch (err) {
    next(err);
  }
};

const logoutHandler = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    const id_user = req.user?.id_user;

    await logout(refresh_token, id_user);

    return res.status(200).json({
      success: true,
      message: "Logout berhasil",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

const forgotPasswordHandler = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email wajib diisi",
        data: { field: "email" },
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
        data: { field: "email" },
      });
    }

    const result = await requestPasswordReset(email.toLowerCase().trim());

    return res.status(200).json({
      success: true,
      message: result.message,
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

const resetPasswordHandler = async (req, res, next) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Token dan password baru wajib diisi",
        data: {
          missing_fields: [
            ...(!token ? ["token"] : []),
            ...(!new_password ? ["new_password"] : []),
          ],
        },
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 8 karakter",
        data: { field: "new_password" },
      });
    }

    if (new_password.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Input tidak valid",
        data: { field: "new_password" },
      });
    }

    const result = await resetPassword({ token, newPassword: new_password });

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password berhasil diubah. Silahkan login kembali.",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  loginHandler,
  refreshHandler,
  logoutHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
};