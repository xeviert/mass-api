const bcrypt = require("bcrypt");

const UserService = {
  hasUserWithPhoneNumber(stores, phone_number) {
    return !!stores.users.find((u) => u.phone_number === phone_number);
  },

  insertUser(stores, newUser) {
    return stores.users.insert(newUser);
  },

  validatePassword(password) {
    if (typeof password !== "string" || password.length === 0) {
      return "Password is required";
    }
    if (password.length > 72) {
      return "Password must be 72 characters or fewer";
    }
    return null;
  },

  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  serializeUser(user) {
    return {
      id: user.id,
      phone_number: user.phone_number,
      role: user.role || null,
    };
  },
};

module.exports = UserService;
