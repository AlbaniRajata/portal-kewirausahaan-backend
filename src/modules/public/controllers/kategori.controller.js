const {
    getAllKategori,
} = require("../services/kategori.service");

const getAllKategoriController = async (req, res) => {
    try {
        const kategoriList = await getAllKategori();

        return res.json({
            success: true,
            message: "Data kategori berhasil diambil",
            data: kategoriList,
        });
    } catch (err) {
        console.error("ERROR GET KATEGORI:", err);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada sistem",
            data: {},
        });
    }
};

module.exports = {
    getAllKategoriController,
};