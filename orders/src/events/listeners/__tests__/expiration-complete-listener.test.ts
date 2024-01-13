import { Types } from "mongoose";
import { Message } from "node-nats-streaming";

import { ExpirationCompleteEvent, OrderStatus } from "@mmgittix/common";

import { nats } from "../../../nats";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";

import { ExpirationCompleteListener } from "../expiration-complete-listener";

const setup = async () => {
  const listener = new ExpirationCompleteListener(nats.client);

  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: "Title",
    price: 10,
  });
  await ticket.save();

  const order = Order.build({
    userId: new Types.ObjectId().toHexString(),
    ticket,
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  const data: ExpirationCompleteEvent["data"] = { orderId: order.id };

  // @ts-ignore
  const msg: Message = { ack: jest.fn() };

  return { listener, ticket, order, data, msg };
};

it("updates the order status to cancelled", async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits an OrderCancelled event", async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(nats.client.publish).toHaveBeenCalled();
  const { id: orderId } = JSON.parse(
    (<jest.Mock>nats.client.publish).mock.calls[0][1]
  );
  expect(orderId).toEqual(order.id);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
