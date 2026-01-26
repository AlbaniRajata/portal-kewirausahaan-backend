module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || req.user.id_role === undefined) {
      return res.status(403).json({
        message: "Role tidak ditemukan pada token",
        data: req.user || null,
      });
    }

    if (!allowedRoles.includes(req.user.id_role)) {
      return res.status(403).json({
        message: "Akses ditolak",
        data: {
          role_user: req.user.id_role,
          allowed: allowedRoles,
        },
      });
    }

    next();
  };
};
