const { login } = require("../services/auth.service");

const loginHandler = async (req, res) => {
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

    const result = await login({ email, password });

    if (result.error) {
      return res.status(401).json({
        success: false,
        message: result.error,
        data: { field: result.field },
      });
    }

    return res.json({
      success: true,
      message: "Login berhasil",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada sistem",
      data: {
        error:
          process.env.NODE_ENV === "development"
            ? err.message
            : undefined,
      },
    });
  }
};

module.exports = loginHandler;
