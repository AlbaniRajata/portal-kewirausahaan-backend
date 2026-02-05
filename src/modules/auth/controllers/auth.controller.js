const {
  registerMahasiswa,
  registerDosen,
  login,
} = require("../services/auth.service");
const {
  createVerificationToken,
} = require("../services/emailVerification.service");

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
      .filter((f) => !req.body[f.key])
      .map((f) => f.label);

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

    const foto_ktm = req.file ? req.file.filename : null;

    const user = await registerMahasiswa({
      username,
      email,
      password,
      nim,
      id_prodi: Number(id_prodi),
      tahun_masuk: Number(tahun_masuk),
      foto_ktm,
    });

    const token = await createVerificationToken(user.id_user);
    const verificationLink = `${process.env.BASE_URL || "http://localhost:4000"}/api/auth/verify-email?token=${token}`;

    console.log("Verification Link:", verificationLink);

    return res.status(201).json({
      success: true,
      message:
        "Registrasi mahasiswa berhasil. Silakan cek email Anda untuk verifikasi.",
      data: {
        user,
        verification_link:
          process.env.NODE_ENV === "development" ? verificationLink : undefined,
      },
    });
  } catch (err) {
    console.error("ERROR REGISTRASI MAHASISWA:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada sistem",
    });
  }
};

const registerDosenHandler = async (req, res) => {
  try {
    const { username, email, password, nip, id_prodi } = req.body;

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

    const user = await registerDosen({
      username,
      email,
      password,
      nip,
      id_prodi: Number(id_prodi),
    });

    const token = await createVerificationToken(user.id_user);
    const verificationLink = `${process.env.BASE_URL || "http://localhost:4000"}/api/auth/verify-email?token=${token}`;

    console.log("Verification Link:", verificationLink);

    return res.status(201).json({
      success: true,
      message:
        "Registrasi dosen berhasil. Silakan cek email Anda untuk verifikasi.",
      data: {
        user,
        verification_link:
          process.env.NODE_ENV === "development" ? verificationLink : undefined,
      },
    });
  } catch (err) {
    console.error("ERROR REGISTRASI DOSEN:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada sistem",
    });
  }
};

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
        data: {
          field: result.field,
        },
      });
    }

    return res.json({
      success: true,
      message: "Login berhasil",
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (err) {
    console.error("ERROR LOGIN:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada sistem",
      data: {
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
    });
  }
};

module.exports = {
  registerMahasiswa: registerMahasiswaHandler,
  registerDosen: registerDosenHandler,
  login: loginHandler,
};