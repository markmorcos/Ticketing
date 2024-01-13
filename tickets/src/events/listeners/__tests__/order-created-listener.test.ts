import { Types } from "mongoose";
import { Message } from "node-nats-streaming";

import {
  OrderCreatedEvent,
  OrderStatus,
  TicketUpdatedEvent,
} from "@mmgittix/common";

import { nats } from "../../../nats";
import { Ticket } from "../../../models/ticket";

import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
  const listener = new OrderCreatedListener(nats.client);

  const ticket = await Ticket.build({
    userId: new Types.ObjectId().toHexString(),
    title: "Title",
    price: 10,
  });
  await ticket.save();

  const data: OrderCreatedEvent["data"] = {
    id: new Types.ObjectId().toHexString(),
    userId: new Types.ObjectId().toHexString(),
    ticket: { id: ticket.id, price: ticket.price },
    status: OrderStatus.Created,
    expiresAt: new Date().toISOString(),
    version: 0,
  };

  // @ts-ignore
  const msg: Message = { ack: jest.fn() };

  return { listener, ticket, data, msg };
};

it("sets the orderId of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(nats.client.publish).toHaveBeenCalled();

  const ticketUpdatedData: TicketUpdatedEvent["data"] = JSON.parse(
    (<jest.Mock>nats.client.publish).mock.calls[0][1]
  );

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
