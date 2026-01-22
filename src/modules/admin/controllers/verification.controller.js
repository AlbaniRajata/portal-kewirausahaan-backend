const {
    listPendingMahasiswa,
    detailMahasiswa,
    approveMahasiswa,
    rejectMahasiswa,
} = require("../services/verification.service");

const getPendingMahasiswa = async (req, res) => {
    try {
        const data = await listPendingMahasiswa();
        return res.json({
            success: true,
            message: "Daftar mahasiswa menunggu verifikasi",
            data: {
                mahasiswa: data,
                total: data.length,
            },
        });
    } catch (err) {
        console.error("ERROR GET PENDING MAHASISWA:", err);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada sistem",
            data: {
                error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            },
        });
    }
};

const getDetailMahasiswa = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID mahasiswa tidak valid",
                data: {
                    field: "id",
                },
            });
        }

        const result = await detailMahasiswa(id);
        
        if (result.error) {
            return res.status(404).json({
                success: false,
                message: "Mahasiswa tidak ditemukan",
                data: {
                    id_user: id,
                },
            });
        }

        return res.json({
            success: true,
            message: "Detail mahasiswa",
            data: {
                mahasiswa: result,
            },
        });
    } catch (err) {
        console.error("ERROR GET DETAIL MAHASISWA:", err);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada sistem",
            data: {
                error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            },
        });
    }
};

const approveMahasiswaController = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID mahasiswa tidak valid",
                data: {
                    field: "id",
                },
            });
        }

        const result = await approveMahasiswa(id);

        if (result.error === "NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Mahasiswa tidak ditemukan",
                data: {
                    id_user: id,
                },
            });
        }

        if (result.error === "ALREADY_VERIFIED") {
            return res.status(400).json({
                success: false,
                message: "Mahasiswa sudah diverifikasi sebelumnya",
                data: {
                    status_verifikasi: result.status_verifikasi,
                },
            });
        }

        return res.json({
            success: true,
            message: "Mahasiswa berhasil diverifikasi",
            data: {
                mahasiswa: result,
            },
        });
    } catch (err) {
        console.error("ERROR APPROVE MAHASISWA:", err);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada sistem",
            data: {
                error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            },
        });
    }
};

const rejectMahasiswaController = async (req, res) => {
    try {
        const { id } = req.params;
        const { catatan } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID mahasiswa tidak valid",
                data: {
                    field: "id",
                },
            });
        }

        if (!catatan || catatan.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Catatan penolakan wajib diisi",
                data: {
                    field: "catatan",
                },
            });
        }

        const result = await rejectMahasiswa(id, catatan);

        if (result.error === "NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Mahasiswa tidak ditemukan",
                data: {
                    id_user: id,
                },
            });
        }

        if (result.error === "ALREADY_PROCESSED") {
            return res.status(400).json({
                success: false,
                message: "Mahasiswa sudah diproses sebelumnya",
                data: {
                    status_verifikasi: result.status_verifikasi,
                },
            });
        }

        return res.json({
            success: true,
            message: "Mahasiswa ditolak",
            data: {
                mahasiswa: result,
            },
        });
    } catch (err) {
        console.error("ERROR REJECT MAHASISWA:", err);
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
    getPendingMahasiswa,
    getDetailMahasiswa,
    approveMahasiswaController,
    rejectMahasiswaController,
};