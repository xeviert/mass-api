import type { RequestHandler } from "express";
import { JsonWebTokenError } from "jsonwebtoken";
import AuthService from "../auth/auth-service";

export const requireAuth: RequestHandler = async (req, res, next) => {
  const authToken = req.get("Authorization") || "";

  if (!authToken.toLowerCase().startsWith("bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }
  const bearerToken = authToken.slice(7);

  try {
    const payload = AuthService.verifyJwt(bearerToken);
    const stores = req.app.locals.stores;
    const sub = payload.sub || payload.phone_number;
    const user = AuthService.getUserWithPhoneNumber(stores, sub);

    if (!user) {
      res.status(401).json({ error: "Unauthorized request" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      res.status(401).json({ error: "Unauthorized request" });
      return;
    }
    next(error);
  }
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  next();
};
