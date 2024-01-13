import { Types } from "mongoose";
import request from "supertest";

import { OrderStatus } from "@mmgittix/common";

import { app } from "../../app";
import { signIn } from "../../test/global";
import { Order } from "../../models/order";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

it("returns a 404 when purchasing an order that does not exist", async () => {
  return request(app)
    .post("/api/payments")
    .set("Cookie", signIn())
    .send({ orderId: new Types.ObjectId().toHexString(), token: "token" })
    .expect(404);
});

it("returns a 401 when purchasing an order that does not belong to the user", async () => {
  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    userId: new Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Created,
    version: 0,
  });
  await order.save();

  return request(app)
    .post("/api/payments")
    .set("Cookie", signIn())
    .send({ orderId: order.id, token: "token" })
    .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const userId = new Types.ObjectId().toHexString();
  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    userId,
    price: 10,
    status: OrderStatus.Cancelled,
    version: 0,
  });
  await order.save();

  return request(app)
    .post("/api/payments")
    .set("Cookie", signIn(userId))
    .send({ orderId: order.id, token: "token" })
    .expect(400);
});

it("returns 201 with valid inputs", async () => {
  const userId = new Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    userId,
    price,
    status: OrderStatus.Created,
    version: 0,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", signIn(userId))
    .send({ orderId: order.id, token: "tok_visa" })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find(
    (charge) => charge.amount === price * 100
  );
  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual("usd");

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });
  expect(payment).not.toBeNull();
});
