import { Types } from "mongoose";
import { Message } from "node-nats-streaming";

import { TicketCreatedEvent } from "@mmgittix/common";

import { nats } from "../../../nats";
import { Ticket } from "../../../models/ticket";

import { TicketCreatedListener } from "../ticket-created-listener";

const setup = () => {
  const listener = new TicketCreatedListener(nats.client);

  const data: TicketCreatedEvent["data"] = {
    id: new Types.ObjectId().toHexString(),
    userId: new Types.ObjectId().toHexString(),
    title: "Title",
    price: 10,
    version: 0,
  };

  // @ts-ignore
  const msg: Message = { ack: jest.fn() };

  return { listener, data, msg };
};

it("creates and saves a ticket", async () => {
  const { listener, data, msg } = setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
