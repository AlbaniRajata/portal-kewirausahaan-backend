const {
  getProposalList,
  getProposalDetailAdmin,
} = require("../services/proposal.service");

const getProposalListController = async (req, res) => {
  try {
    const { id_program, status } = req.query;

    const result = await getProposalList({
      id_program,
      status,
    });

    return res.json({
      message: "Daftar proposal",
      data: result.data,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada sistem",
      data: null,
    });
  }
};

const getProposalDetailAdminController = async (req, res) => {
  try {
    const { id_proposal } = req.params;

    const result = await getProposalDetailAdmin(id_proposal);

    if (result.error) {
      return res.status(404).json({
        message: result.message,
        data: result.data,
      });
    }

    return res.json({
      message: "Detail proposal",
      data: result.data,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada sistem",
      data: null,
    });
  }
};

module.exports = {
  getProposalListController,
  getProposalDetailAdminController,
};
