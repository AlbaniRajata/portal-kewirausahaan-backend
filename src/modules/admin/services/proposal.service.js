const {
  getProposalListDb, getProposalCountDb,
  getProposalDetailAdminDb,
  getMonitoringDistribusiDb, getMonitoringDistribusiCountDb,
} = require("../db/proposal.db");
const { parsePaginationParams } = require("../../../utils/pagination");

const getProposalList = async (filter) => {
  const { page, limit } = parsePaginationParams(filter);
  const [data, total] = await Promise.all([
    getProposalListDb({ ...filter, page, limit }),
    getProposalCountDb(filter)
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    error: false,
    message: "Daftar proposal berhasil diambil",
    data: data,
    pagination: { page, limit, total, total_pages: totalPages, has_next: page < totalPages, has_prev: page > 1 }
  };
};

const getProposalDetailAdmin = async (id_proposal) => {
  const data = await getProposalDetailAdminDb(id_proposal);
  if (!data) return { error: true, message: "Proposal tidak ditemukan", data: null };
  return { error: false, message: "Detail proposal berhasil diambil", data };
};

const getMonitoringDistribusi = async (filter) => {
  const { page, limit } = parsePaginationParams(filter);
  const [data, total] = await Promise.all([
    getMonitoringDistribusiDb({ ...filter, page, limit }),
    getMonitoringDistribusiCountDb(filter)
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    error: false,
    message: "Monitoring distribusi reviewer berhasil diambil",
    data: data,
    pagination: { page, limit, total, total_pages: totalPages, has_next: page < totalPages, has_prev: page > 1 }
  };
};

module.exports = { getProposalList, getProposalDetailAdmin, getMonitoringDistribusi };