const { login } = require("../services/auth.service");

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

module.exports = loginHandler;