const {
    getAllKategoriDb,
} = require("../db/kategori.db");

const getAllKategori = async () => {
    const kategoriList = await getAllKategoriDb();
    return kategoriList;
};

module.exports = {
    getAllKategori,
};