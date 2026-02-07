const {
    getAllProgramDb,
} = require("../db/program.db");

const getAllProgram = async () => {
    const programList = await getAllProgramDb();
    return programList;
};

module.exports = {
    getAllProgram,
};