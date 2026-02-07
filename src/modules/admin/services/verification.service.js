const {
    getPendingMahasiswaDb,
    getDetailMahasiswaDb,
    approveMahasiswaDb,
    rejectMahasiswaDb,
    getPendingDosenDb,
    getDetailDosenDb,
    approveDosenDb,
    rejectDosenDb,
} = require("../db/verification.db");

const listPendingMahasiswa = async (filters) => {
    return await getPendingMahasiswaDb(filters);
};

const detailMahasiswa = async (id_user) => {
    const data = await getDetailMahasiswaDb(id_user);
    if (!data) {
        return {
            error: "Data mahasiswa tidak ditemukan.",
            field: "id_user"
        };
    }
    return data;
};

const approveMahasiswa = async (id_user) => {
    const data = await approveMahasiswaDb(id_user);

    if (!data) {
        return {
            error: "Data mahasiswa tidak ditemukan.",
            field: "id_user"
        };
    }

    if (data.error === "EMAIL_NOT_VERIFIED") {
        return { 
            error: "Email mahasiswa belum diverifikasi.",
            field: "email_verified_at"
        };
    }

    if (data.error === "ALREADY_VERIFIED") {
        return {
            error: "Mahasiswa ini sudah diverifikasi sebelumnya.",
            field: "status_verifikasi"
        };
    }

    return data;
};

const rejectMahasiswa = async (id_user, catatan) => {
    if (!catatan || catatan.trim() === "") {
        return {
            error: "Catatan penolakan wajib diisi.",
            field: "catatan"
        };
    }

    const result = await rejectMahasiswaDb(id_user, catatan);

    if (!result) {
        return {
            error: "Data mahasiswa tidak ditemukan.",
            field: "id_user"
        };
    }

    if (result.error === "ALREADY_PROCESSED") {
        return {
            error: "Status mahasiswa ini sudah diproses sebelumnya.",
            field: "status_verifikasi"
        };
    }

    return result;
};

const listPendingDosen = async (filters) => {
    return await getPendingDosenDb(filters);
};

const detailDosen = async (id_user) => {
    const data = await getDetailDosenDb(id_user);
    if (!data) {
        return {
            error: "Data dosen tidak ditemukan.",
            field: "id_user"
        };
    }
    return data;
};

const approveDosen = async (id_user) => {
    const data = await approveDosenDb(id_user);

    if (!data) {
        return {
            error: "Data dosen tidak ditemukan.",
            field: "id_user"
        };
    }

    if (data.error === "EMAIL_NOT_VERIFIED") {
        return { 
            error: "Email dosen belum diverifikasi.",
            field: "email_verified_at"
        };
    }

    if (data.error === "ALREADY_VERIFIED") {
        return {
            error: "Dosen ini sudah diverifikasi sebelumnya.",
            field: "status_verifikasi"
        };
    }

    return data;
};

const rejectDosen = async (id_user) => {
    const result = await rejectDosenDb(id_user);

    if (!result) {
        return {
            error: "Data dosen tidak ditemukan.",
            field: "id_user"
        };
    }

    if (result.error === "ALREADY_PROCESSED") {
        return {
            error: "Status dosen ini sudah diproses sebelumnya.",
            field: "status_verifikasi"
        };
    }

    return result;
};

module.exports = {
    listPendingMahasiswa,
    detailMahasiswa,
    approveMahasiswa,
    rejectMahasiswa,
    listPendingDosen,
    detailDosen,
    approveDosen,
    rejectDosen,
};