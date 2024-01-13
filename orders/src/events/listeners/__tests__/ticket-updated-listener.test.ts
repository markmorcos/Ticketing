import { Types } from "mongoose";
import { Message } from "node-nats-streaming";

import { TicketUpdatedEvent } from "@mmgittix/common";

import { nats } from "../../../nats";
import { Ticket } from "../../../models/ticket";

import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  const listener = new TicketUpdatedListener(nats.client);

  const id = new Types.ObjectId().toHexString();
  const ticket = await Ticket.build({
    id,
    title: "Title",
    price: 10,
  });
  await ticket.save();

  const data: TicketUpdatedEvent["data"] = {
    id,
    userId: new Types.ObjectId().toHexString(),
    title: "Title",
    price: 10,
    version: ticket.version + 1,
  };

  // @ts-ignore
  const msg: Message = { ack: jest.fn() };

  return { listener, ticket, data, msg };
};

it("finds, updates and saves a ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(data.id);

  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(ticket.title);
  expect(updatedTicket!.price).toEqual(ticket.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
  const { listener, ticket, data, msg } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
