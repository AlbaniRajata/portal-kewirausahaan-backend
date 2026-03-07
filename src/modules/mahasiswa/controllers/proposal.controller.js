const fs = require("fs");
const {
  getProposalStatus,
  createProposal,
  updateProposal,
  submitProposal,
  getProposalDetail,
} = require("../services/proposal.service");

const getProposalStatusController = async (req, res, next) => {
  try {
    const result = await getProposalStatus(req.user.id_user);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const createProposalController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File proposal wajib diunggah",
        data: { field: "file_proposal" },
      });
    }

    const result = await createProposal(req.user.id_user, {
      ...req.body,
      file_proposal: req.file.filename,
    });

    if (result.error) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        message: result.message,
        data: result.data || null,
      });
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
};

const updateProposalController = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) data.file_proposal = req.file.filename;

    const result = await updateProposal(req.user.id_user, req.params.id_proposal, data);

    if (result.error) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        message: result.message,
        data: result.data || null,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
};

const submitProposalController = async (req, res, next) => {
  try {
    const result = await submitProposal(req.user.id_user, req.params.id_proposal);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.message,
        data: result.data || null,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const getProposalDetailController = async (req, res, next) => {
  try {
    const result = await getProposalDetail(req.user.id_user, req.params.id_proposal);

    if (result.error) {
      return res.status(404).json({
        success: false,
        message: result.message,
        data: result.data || null,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProposalStatusController,
  createProposalController,
  updateProposalController,
  submitProposalController,
  getProposalDetailController,
};