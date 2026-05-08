import express from "express";
import AuthService from "./auth-service";
import { requireAuth } from "../middleware/jwt-auth";
import type { JwtPayload } from "../types";

const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter
  .route("/token")
  .post(jsonBodyParser, async (req, res, next) => {
    const { phone_number, password } = req.body ?? {};
    const loginUser = { phone_number, password };

    for (const [key, value] of Object.entries(loginUser)) {
      if (value == null) {
        res.status(400).json({ error: `Missing '${key}' in request body` });
        return;
      }
    }

    try {
      const stores = req.app.locals.stores;
      const dbUser = AuthService.getUserWithPhoneNumber(stores, loginUser.phone_number);

      if (!dbUser) {
        res.status(400).json({ error: "Incorrect username or pw" });
        return;
      }

      const compareMatch = await AuthService.comparePasswords(
        loginUser.password,
        dbUser.password_hash,
      );

      if (!compareMatch) {
        res.status(400).json({ error: "Incorrect username or pw" });
        return;
      }

      const sub = dbUser.phone_number;
      const payload: JwtPayload = {
        user_id: dbUser.id,
        phone_number: dbUser.phone_number,
        role: dbUser.role,
      };
      res.send({ authToken: AuthService.createJwt(sub, payload) });
    } catch (error) {
      next(error);
    }
  })
  .put(requireAuth, (req, res) => {
    const user = req.user!;
    const sub = user.phone_number;
    const payload: JwtPayload = {
      user_id: user.id,
      phone_number: user.phone_number,
      role: user.role,
    };
    res.send({ authToken: AuthService.createJwt(sub, payload) });
  });

export default authRouter;
