const {
    getAllProdi,
} = require("../services/prodi.service");

const getAllProdiHandler = async (req, res) => {
    try {
        const { search } = req.query;

        const result = await getAllProdi({ search });

        return res.json({
            success: true,
            message: "List program studi berhasil diambil",
            data: result,
        });
    } catch (err) {
        console.error("ERROR GET PRODI:", err);

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada sistem",
        });
    }
};

module.exports = {
    getAllProdi: getAllProdiHandler,
};
