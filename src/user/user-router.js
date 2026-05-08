const express = require("express");
const path = require("path");
const UserService = require("./user-service");
const { requireAuth } = require("../middleware/jwt-auth");

const userRouter = express.Router();
const jsonBodyParser = express.json();

userRouter.post("/", jsonBodyParser, async (req, res, next) => {
  const { password, phone_number } = req.body;

  for (const field of ["phone_number", "password"]) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `Missing '${field}' in request body` });
    }
  }

  try {
    const stores = req.app.locals.stores;
    const passwordError = UserService.validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    if (UserService.hasUserWithPhoneNumber(stores, phone_number)) {
      return res
        .status(400)
        .json({ error: "Phone number already tied to an existing account" });
    }

    const password_hash = await UserService.hashPassword(password);
    const newUser = { phone_number, password_hash, role: null };
    const user = await UserService.insertUser(stores, newUser);

    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${user.id}`))
      .json(UserService.serializeUser(user));
  } catch (error) {
    next(error);
  }
});

userRouter.get("/me", requireAuth, (req, res) => {
  res.json(UserService.serializeUser(req.user));
});

module.exports = userRouter;
