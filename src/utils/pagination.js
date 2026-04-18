const pool = require("../config/db");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const parsePaginationParams = (query) => {
  let page = parseInt(query.page) || DEFAULT_PAGE;
  let limit = parseInt(query.limit) || DEFAULT_LIMIT;

  if (page < 1) page = DEFAULT_PAGE;
  if (limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

const getPaginationMetadata = async (baseQuery, baseParams, page, limit) => {
  const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_subquery`;
  const { rows } = await pool.query(countQuery, baseParams);
  const total = parseInt(rows[0].total);
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1,
  };
};

const paginatedResponse = (data, metadata) => ({
  data,
  pagination: {
    page: metadata.page,
    limit: metadata.limit,
    total: metadata.total,
    total_pages: metadata.total_pages,
    has_next: metadata.has_next,
    has_prev: metadata.has_prev,
  },
});

module.exports = {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  parsePaginationParams,
  getPaginationMetadata,
  paginatedResponse,
};