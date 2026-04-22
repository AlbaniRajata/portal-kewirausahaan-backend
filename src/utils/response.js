const API_VERSION = "1.0.0";
const API_NAME = "Portal Kewirausahaan API";

const createResponse = (success, message, data = null, metadata = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
    version: API_VERSION,
  };

  if (data !== null) response.data = data;
  if (metadata) response.metadata = metadata;

  return response;
};

const successResponse = (message, data = null, metadata = null) => 
  createResponse(true, message, data, metadata);

const errorResponse = (message, data = null) => 
  createResponse(false, message, data);

const paginatedResponse = (data, pagination) => 
  createResponse(true, "Data berhasil diambil", data, { pagination });

const createdResponse = (message, data = null) => {
  const res = createResponse(true, message, data);
  res.status_code = 201;
  return res;
};

const notFoundResponse = (message) => 
  createResponse(false, message);

const validationErrorResponse = (errors) => 
  createResponse(false, "Validasi gagal", { errors });

const formatListResponse = (items, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    success: true,
    message: "Data berhasil diambil",
    timestamp: new Date().toISOString(),
    version: API_VERSION,
    data: items,
    metadata: {
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      }
    }
  };
};

const formatDetailResponse = (item) => ({
  success: true,
  message: "Detail berhasil diambil",
  timestamp: new Date().toISOString(),
  version: API_VERSION,
  data: item,
});

const formatApiInfo = () => ({
  name: API_NAME,
  version: API_VERSION,
  description: "Backend API untuk Portal Kewirausahaan",
  documentation: "/api-docs",
  health: "/health",
});

const getApiVersion = () => API_VERSION;

module.exports = {
  API_VERSION,
  createResponse,
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  notFoundResponse,
  validationErrorResponse,
  formatListResponse,
  formatDetailResponse,
  formatApiInfo,
  getApiVersion,
};