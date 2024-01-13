import { Types } from "mongoose";
import { sign } from "jsonwebtoken";

export const signIn = (id = new Types.ObjectId().toHexString()) => {
  const payload = { id, email: "test@example.com" };
  const jwt = sign(payload, process.env.JWT_KEY!);
  const session = JSON.stringify({ jwt });
  const base64 = Buffer.from(session).toString("base64");
  return [`session=${base64}`];
};
