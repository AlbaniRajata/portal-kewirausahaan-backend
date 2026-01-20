const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    createUserDb,
    createMahasiswaDb,
    getUserForLoginDb,
} = require("../db/auth.db");

const ALLOWED_REGISTER_ROLES = [1, 3, 4, 5];

const register = async (data) => {
    if (!ALLOWED_REGISTER_ROLES.includes(data.id_role)) {
        throw {
            code: "ROLE_NOT_ALLOWED",
        };
    }

    const password_hash = await bcrypt.hash(data.password, 10);

    const user = await createUserDb({
        username: data.username,
        email: data.email,
        password_hash,
        id_role: data.id_role,
    });

    if (data.id_role === 1) {
        await createMahasiswaDb({
            id_user: user.id_user,
            nim: data.nim,
            prodi: data.prodi,
            foto_ktm: data.foto_ktm,
        });
    }

    return user;
};

const login = async ({ email, password }) => {
    const user = await getUserForLoginDb(email);

    if (!user) return { error: "EMAIL_TIDAK_TERDAFTAR" };
    if (!user.email_verified_at) return { error: "EMAIL_BELUM_VERIFIED" };
    if (user.is_active !== 1) return { error: "AKUN_TIDAK_AKTIF" };

    if (
        user.nama_role === "mahasiswa" &&
        user.status_verifikasi !== 1
    ) {
        return { error: "BELUM_DIVERIFIKASI_ADMIN" };
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return { error: "PASSWORD_SALAH" };

    const token = jwt.sign(
        {
            id_user: user.id_user,
            role: user.nama_role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return {
        token,
        user: {
            id_user: user.id_user,
            email: user.email,
            role: user.nama_role,
        },
    };
};

module.exports = {
    register,
    login,
};
