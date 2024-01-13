import { scryptSync, randomBytes } from "crypto";
import { promisify } from "util";

export class Password {
  static toHash(password: string) {
    const salt = randomBytes(8).toString("hex");
    const buffer = scryptSync(password, salt, 64);
    return `${buffer.toString("hex")}.${salt}`;
  }

  static compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split(".");
    const buffer = scryptSync(suppliedPassword, salt, 64);
    return buffer.toString("hex") === hashedPassword;
  }
}
