const {
    register,
    login,
} = require("../services/auth.service");

const {
    createVerificationToken,
} = require("../services/emailVerification.service");

const registerHandler = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            id_role,
            nim,
            id_prodi,
            tahun_masuk,
        } = req.body;

        const requiredFields = [
            { key: "username", label: "Username" },
            { key: "email", label: "Email" },
            { key: "password", label: "Password" },
            { key: "id_role", label: "Role" },
        ];

        if (Number(id_role) === 1) {
            requiredFields.push(
                { key: "nim", label: "NIM" },
                { key: "id_prodi", label: "Program Studi" },
                { key: "tahun_masuk", label: "Tahun Masuk" }
            );
        }

        const missingFields = requiredFields
            .filter(f => !req.body[f.key])
            .map(f => f.label);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Data registrasi belum lengkap",
                data: {
                    missing_fields: missingFields,
                },
            });
        }

        if (!email.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "Format email tidak valid",
                data: {
                    field: "email",
                },
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password minimal 8 karakter",
                data: {
                    field: "password",
                },
            });
        }

        const foto_ktm = req.file ? req.file.filename : null;

        const user = await register({
            username,
            email,
            password,
            id_role: Number(id_role),
            nim,
            id_prodi: id_prodi ? Number(id_prodi) : null,
            tahun_masuk: tahun_masuk ? Number(tahun_masuk) : null,
            foto_ktm,
        });

        const token = await createVerificationToken(user.id_user);
        const verificationLink = `${process.env.BASE_URL || 'http://localhost:4000'}/api/auth/verify-email?token=${token}`;
        
        console.log("Verification Link:", verificationLink);

        return res.status(201).json({
            success: true,
            message: "Registrasi berhasil. Silakan cek email Anda untuk verifikasi.",
            data: {
                user: {
                    id_user: user.id_user,
                    username: user.username,
                    email: user.email,
                    id_role: user.id_role,
                },
                verification_link: process.env.NODE_ENV === 'development' ? verificationLink : undefined,
            },
        });
        
    } catch (err) {
        console.error("ERROR REGISTRASI:", err);

        if (err.code === "ROLE_NOT_ALLOWED") {
            return res.status(403).json({
                success: false,
                message: "Role tidak diizinkan untuk registrasi",
                data: {
                    allowed_roles: [1, 3, 4, 5],
                },
            });
        }

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
                data: {
                    field,
                },
            });
        }

        if (err.code === "23503") {
            let message = "Data tidak valid";
            
            if (err.constraint?.includes("role")) {
                message = "Role tidak ditemukan";
            } else if (err.constraint?.includes("prodi")) {
                message = "Program Studi tidak ditemukan";
            }
            
            return res.status(400).json({
                success: false,
                message,
                data: {
                    error: "Referensi data tidak valid",
                },
            });
        }

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada sistem",
            data: {
                error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            },
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
                error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            },
        });
    }
};

module.exports = {
    register: registerHandler,
    login: loginHandler,
};