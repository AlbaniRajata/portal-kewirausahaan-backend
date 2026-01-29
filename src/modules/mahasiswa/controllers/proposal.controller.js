const {
  createProposal,
  updateProposal,
  submitProposal,
} = require("../services/proposal.service");

const createProposalController = async (req, res) => {
  try {
    const { id_user } = req.user;
    const data = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File proposal wajib diunggah",
        data: {},
        meta: {},
      });
    }

    const result = await createProposal(id_user, {
      ...data,
      file_proposal: req.file.filename,
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.message,
        data: result.data || {},
        meta: {},
      });
    }

    return res.json({
      success: true,
      message: result.message,
      data: result.data,
      meta: {},
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada sistem",
      data: { error: err.message },
      meta: {},
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
        success: false,
        message: result.message,
        data: result.data || {},
        meta: {},
      });
    }

    return res.json({
      success: true,
      message: result.message,
      data: result.data,
      meta: {},
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada sistem",
      data: { error: err.message },
      meta: {},
    });
  }
};

const submitProposalController = async (req, res) => {
  try {
    const { id_user } = req.user;
    const { id_proposal } = req.params;

    const result = await submitProposal(id_user, id_proposal);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.message,
        data: result.data || {},
        meta: {},
      });
    }

    return res.json({
      success: true,
      message: result.message,
      data: result.data,
      meta: {},
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada sistem",
      data: { error: err.message },
      meta: {},
    });
  }
};

module.exports = {
  createProposalController,
  updateProposalController,
  submitProposalController,
};
