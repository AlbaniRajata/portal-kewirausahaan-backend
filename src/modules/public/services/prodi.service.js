const {
    getAllProdiDb,
} = require("../db/prodi.db");

const getAllProdi = async ({ search }) => {
    const prodiList = await getAllProdiDb(search);
    return prodiList;
};

module.exports = {
    getAllProdi,
};
