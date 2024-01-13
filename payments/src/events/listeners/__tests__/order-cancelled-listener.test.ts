import { Types } from "mongoose";
import { Message } from "node-nats-streaming";

import { OrderCancelledEvent, OrderStatus } from "@mmgittix/common";

import { nats } from "../../../nats";
import { Order } from "../../../models/order";

import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(nats.client);

  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    userId: new Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Created,
    version: 0,
  });
  await order.save();

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    ticket: { id: new Types.ObjectId().toHexString() },
    version: 1,
  };

  // @ts-ignore
  const msg: Message = { ack: jest.fn() };

  return { listener, order, data, msg };
};

it("updates the status of the order", async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
