const {
    getAllJurusan,
} = require("../services/jurusan.service");

const getAllJurusanController = async (req, res) => {
    try {
        const jurusanList = await getAllJurusan();

        return res.json({
            success: true,
            message: "Data jurusan berhasil diambil",
            data: jurusanList,
        });
    } catch (err) {
        console.error("ERROR GET JURUSAN:", err);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada sistem",
            data: {},
        });
    }
};

module.exports = {
    getAllJurusanController,
};