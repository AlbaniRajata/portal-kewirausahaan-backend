const {
  getProposalList,
  getProposalDetailAdmin,
  getMonitoringDistribusi,
} = require("../services/proposal.service");

const getProposalListController = async (req, res, next) => {
  try {
    const { id_program, status, page, limit } = req.query;
    const result = await getProposalList({
      id_program: id_program ? parseInt(id_program) : undefined,
      status: status !== undefined ? parseInt(status) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) { next(err); }
};

const getProposalDetailAdminController = async (req, res, next) => {
  try {
    const id_proposal = parseInt(req.params.id_proposal);
    if (isNaN(id_proposal) || id_proposal <= 0) {
      return res.status(400).json({ success: false, message: "ID proposal tidak valid", data: null });
    }
    const result = await getProposalDetailAdmin(id_proposal);
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getMonitoringDistribusiController = async (req, res, next) => {
  try {
    const { id_program, tahap, status, page, limit } = req.query;
    const result = await getMonitoringDistribusi({
      id_program: id_program ? parseInt(id_program) : undefined,
      tahap: tahap !== undefined ? parseInt(tahap) : undefined,
      status: status !== undefined ? parseInt(status) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) { next(err); }
};

module.exports = {
  getProposalListController,
  getProposalDetailAdminController,
  getMonitoringDistribusiController,
};