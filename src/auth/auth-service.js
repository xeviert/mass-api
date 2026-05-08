const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");

const AuthService = {
  getUserWithPhoneNumber(stores, phone_number) {
    return stores.users.find((u) => u.phone_number === phone_number);
  },

  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  },

  createJwt(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      expiresIn: config.JWT_EXPIRY,
      algorithm: "HS256",
    });
  },

  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  },
};

module.exports = AuthService;
