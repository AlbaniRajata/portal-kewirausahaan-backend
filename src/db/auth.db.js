const pool = require("../config/db");

const createUserDb = async ({
    username,
    email,
    password_hash,
    id_role,
}) => {
    const q = `
        INSERT INTO m_user (
            id_role, username, email, password_hash, is_active
        )
        VALUES ($1, $2, $3, $4, 0)
        RETURNING id_user, username, email, id_role, is_active
    `;

    const { rows } = await pool.query(q, [
        id_role,
        username,
        email,
        password_hash,
    ]);

    return rows[0];
};

const createMahasiswaDb = async ({
    id_user,
    nim,
    prodi,
    foto_ktm,
}) => {
    const q = `
        INSERT INTO m_mahasiswa (
            id_user, nim, prodi, status_verifikasi, foto_ktm
        )
        VALUES ($1, $2, $3, 0, $4)
    `;

    await pool.query(q, [
        id_user,
        nim,
        prodi,
        foto_ktm,
    ]);

    return true;
};

const getUserForLoginDb = async (email) => {
    const q = `
        SELECT
            u.id_user,
            u.email,
            u.password_hash,
            u.is_active,
            u.email_verified_at,
            u.id_role,
            r.nama_role,
            m.status_verifikasi
        FROM m_user u
        JOIN m_role r ON r.id_role = u.id_role
        LEFT JOIN m_mahasiswa m ON m.id_user = u.id_user
        WHERE u.email = $1
    `;

    const { rows } = await pool.query(q, [email]);
    return rows[0];
};

module.exports = {
    createUserDb,
    createMahasiswaDb,
    getUserForLoginDb,
};
