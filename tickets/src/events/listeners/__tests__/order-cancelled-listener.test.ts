import { Types } from "mongoose";
import { Message } from "node-nats-streaming";

import {
  OrderCancelledEvent,
  OrderStatus,
  TicketUpdatedEvent,
} from "@mmgittix/common";

import { nats } from "../../../nats";
import { Ticket } from "../../../models/ticket";

import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(nats.client);

  const orderId = new Types.ObjectId().toHexString();
  const ticket = await Ticket.build({
    userId: new Types.ObjectId().toHexString(),
    title: "Title",
    price: 10,
    orderId,
  });
  await ticket.save();

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    ticket: { id: ticket.id },
    version: 0,
  };

  // @ts-ignore
  const msg: Message = { ack: jest.fn() };

  return { listener, orderId, ticket, data, msg };
};

it("updates the ticket, publishes an event and acks the message", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toBeUndefined();
  expect(nats.client.publish).toHaveBeenCalled();
  expect(msg.ack).toHaveBeenCalled();
});
