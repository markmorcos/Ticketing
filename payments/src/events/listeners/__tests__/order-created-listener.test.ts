import { Types } from "mongoose";
import { Message } from "node-nats-streaming";

import { OrderCreatedEvent, OrderStatus } from "@mmgittix/common";

import { nats } from "../../../nats";
import { Order } from "../../../models/order";

import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
  const listener = new OrderCreatedListener(nats.client);

  const data: OrderCreatedEvent["data"] = {
    id: new Types.ObjectId().toHexString(),
    userId: new Types.ObjectId().toHexString(),
    ticket: { id: new Types.ObjectId().toHexString(), price: 10 },
    status: OrderStatus.Created,
    expiresAt: new Date().toISOString(),
    version: 0,
  };

  // @ts-ignore
  const msg: Message = { ack: jest.fn() };

  return { listener, data, msg };
};

it("replicates the order info", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
