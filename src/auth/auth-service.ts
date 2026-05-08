import * as bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import config from "../config";
import type { Stores } from "../store";
import type { JwtPayload, User } from "../types";

const AuthService = {
  getUserWithPhoneNumber(stores: Stores, phone_number: string): User | null {
    return stores.users.find((u) => u.phone_number === phone_number);
  },

  comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  createJwt(subject: string, payload: JwtPayload): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      expiresIn: config.JWT_EXPIRY,
      algorithm: "HS256",
    } as SignOptions);
  },

  verifyJwt(token: string): JwtPayload & { sub?: string } {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ["HS256"],
    }) as JwtPayload & { sub?: string };
  },
};

export default AuthService;
