module.exports = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL
    || "postgresql://postgres@localhost/mass",
  JWT_SECRET: process.env.JWT_SECRET || "mass-jwt-secret",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "3h",
};
