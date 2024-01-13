import request from "supertest";
import { Types } from "mongoose";

import { OrderStatus } from "@mmgittix/common";

import { app } from "../../app";
import { createOrder, createTicket, signIn } from "../../test/global";
import { nats } from "../../nats";

it("throws an error if the provided ID does not exist", async () => {
  const id = new Types.ObjectId().toHexString();

  await request(app)
    .delete("/api/orders/invalid")
    .set("Cookie", signIn())
    .expect(400);
  await request(app)
    .delete(`/api/orders/${id}`)
    .set("Cookie", signIn())
    .expect(404);
});

it("returns a 401 if the user is not authenticated", () => {
  const id = new Types.ObjectId().toHexString();
  return request(app).delete(`/api/orders/${id}`).expect(401);
});

it("returns a 401 if the user does not own the order", async () => {
  const ticket = await createTicket();
  const order = await createOrder(ticket.id);

  return request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", signIn())
    .send({ title: "title", price: 20 })
    .expect(401);
});

it("marks an order as cancelled", async () => {
  const userId = new Types.ObjectId().toHexString();
  const ticket = await createTicket();
  const order = await createOrder(ticket.id, userId);

  const { body } = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", signIn(userId))
    .expect(200);

  expect(body.id).toEqual(order.id);
  expect(body.status).toEqual(OrderStatus.Cancelled);

  expect(nats.client.publish).toHaveBeenCalled();
});
