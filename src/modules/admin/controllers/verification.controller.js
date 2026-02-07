const {
    listPendingMahasiswa,
    detailMahasiswa,
    approveMahasiswa,
    rejectMahasiswa,
    listPendingDosen,
    detailDosen,
    approveDosen,
    rejectDosen,
} = require("../services/verification.service");

const getPendingMahasiswa = async (req, res) => {
    try {
        const filters = {
            status_verifikasi: req.query.status_verifikasi ? parseInt(req.query.status_verifikasi) : undefined,
            email_verified: req.query.email_verified ? req.query.email_verified === 'true' : undefined,
            id_prodi: req.query.id_prodi ? parseInt(req.query.id_prodi) : undefined,
            tanggal_dari: req.query.tanggal_dari,
            tanggal_sampai: req.query.tanggal_sampai,
        };

        const data = await listPendingMahasiswa(filters);
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

        if (result.error === "EMAIL_NOT_VERIFIED") {
            return res.status(400).json({
                success: false,
                message: "Email mahasiswa belum diverifikasi. Verifikasi admin hanya dapat dilakukan setelah email diverifikasi.",
                data: {
                    field: "email_verified_at"
                }
            });
        }

        if (result.error === "ALREADY_VERIFIED") {
            return res.status(400).json({
                success: false,
                message: "Mahasiswa sudah diverifikasi sebelumnya",
                data: {
                    field: "status_verifikasi",
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

const getPendingDosen = async (req, res) => {
    try {
        const filters = {
            status_verifikasi: req.query.status_verifikasi ? parseInt(req.query.status_verifikasi) : undefined,
            email_verified: req.query.email_verified ? req.query.email_verified === 'true' : undefined,
            id_prodi: req.query.id_prodi ? parseInt(req.query.id_prodi) : undefined,
            tanggal_dari: req.query.tanggal_dari,
            tanggal_sampai: req.query.tanggal_sampai,
        };

        const data = await listPendingDosen(filters);
        return res.json({
            success: true,
            message: "Daftar dosen menunggu verifikasi",
            data: {
                dosen: data,
                total: data.length,
            },
        });
    } catch (err) {
        console.error("ERROR GET PENDING DOSEN:", err);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada sistem",
            data: {
                error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            },
        });
    }
};

const getDetailDosen = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID dosen tidak valid",
                data: {
                    field: "id",
                },
            });
        }

        const result = await detailDosen(id);

        if (result.error) {
            return res.status(404).json({
                success: false,
                message: "Dosen tidak ditemukan",
                data: {
                    id_user: id,
                },
            });
        }

        return res.json({
            success: true,
            message: "Detail dosen",
            data: {
                dosen: result,
            },
        });
    } catch (err) {
        console.error("ERROR GET DETAIL DOSEN:", err);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada sistem",
            data: {
                error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            },
        });
    }
};

const approveDosenController = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID dosen tidak valid",
                data: {
                    field: "id",
                },
            });
        }

        const result = await approveDosen(id);

        if (result.error === "NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Dosen tidak ditemukan",
                data: {
                    id_user: id,
                },
            });
        }

        if (result.error === "EMAIL_NOT_VERIFIED") {
            return res.status(400).json({
                success: false,
                message: "Email dosen belum diverifikasi. Verifikasi admin hanya dapat dilakukan setelah email diverifikasi.",
                data: {
                    field: "email_verified_at"
                }
            });
        }

        if (result.error === "ALREADY_VERIFIED") {
            return res.status(400).json({
                success: false,
                message: "Dosen sudah diverifikasi sebelumnya",
                data: {
                    field: "status_verifikasi",
                    status_verifikasi: result.status_verifikasi,
                },
            });
        }

        return res.json({
            success: true,
            message: "Dosen berhasil diverifikasi",
            data: {
                dosen: result,
            },
        });
    } catch (err) {
        console.error("ERROR APPROVE DOSEN:", err);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada sistem",
            data: {
                error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            },
        });
    }
};

const rejectDosenController = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID dosen tidak valid",
                data: {
                    field: "id",
                },
            });
        }

        const result = await rejectDosen(id);

        if (result.error === "NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Dosen tidak ditemukan",
                data: {
                    id_user: id,
                },
            });
        }

        if (result.error === "ALREADY_PROCESSED") {
            return res.status(400).json({
                success: false,
                message: "Dosen sudah diproses sebelumnya",
                data: {
                    status_verifikasi: result.status_verifikasi,
                },
            });
        }

        return res.json({
            success: true,
            message: "Dosen ditolak",
            data: {
                dosen: result,
            },
        });
    } catch (err) {
        console.error("ERROR REJECT DOSEN:", err);
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
    getPendingDosen,
    getDetailDosen,
    approveDosenController,
    rejectDosenController,
};