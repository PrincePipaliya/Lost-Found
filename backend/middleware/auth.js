const jwt = require("jsonwebtoken");

/* ======================================================
   AUTH MIDDLEWARE
====================================================== */

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({ message: "Authentication required" });

    if (!authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "Invalid token format" });

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || !decoded.role)
      return res.status(401).json({ message: "Invalid token payload" });

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};