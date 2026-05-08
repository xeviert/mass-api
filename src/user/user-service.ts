import * as bcrypt from "bcrypt";
import type { Stores } from "../store";
import type { User } from "../types";

const UserService = {
  hasUserWithPhoneNumber(stores: Stores, phone_number: string): boolean {
    return !!stores.users.find((u) => u.phone_number === phone_number);
  },

  insertUser(stores: Stores, newUser: Omit<User, "id" | "created_at">): Promise<User> {
    return stores.users.insert(newUser);
  },

  validatePassword(password: unknown): string | null {
    if (typeof password !== "string" || password.length === 0) {
      return "Password is required";
    }
    if (password.length > 72) {
      return "Password must be 72 characters or fewer";
    }
    return null;
  },

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  },

  serializeUser(user: User): { id: number; phone_number: string; role: User["role"] } {
    return {
      id: user.id,
      phone_number: user.phone_number,
      role: user.role || null,
    };
  },
};

export default UserService;
