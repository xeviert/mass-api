import express from "express";
import * as path from "path";
import UserService from "./user-service";
import { requireAuth } from "../middleware/jwt-auth";

const userRouter = express.Router();
const jsonBodyParser = express.json();

userRouter.post("/", jsonBodyParser, async (req, res, next) => {
  const body = req.body ?? {};
  const { password, phone_number } = body;

  for (const field of ["phone_number", "password"] as const) {
    if (!body[field]) {
      res.status(400).json({ error: `Missing '${field}' in request body` });
      return;
    }
  }

  try {
    const stores = req.app.locals.stores;
    const passwordError = UserService.validatePassword(password);
    if (passwordError) {
      res.status(400).json({ error: passwordError });
      return;
    }

    if (UserService.hasUserWithPhoneNumber(stores, phone_number)) {
      res
        .status(400)
        .json({ error: "Phone number already tied to an existing account" });
      return;
    }

    const password_hash = await UserService.hashPassword(password);
    const user = await UserService.insertUser(stores, {
      phone_number,
      password_hash,
      role: null,
    });

    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${user.id}`))
      .json(UserService.serializeUser(user));
  } catch (error) {
    next(error);
  }
});

userRouter.get("/me", requireAuth, (req, res) => {
  res.json(UserService.serializeUser(req.user!));
});

export default userRouter;
