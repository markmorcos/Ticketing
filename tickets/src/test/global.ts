import { Types } from "mongoose";
import { sign } from "jsonwebtoken";
import request from "supertest";

import { app } from "../app";
import { TicketAttrs, TicketPayload } from "../models/ticket";

export const signIn = (id = new Types.ObjectId().toHexString()) => {
  const payload = { id, email: "test@example.com" };
  const jwt = sign(payload, process.env.JWT_KEY!);
  const session = JSON.stringify({ jwt });
  const base64 = Buffer.from(session).toString("base64");
  return [`session=${base64}`];
};

export const createTicket = async (
  attrs: Partial<TicketAttrs>
): Promise<TicketPayload> => {
  const { body } = await request(app)
    .post("/api/tickets")
    .set("Cookie", signIn(attrs.userId))
    .send(attrs);
  return body;
};
