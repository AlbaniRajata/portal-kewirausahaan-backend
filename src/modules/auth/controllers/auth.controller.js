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
            prodi,
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
                { key: "prodi", label: "Program studi" }
            );
        }

        const missingFields = requiredFields
            .filter(f => !req.body[f.key])
            .map(f => f.label);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: "Data registrasi belum lengkap",
                errors: missingFields,
            });
        }

        if (!email.includes("@")) {
            return res.status(400).json({
                message: "Format email tidak valid",
                field: "email",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password minimal 8 karakter",
                field: "password",
            });
        }

        const foto_ktm = req.file ? req.file.filename : null;

        const user = await register({
            username,
            email,
            password,
            id_role: Number(id_role),
            nim,
            prodi,
            foto_ktm,
        });

        const token = await createVerificationToken(user.id_user);
        const verificationLink = `http://localhost:4000/api/auth/verify-email?token=${token}`;
        
        console.log(verificationLink);

        return res.status(201).json({
            message: "Registrasi berhasil",
            data: user,
            verification_link: verificationLink,
        });
    } catch (err) {
        console.error("ERROR REGISTRASI:", err);

        if (err.code === "ROLE_NOT_ALLOWED") {
            return res.status(403).json({
                message: "Role tidak diizinkan untuk registrasi",
            });
        }

        if (err.code === "23505") {
            return res.status(409).json({
                message: "Data sudah terdaftar",
            });
        }

        return res.status(500).json({
            message: "Terjadi kesalahan pada sistem",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
    }
};

const loginHandler = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email dan password wajib diisi",
            });
        }

        const result = await login({ email, password });

        if (result.error) {
            return res.status(401).json({
                message: result.error,
            });
        }

        return res.json({
            message: "Login berhasil",
            data: result,
        });
    } catch (err) {
        console.error("ERROR LOGIN:", err);
        return res.status(500).json({
            message: "Terjadi kesalahan pada sistem",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
    }
};

module.exports = {
    register: registerHandler,
    login: loginHandler,
};
