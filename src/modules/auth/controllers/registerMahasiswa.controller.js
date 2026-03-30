const { registerMahasiswa } = require("../services/mahasiswa.service");
const fs = require("fs");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidYear = (year) => {
  const y = Number(year);
  const current = new Date().getFullYear();
  return Number.isInteger(y) && y >= 2000 && y <= current;
};

const registerMahasiswaHandler = async (req, res, next) => {
  try {
    const { username, email, password, nim, id_prodi, tahun_masuk } = req.body;

    const requiredFields = [
      { key: "username", label: "Username" },
      { key: "email", label: "Email" },
      { key: "password", label: "Password" },
      { key: "nim", label: "NIM" },
      { key: "id_prodi", label: "Program Studi" },
      { key: "tahun_masuk", label: "Tahun Masuk" },
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

    if (!/^\d{8,20}$/.test(nim)) {
      return res.status(400).json({
        success: false,
        message: "Format NIM tidak valid",
        data: { field: "nim" },
      });
    }

    if (!isValidYear(tahun_masuk)) {
      return res.status(400).json({
        success: false,
        message: "Tahun masuk tidak valid",
        data: { field: "tahun_masuk" },
      });
    }

    if (!Number.isInteger(Number(id_prodi)) || Number(id_prodi) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Program studi tidak valid",
        data: { field: "id_prodi" },
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Foto KTM wajib diunggah",
        data: { field: "foto_ktm" },
      });
    }

    const { user, token } = await registerMahasiswa({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      nim: nim.trim(),
      id_prodi: Number(id_prodi),
      tahun_masuk: Number(tahun_masuk),
      foto_ktm: req.file.filename,
    });

    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;

    if (process.env.NODE_ENV === "development") {
      console.log("[DEV] Verification Link:", verificationLink);
    }

    return res.status(201).json({
      success: true,
      message: "Registrasi mahasiswa berhasil. Kode verifikasi telah dikirim ke email Anda.",
      data: {
        user: {
          id_user: user.id_user,
          username: user.username,
          email: user.email,
          id_role: user.id_role,
        },
      },
    });
  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    if (err.code === "23505") {
      const constraint = err.constraint || "";
      const conflictMap = {
        email: { field: "email", message: "Email sudah terdaftar" },
        username: { field: "username", message: "Username sudah digunakan" },
        nim: { field: "nim", message: "NIM sudah terdaftar" },
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

module.exports = registerMahasiswaHandler;