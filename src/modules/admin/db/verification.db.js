const pool = require("../../../config/db");

const getPendingMahasiswaDb = async (filters = {}) => {
    const conditions = ["u.id_role = 1"];
    const params = [];
    let paramIndex = 1;

    if (filters.status_verifikasi !== undefined) {
        conditions.push(`m.status_verifikasi = $${paramIndex}`);
        params.push(filters.status_verifikasi);
        paramIndex++;
    }

    if (filters.email_verified !== undefined) {
        if (filters.email_verified) {
            conditions.push(`u.email_verified_at IS NOT NULL`);
        } else {
            conditions.push(`u.email_verified_at IS NULL`);
        }
    }

    if (filters.id_prodi) {
        conditions.push(`m.id_prodi = $${paramIndex}`);
        params.push(filters.id_prodi);
        paramIndex++;
    }

    if (filters.tanggal_dari) {
        conditions.push(`u.created_at >= $${paramIndex}`);
        params.push(filters.tanggal_dari);
        paramIndex++;
    }

    if (filters.tanggal_sampai) {
        conditions.push(`u.created_at <= $${paramIndex}`);
        params.push(filters.tanggal_sampai);
        paramIndex++;
    }

    const q = `
        SELECT
            u.id_user,
            u.nama_lengkap,
            u.username,
            u.email,
            m.nim,
            p.nama_prodi,
            p.jenjang,
            m.tahun_masuk,
            m.foto_ktm,
            u.email_verified_at,
            u.is_active,
            m.status_verifikasi,
            u.created_at
        FROM m_user u
        JOIN m_mahasiswa m ON m.id_user = u.id_user
        LEFT JOIN m_prodi p ON p.id_prodi = m.id_prodi
        WHERE ${conditions.join(' AND ')}
        ORDER BY u.created_at DESC
    `;

    const { rows } = await pool.query(q, params);
    return rows;
};

const getDetailMahasiswaDb = async (id_user) => {
    const q = `
        SELECT
            u.id_user,
            u.nama_lengkap,
            u.username,
            u.email,
            u.no_hp,
            u.alamat,
            u.foto,
            m.nim,
            m.id_prodi,
            p.nama_prodi,
            p.jenjang,
            j.nama_jurusan,
            k.nama_kampus,
            m.tahun_masuk,
            m.foto_ktm,
            m.status_verifikasi,
            m.status_mahasiswa,
            m.catatan,
            u.email_verified_at,
            u.is_active,
            u.created_at
        FROM m_user u
        JOIN m_mahasiswa m ON m.id_user = u.id_user
        LEFT JOIN m_prodi p ON p.id_prodi = m.id_prodi
        LEFT JOIN m_jurusan j ON j.id_jurusan = p.id_jurusan
        LEFT JOIN m_kampus k ON k.id_kampus = p.id_kampus
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
            SELECT u.email_verified_at, m.status_verifikasi
            FROM m_user u
            JOIN m_mahasiswa m ON m.id_user = u.id_user
            WHERE u.id_user = $1
        `;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        if (!checkResult.rows[0].email_verified_at) {
            await client.query("ROLLBACK");
            return {
                error: "EMAIL_NOT_VERIFIED"
            };
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
                m.status_verifikasi
            FROM m_user u
            JOIN m_mahasiswa m ON m.id_user = u.id_user
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

const getPendingDosenDb = async (filters = {}) => {
    const conditions = ["u.id_role = 3"];
    const params = [];
    let paramIndex = 1;

    if (filters.status_verifikasi !== undefined) {
        conditions.push(`d.status_verifikasi = $${paramIndex}`);
        params.push(filters.status_verifikasi);
        paramIndex++;
    }

    if (filters.email_verified !== undefined) {
        if (filters.email_verified) {
            conditions.push(`u.email_verified_at IS NOT NULL`);
        } else {
            conditions.push(`u.email_verified_at IS NULL`);
        }
    }

    if (filters.id_prodi) {
        conditions.push(`d.id_prodi = $${paramIndex}`);
        params.push(filters.id_prodi);
        paramIndex++;
    }

    if (filters.tanggal_dari) {
        conditions.push(`u.created_at >= $${paramIndex}`);
        params.push(filters.tanggal_dari);
        paramIndex++;
    }

    if (filters.tanggal_sampai) {
        conditions.push(`u.created_at <= $${paramIndex}`);
        params.push(filters.tanggal_sampai);
        paramIndex++;
    }

    const q = `
        SELECT
            u.id_user,
            u.nama_lengkap,
            u.username,
            u.email,
            d.nip,
            p.nama_prodi,
            p.jenjang,
            d.bidang_keahlian,
            u.email_verified_at,
            u.is_active,
            d.status_verifikasi,
            u.created_at
        FROM m_user u
        JOIN m_dosen d ON d.id_user = u.id_user
        LEFT JOIN m_prodi p ON p.id_prodi = d.id_prodi
        WHERE ${conditions.join(' AND ')}
        ORDER BY u.created_at DESC
    `;

    const { rows } = await pool.query(q, params);
    return rows;
};

const getDetailDosenDb = async (id_user) => {
    const q = `
        SELECT
            u.id_user,
            u.nama_lengkap,
            u.username,
            u.email,
            u.no_hp,
            u.alamat,
            u.foto,
            d.nip,
            d.id_prodi,
            p.nama_prodi,
            p.jenjang,
            j.nama_jurusan,
            k.nama_kampus,
            d.bidang_keahlian,
            d.status_verifikasi,
            u.email_verified_at,
            u.is_active,
            u.created_at
        FROM m_user u
        JOIN m_dosen d ON d.id_user = u.id_user
        LEFT JOIN m_prodi p ON p.id_prodi = d.id_prodi
        LEFT JOIN m_jurusan j ON j.id_jurusan = p.id_jurusan
        LEFT JOIN m_kampus k ON k.id_kampus = p.id_kampus
        WHERE u.id_user = $1
    `;

    const { rows } = await pool.query(q, [id_user]);
    return rows[0];
};

const approveDosenDb = async (id_user) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const checkQuery = `
            SELECT u.email_verified_at, d.status_verifikasi
            FROM m_user u
            JOIN m_dosen d ON d.id_user = u.id_user
            WHERE u.id_user = $1
        `;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        if (!checkResult.rows[0].email_verified_at) {
            await client.query("ROLLBACK");
            return {
                error: "EMAIL_NOT_VERIFIED"
            };
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
            `UPDATE m_dosen SET status_verifikasi = 1 WHERE id_user = $1`,
            [id_user]
        );

        const { rows } = await client.query(
            `
            SELECT
                u.id_user,
                u.username,
                u.email,
                u.is_active,
                d.nip,
                d.status_verifikasi
            FROM m_user u
            JOIN m_dosen d ON d.id_user = u.id_user
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

const rejectDosenDb = async (id_user) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const checkQuery = `
            SELECT d.status_verifikasi
            FROM m_dosen d
            WHERE d.id_user = $1
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
            `UPDATE m_dosen SET status_verifikasi = 2 WHERE id_user = $1`,
            [id_user]
        );

        const { rows } = await client.query(
            `
            SELECT 
                u.id_user,
                u.username,
                u.email,
                d.nip,
                p.nama_prodi,
                d.status_verifikasi
            FROM m_user u
            JOIN m_dosen d ON d.id_user = u.id_user
            LEFT JOIN m_prodi p ON p.id_prodi = d.id_prodi
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
    getPendingDosenDb,
    getDetailDosenDb,
    approveDosenDb,
    rejectDosenDb,
};