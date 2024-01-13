import { Types } from "mongoose";
import request from "supertest";

import { OrderStatus } from "@mmgittix/common";

import { app } from "../../app";
import { signIn } from "../../test/global";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/order";
import { nats } from "../../nats";

it("returns an error if the ticket does not exist", () => {
  return request(app)
    .post("/api/orders")
    .set("Cookie", signIn())
    .send({ ticketId: new Types.ObjectId() })
    .expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const id = new Types.ObjectId().toHexString();
  const userId = new Types.ObjectId().toHexString();

  const ticket = Ticket.build({ id, title: "Title", price: 10 });
  await ticket.save();

  const order = Order.build({
    userId,
    ticket,
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  return request(app)
    .post("/api/orders")
    .set("Cookie", signIn(userId))
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const id = new Types.ObjectId().toHexString();
  const userId = new Types.ObjectId().toHexString();

  const ticket = Ticket.build({ id, title: "Title", price: 10 });
  await ticket.save();

  const { body } = await request(app)
    .post("/api/orders")
    .set("Cookie", signIn(userId))
    .send({ ticketId: ticket.id })
    .expect(201);

  const order = await Order.findById(body.id);
  expect(order).toBeDefined();

  expect(nats.client.publish).toHaveBeenCalled();
});
