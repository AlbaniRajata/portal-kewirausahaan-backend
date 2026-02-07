const {
    getAllJurusanDb,
} = require("../db/jurusan.db");

const getAllJurusan = async () => {
    const jurusanList = await getAllJurusanDb();
    return jurusanList;
};

module.exports = {
    getAllJurusan,
};