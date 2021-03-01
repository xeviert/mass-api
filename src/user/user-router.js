const express = require("express");
const path = require("path");
const UserService = require("./user-service");

const userRouter = express.Router();
const jsonBodyParser = express.json();

userRouter
  .post("/", jsonBodyParser, async (req, res, next) => {
  const { password, phone_number, role } = req.body;

  for (const field of ["phone_number", "password"])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      });
  try {
    const passwordError = UserService.validatePassword(password);

    if (passwordError) return res.status(400).json({ error: passwordError });

    const hasUserWithPhoneNumber = await UserService.hasUserWithPhoneNumber(
      req.app.get("db"),
      phone_number
    );

    if (hasUserWithPhoneNumber)
      return res
        .status(400)
        .json({ error: `Phone number already tied to an existing account` });

    const hashedPassword = await UserService.hashPassword(password);

    const newUser = {
      phone_number,
      password: hashedPassword,
      role,
    };

    const user = await UserService.insertUser(req.app.get("db"), newUser);

    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${user.id}`))
      .json(UserService.serializeUser(user));
  } catch (error) {
    next(error);
  }
});

module.exports = userRouter;
