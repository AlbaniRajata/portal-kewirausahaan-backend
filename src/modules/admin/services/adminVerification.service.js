const {
    getPendingMahasiswaDb,
    getDetailMahasiswaDb,
    approveMahasiswaDb,
    rejectMahasiswaDb,
} = require("../db/adminVerification.db");

const listPendingMahasiswa = async () => {
    return await getPendingMahasiswaDb();
};

const detailMahasiswa = async (id_user) => {
    const data = await getDetailMahasiswaDb(id_user);
    if (!data) {
        return { error: "DATA_TIDAK_DITEMUKAN" };
    }
    return data;
};

const approveMahasiswa = async (id_user) => {
    const data = await approveMahasiswaDb(id_user);
    if (!data) return { error: "NOT_FOUND" };
    return data;
};

const rejectMahasiswa = async (id_user, catatan) => {
    if (!catatan || catatan.trim() === "") {
        return { error: "CATATAN_WAJIB" };
    }

    const result = await rejectMahasiswaDb(id_user, catatan);
    if (!result) return { error: "MAHASISWA_TIDAK_DITEMUKAN" };
    return result;
};

module.exports = {
    listPendingMahasiswa,
    detailMahasiswa,
    approveMahasiswa,
    rejectMahasiswa,
};
