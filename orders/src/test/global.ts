import { Types } from "mongoose";
import { sign } from "jsonwebtoken";
import request from "supertest";

import { app } from "../app";
import { OrderAttrs, OrderPayload } from "../models/order";
import { Ticket } from "../models/ticket";

export const signIn = (id = new Types.ObjectId().toHexString()) => {
  const payload = { id, email: "test@example.com" };
  const jwt = sign(payload, process.env.JWT_KEY!);
  const session = JSON.stringify({ jwt });
  const base64 = Buffer.from(session).toString("base64");
  return [`session=${base64}`];
};

export const createTicket = async () => {
  const id = new Types.ObjectId().toHexString();

  const ticket = Ticket.build({ id, title: "Title", price: 10 });
  await ticket.save();

  return ticket;
};

export const createOrder = async (
  ticketId: string,
  userId?: string
): Promise<OrderPayload> => {
  const { body } = await request(app)
    .post("/api/orders")
    .set("Cookie", signIn(userId))
    .send({ ticketId });
  return body;
};
