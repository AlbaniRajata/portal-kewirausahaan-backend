const pool = require("../../../config/db");

const getPendingMahasiswaDb = async () => {
    const q = `
        SELECT
            u.id_user,
            u.username,
            u.email,
            m.nim,
            p.nama_prodi,
            m.tahun_masuk,
            m.foto_ktm,
            u.email_verified_at,
            u.is_active,
            m.status_verifikasi,
            u.created_at
        FROM m_user u
        JOIN m_mahasiswa m ON m.id_user = u.id_user
        LEFT JOIN m_prodi p ON p.id_prodi = m.id_prodi
        WHERE u.id_role = 1
            AND u.email_verified_at IS NOT NULL
            AND u.is_active = FALSE
            AND m.status_verifikasi = 0
        ORDER BY u.created_at DESC
    `;

    const { rows } = await pool.query(q);
    return rows;
};

const getDetailMahasiswaDb = async (id_user) => {
    const q = `
        SELECT
            u.id_user,
            u.username,
            u.email,
            u.no_hp,
            u.foto,
            m.nim,
            m.id_prodi,
            p.nama_prodi,
            m.tahun_masuk,
            m.foto_ktm,
            m.status_verifikasi,
            m.catatan,
            u.email_verified_at,
            u.is_active,
            u.created_at
        FROM m_user u
        JOIN m_mahasiswa m ON m.id_user = u.id_user
        LEFT JOIN m_prodi p ON p.id_prodi = m.id_prodi
        WHERE u.id_user = $1
    `;

    const { rows } = await pool.query(q, [id_user]);
    return rows[0];
};

const approveMahasiswaDb = async (id_user) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const checkQuery = `
            SELECT m.status_verifikasi
            FROM m_mahasiswa m
            WHERE m.id_user = $1
        `;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        if (checkResult.rows[0].status_verifikasi !== 0) {
            await client.query("ROLLBACK");
            return { 
                error: "ALREADY_VERIFIED",
                status_verifikasi: checkResult.rows[0].status_verifikasi,
            };
        }

        await client.query(
            `UPDATE m_user SET is_active = TRUE WHERE id_user = $1`,
            [id_user]
        );

        await client.query(
            `UPDATE m_mahasiswa SET status_verifikasi = 1, catatan = NULL WHERE id_user = $1`,
            [id_user]
        );

        const { rows } = await client.query(
            `
            SELECT
                u.id_user,
                u.username,
                u.email,
                u.is_active,
                m.nim,
                p.nama_prodi,
                m.tahun_masuk,
                m.status_verifikasi
            FROM m_user u
            JOIN m_mahasiswa m ON m.id_user = u.id_user
            LEFT JOIN m_prodi p ON p.id_prodi = m.id_prodi
            WHERE u.id_user = $1
            `,
            [id_user]
        );

        await client.query("COMMIT");
        return rows[0];
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
};

const rejectMahasiswaDb = async (id_user, catatan) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const checkQuery = `
            SELECT m.status_verifikasi
            FROM m_mahasiswa m
            WHERE m.id_user = $1
        `;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        if (checkResult.rows[0].status_verifikasi !== 0) {
            await client.query("ROLLBACK");
            return { 
                error: "ALREADY_PROCESSED",
                status_verifikasi: checkResult.rows[0].status_verifikasi,
            };
        }

        await client.query(
            `
            UPDATE m_mahasiswa
            SET status_verifikasi = 2,
                catatan = $2
            WHERE id_user = $1
            `,
            [id_user, catatan]
        );

        const { rows } = await client.query(
            `
            SELECT 
                u.id_user,
                u.username,
                u.email,
                m.nim,
                p.nama_prodi,
                m.tahun_masuk,
                m.status_verifikasi,
                m.catatan
            FROM m_user u
            JOIN m_mahasiswa m ON m.id_user = u.id_user
            LEFT JOIN m_prodi p ON p.id_prodi = m.id_prodi
            WHERE u.id_user = $1
            `,
            [id_user]
        );

        await client.query("COMMIT");
        return rows[0];
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
};

module.exports = {
    getPendingMahasiswaDb,
    getDetailMahasiswaDb,
    approveMahasiswaDb,
    rejectMahasiswaDb,
};