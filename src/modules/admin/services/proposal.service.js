const {
  getProposalListDb,
  getProposalDetailAdminDb,
} = require("../db/proposal.db");

const getProposalList = async (filter) => {
  const data = await getProposalListDb(filter);

  return {
    error: false,
    data,
  };
};

const getProposalDetailAdmin = async (id_proposal) => {
  const data = await getProposalDetailAdminDb(id_proposal);

  if (!data) {
    return {
      error: true,
      message: "Proposal tidak ditemukan",
      data: null,
    };
  }

  return {
    error: false,
    data,
  };
};

module.exports = {
  getProposalList,
  getProposalDetailAdmin,
};
