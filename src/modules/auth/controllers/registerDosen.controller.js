const { registerDosen } = require("../services/dosen.service");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const registerDosenHandler = async (req, res, next) => {
  try {
    const { username, email, password, nip, id_prodi, bidang_keahlian } = req.body;

    const requiredFields = [
      { key: "username", label: "Username" },
      { key: "email", label: "Email" },
      { key: "password", label: "Password" },
      { key: "nip", label: "NIP" },
      { key: "id_prodi", label: "Program Studi" },
    ];

    const missingFields = requiredFields
      .filter((f) => !req.body[f.key])
      .map((f) => f.label);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Data registrasi belum lengkap",
        data: { missing_fields: missingFields },
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
        data: { field: "email" },
      });
    }

    if (password.length < 8 || password.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Password harus antara 8 hingga 255 karakter",
        data: { field: "password" },
      });
    }

    if (!/^\d{8,20}$/.test(nip)) {
      return res.status(400).json({
        success: false,
        message: "Format NIP tidak valid",
        data: { field: "nip" },
      });
    }

    if (!Number.isInteger(Number(id_prodi)) || Number(id_prodi) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Program studi tidak valid",
        data: { field: "id_prodi" },
      });
    }

    const { user, token } = await registerDosen({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      nip: nip.trim(),
      id_prodi: Number(id_prodi),
      bidang_keahlian: bidang_keahlian?.trim() || null,
    });

    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;

    if (process.env.NODE_ENV === "development") {
      console.log("[DEV] Verification Link:", verificationLink);
    }

    return res.status(201).json({
      success: true,
      message: "Registrasi dosen berhasil. Silakan cek email untuk verifikasi.",
      data: {
        user: {
          id_user: user.id_user,
          username: user.username,
          email: user.email,
          id_role: user.id_role,
        },
        ...(process.env.NODE_ENV === "development" && { verification_link: verificationLink }),
      },
    });
  } catch (err) {
    if (err.code === "23505") {
      const constraint = err.constraint || "";
      const conflictMap = {
        email: { field: "email", message: "Email sudah terdaftar" },
        username: { field: "username", message: "Username sudah digunakan" },
        nip: { field: "nip", message: "NIP sudah terdaftar" },
      };

      const match = Object.entries(conflictMap).find(([key]) =>
        constraint.includes(key)
      );

      const { field, message } = match
        ? match[1]
        : { field: "data", message: "Data sudah terdaftar" };

      return res.status(409).json({
        success: false,
        message,
        data: { field },
      });
    }

    next(err);
  }
};

module.exports = registerDosenHandler;