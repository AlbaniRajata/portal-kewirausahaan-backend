const sanitizeHtml = require("sanitize-html");

const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {},
      allowedSchemes: []
    });
  }
  if (typeof input === "object" && input !== null) {
    const sanitized = {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }
  return input;
};

const inputValidationMiddleware = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        const original = obj[key];
        const sanitized = sanitizeHtml(obj[key], {
          allowedTags: [],
          allowedAttributes: [],
          allowedSchemes: []
        });
        if (original !== sanitized) {
          return true;
        }
      }
    }
    return false;
  };

  if (sanitize(req.body) || sanitize(req.query)) {
    return res.status(400).json({
      success: false,
      message: "Input tidak valid atau mengandung karakter terlarang",
      data: { code: "INVALID_INPUT" }
    });
  }

  next();
};

const blockSuspiciousInput = (req, res, next) => {
const suspiciousPatterns = [
  /['";`]/,
  /--/,
  /\/\*/,
  /\*\//,
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /OR\s+1=1/i,
  /OR\s+.*=/i
];

  const checkValue = (value, field) => {
    if (typeof value !== "string") return null;
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(value)) {
        return field;
      }
    }
    return null;
  };

  const checkObject = (obj, prefix = "") => {
    for (const key in obj) {
      const field = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "string") {
        const suspiciousField = checkValue(obj[key], field);
        if (suspiciousField) {
          return suspiciousField;
        }
      } else if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        const result = checkObject(obj[key], field);
        if (result) return result;
      }
    }
    return null;
  };

  const suspiciousField = checkObject(req.body) || checkObject(req.query);

  if (suspiciousField) {
    return res.status(400).json({
      success: false,
      message: `Karakter tidak diizinkan pada field ${suspiciousField}`,
      data: { code: "SUSPICIOUS_INPUT", field: suspiciousField }
    });
  }

  next();
};

const noCacheMiddleware = (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
};

const securityHeadersMiddleware = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
};

const requestSizeLimiter = (maxSize = 15 * 1024 * 1024) => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers["content-length"] || 0);
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        message: "Request terlalu besar. Maksimal 15MB.",
        data: { code: "PAYLOAD_TOO_LARGE" }
      });
    }
    next();
  };
};

const detectSqlInjection = (input) => {
  if (typeof input !== "string") return false;

  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(\bUNION\b|\bOR\b.*=.*|\bAND\b.*=.*)/i,
    /(execute|exec|sp_executesql)/i,
    /(0x[0-9a-fA-F]+)/,
  ];

  for (const pattern of patterns) {
    if (pattern.test(input)) {
      return true;
    }
  }
  return false;
};

const sqlInjectionProtectionMiddleware = (req, res, next) => {
  const check = (obj) => {
    for (const key in obj) {
      if (detectSqlInjection(obj[key])) {
        return true;
      }
    }
    return false;
  };

  if (check(req.body) || check(req.query)) {
    return res.status(400).json({
      success: false,
      message: "Karakter tidak diizinkan pada field email",
      data: { code: "SUSPICIOUS_INPUT", field: "email" }
    });
  }

  next();
};

module.exports = {
  sanitizeInput,
  inputValidationMiddleware,
  noCacheMiddleware,
  securityHeadersMiddleware,
  requestSizeLimiter,
  sqlInjectionProtectionMiddleware,
  blockSuspiciousInput,
};
