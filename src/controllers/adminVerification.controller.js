const {
    listPendingMahasiswa,
    detailMahasiswa,
    approveMahasiswa,
    rejectMahasiswa,
} = require("../services/adminVerification.service");

const getPendingMahasiswa = async (req, res) => {
    const data = await listPendingMahasiswa();
    return res.json({
        message: "Daftar mahasiswa menunggu verifikasi",
        data,
    });
};

const getDetailMahasiswa = async (req, res) => {
    const { id } = req.params;

    const result = await detailMahasiswa(id);
    if (result.error) {
        return res.status(404).json({
            message: "Mahasiswa tidak ditemukan",
        });
    }

    return res.json({
        message: "Detail mahasiswa",
        data: result,
    });
};

const approveMahasiswaController = async (req, res) => {
    const { id } = req.params;

    const result = await approveMahasiswa(id);

    if (result.error === "NOT_FOUND") {
        return res.status(404).json({
            message: "Mahasiswa tidak ditemukan",
        });
    }

    return res.json({
        message: "Mahasiswa berhasil diverifikasi",
        data: result,
    });
};

const rejectMahasiswaController = async (req, res) => {
    const { id } = req.params;

    if (!req.body || !req.body.catatan) {
        return res.status(400).json({
            message: "Catatan penolakan wajib diisi",
            field: "catatan",
        });
    }

    const { catatan } = req.body;

    const result = await rejectMahasiswa(id, catatan);

    if (result.error === "CATATAN_WAJIB") {
        return res.status(400).json({ message: "Catatan penolakan wajib diisi" });
    }

    if (result.error === "MAHASISWA_TIDAK_DITEMUKAN") {
        return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
    }

    return res.json({
        message: "Mahasiswa ditolak",
        data: result,
    });
};

module.exports = {
    getPendingMahasiswa,
    getDetailMahasiswa,
    approveMahasiswaController,
    rejectMahasiswaController,
};
