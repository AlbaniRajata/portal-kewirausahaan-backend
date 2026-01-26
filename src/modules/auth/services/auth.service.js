const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../../../config/db");
const {
    createUserDb,
    createMahasiswaDb,
    getUserForLoginDb,
} = require("../db/auth.db");

const ALLOWED_REGISTER_ROLES = [1, 3, 4, 5];

const register = async (data) => {
    const client = await pool.connect();
    
    try {
        if (!ALLOWED_REGISTER_ROLES.includes(data.id_role)) {
            throw {
                code: "ROLE_NOT_ALLOWED",
            };
        }

        await client.query('BEGIN');

        const password_hash = await bcrypt.hash(data.password, 10);

        const user = await createUserDb({
            username: data.username,
            email: data.email,
            password_hash,
            id_role: data.id_role,
        }, client);

        if (data.id_role === 1) {
            await createMahasiswaDb({
                id_user: user.id_user,
                nim: data.nim,
                id_prodi: data.id_prodi,
                tahun_masuk: data.tahun_masuk,
                foto_ktm: data.foto_ktm,
            }, client);
        }

        await client.query('COMMIT');
        
        return user;
        
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const login = async ({ email, password }) => {
    const user = await getUserForLoginDb(email);

    if (!user) {
        return { 
            error: "Email tidak terdaftar dalam sistem. Silakan lakukan registrasi terlebih dahulu.",
            field: "email"
        };
    }
    
    if (!user.email_verified_at) {
        return { 
            error: "Email Anda belum diverifikasi. Silakan cek inbox email Anda dan klik link verifikasi yang telah dikirimkan.",
            field: "email_verified"
        };
    }
    
    if (user.is_active !== true) {
        return { 
            error: "Akun Anda tidak aktif. Silakan hubungi administrator untuk mengaktifkan kembali akun Anda.",
            field: "is_active"
        };
    }

    if (user.nama_role === "mahasiswa" && user.status_verifikasi !== 1) {
        return { 
            error: "Akun mahasiswa Anda masih dalam proses verifikasi oleh admin. Silakan tunggu konfirmasi lebih lanjut.",
            field: "status_verifikasi"
        };
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        return { 
            error: "Password yang Anda masukkan salah. Silakan periksa kembali password Anda.",
            field: "password"
        };
    }

    const token = jwt.sign(
        {
            id_user: user.id_user,
            id_role: user.id_role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return {
        token,
        user: {
            id_user: user.id_user,
            id_role: user.id_role,
            email: user.email,
            username: user.username,
            role: user.nama_role,
        },
    };
};

module.exports = {
    register,
    login,
};