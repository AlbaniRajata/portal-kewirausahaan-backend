module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || req.user.id_role === undefined) {
      return res.status(403).json({
        success: false,
        message: "Informasi role tidak ditemukan. Pastikan sudah login.",
        data: null,
      });
    }

    if (!allowedRoles.includes(req.user.id_role)) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki izin untuk mengakses resource ini",
        data: null,
        ...(process.env.NODE_ENV === "development" && {
          debug: {
            role_user: req.user.id_role,
            allowed: allowedRoles,
          },
        }),
      });
    }

    next();
  };
};