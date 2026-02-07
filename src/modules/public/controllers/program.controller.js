const {
    getAllProgram,
} = require("../services/program.service");

const getAllProgramController = async (req, res) => {
    try {
        const programList = await getAllProgram();

        return res.json({
            success: true,
            message: "Data program berhasil diambil",
            data: programList,
        });
    } catch (err) {
        console.error("ERROR GET PROGRAM:", err);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada sistem",
            data: {},
        });
    }
};

module.exports = {
    getAllProgramController,
};