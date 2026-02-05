const { registerMahasiswa } = require("../services/mahasiswa.service");
const { createVerificationToken } = require("../../auth/services/emailVerification.service");

const registerMahasiswaHandler = async (req, res) => {
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
      .filter(f => !req.body[f.key])
      .map(f => f.label);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Data registrasi belum lengkap",
        data: { missing_fields: missingFields },
      });
    }

    if (!email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
        data: { field: "email" },
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 8 karakter",
        data: { field: "password" },
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Foto KTM wajib diunggah",
        data: { field: "foto_ktm" },
      });
    }

    const user = await registerMahasiswa({
      username,
      email,
      password,
      id_role: 1,
      nim,
      id_prodi: Number(id_prodi),
      tahun_masuk: Number(tahun_masuk),
      foto_ktm: req.file.filename,
    });

    const token = await createVerificationToken(user.id_user);
    const verificationLink = `${process.env.BASE_URL || "http://localhost:4000"}/api/auth/verify-email?token=${token}`;

    console.log("Verification Link:", verificationLink);

    return res.status(201).json({
      success: true,
      message: "Registrasi mahasiswa berhasil. Silakan cek email untuk verifikasi.",
      data: {
        user: {
          id_user: user.id_user,
          username: user.username,
          email: user.email,
          id_role: user.id_role,
        },
        verification_link:
          process.env.NODE_ENV === "development" ? verificationLink : undefined,
      },
    });
  } catch (err) {
    console.error("ERROR REGISTRASI MAHASISWA:", err);

    if (err.code === "23505") {
      let field = "data";
      let message = "Data sudah terdaftar";

      if (err.constraint?.includes("email")) {
        field = "email";
        message = "Email sudah terdaftar";
      } else if (err.constraint?.includes("username")) {
        field = "username";
        message = "Username sudah digunakan";
      } else if (err.constraint?.includes("nim")) {
        field = "nim";
        message = "NIM sudah terdaftar";
      }

      return res.status(409).json({
        success: false,
        message,
        data: { field },
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada sistem",
      data: {
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
    });
  }
};

module.exports = registerMahasiswaHandler;
