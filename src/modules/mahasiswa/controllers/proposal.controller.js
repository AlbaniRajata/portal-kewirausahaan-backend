const {
  createProposal,
  updateProposal,
} = require("../services/proposal.service");

const createProposalController = async (req, res) => {
  try {
    const { id_user } = req.user;
    const data = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "File proposal wajib diunggah",
        data: null,
      });
    }

    const result = await createProposal(id_user, {
      ...data,
      file_proposal: req.file.filename,
    });

    if (result.error) {
      return res.status(400).json({
        message: result.message,
        data: result.data,
      });
    }

    return res.json({
      message: "Proposal berhasil didaftarkan",
      data: result.data,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada sistem",
      data: null,
    });
  }
};

const updateProposalController = async (req, res) => {
  try {
    const { id_user } = req.user;
    const { id_proposal } = req.params;

    const data = req.body;
    if (req.file) {
      data.file_proposal = req.file.filename;
    }

    const result = await updateProposal(id_user, id_proposal, data);

    if (result.error) {
      return res.status(400).json({
        message: result.message,
        data: result.data,
      });
    }

    return res.json({
      message: "Proposal berhasil diperbarui",
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
  createProposalController,
  updateProposalController,
};
