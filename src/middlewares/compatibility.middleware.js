const { API_VERSION } = require("../utils/response");

const apiVersionMiddleware = (req, res, next) => {
  res.setHeader("API-Version", API_VERSION);
  res.setHeader("X-API-Version", API_VERSION);
  next();
};

const contentNegotiationMiddleware = (req, res, next) => {
  const accept = req.headers.accept || "";
  
  if (accept.includes("application/json")) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  } else {
    res.setHeader("Content-Type", "application/json");
  }
  
  res.setHeader("Vary", "Accept");
  next();
};

const corsCustomHeaders = (req, res, next) => {
  res.setHeader("Access-Control-Expose-Headers", "X-Total-Count, X-Page, X-API-Version");
  res.setHeader("X-Total-Count", "0");
  res.setHeader("X-Page", "1");
  next();
};

const setPaginationHeaders = (total, page) => {
  return (req, res) => {
    res.setHeader("X-Total-Count", total);
    res.setHeader("X-Page", page);
  };
};

const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || 
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  res.setHeader("X-Request-ID", requestId);
  req.requestId = requestId;
  next();
};

const supportedVersions = ["1.0.0", "1.0"];

const versionValidatorMiddleware = (req, res, next) => {
  const requestedVersion = req.headers["api-version"];
  
  if (requestedVersion && !supportedVersions.includes(requestedVersion)) {
    return res.status(400).json({
      success: false,
      message: `API version tidak didukung. Versi yang didukung: ${supportedVersions.join(", ")}`,
      data: { code: "UNSUPPORTED_VERSION" }
    });
  }
  
  next();
};

module.exports = {
  apiVersionMiddleware,
  contentNegotiationMiddleware,
  corsCustomHeaders,
  setPaginationHeaders,
  requestIdMiddleware,
  versionValidatorMiddleware,
  supportedVersions,
};