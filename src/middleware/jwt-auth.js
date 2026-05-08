const { JsonWebTokenError } = require("jsonwebtoken");
const AuthService = require("../auth/auth-service");

async function requireAuth(req, res, next) {
  const authToken = req.get("Authorization") || "";

  if (!authToken.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }
  const bearerToken = authToken.slice(7);

  try {
    const payload = AuthService.verifyJwt(bearerToken);
    const stores = req.app.locals.stores;
    const user = AuthService.getUserWithPhoneNumber(stores, payload.sub);

    if (!user) return res.status(401).json({ error: "Unauthorized request" });

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ error: "Unauthorized request" });
    }
    next(error);
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
