import * as path from "path";

const NODE_ENV = (process.env.NODE_ENV || "development") as
  | "development"
  | "production"
  | "test";

if (NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production.");
}

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not set; using insecure dev fallback.");
}

const config = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 8080,
  NODE_ENV,
  DATA_DIR: process.env.DATA_DIR || path.join(__dirname, "..", "data"),
  JWT_SECRET: process.env.JWT_SECRET || "mass-jwt-dev-secret",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "3h",
  SEED_ADMIN_PHONE: process.env.SEED_ADMIN_PHONE || null,
};

export default config;
export const {
  PORT,
  DATA_DIR,
  JWT_SECRET,
  JWT_EXPIRY,
  SEED_ADMIN_PHONE,
} = config;
export { NODE_ENV };
