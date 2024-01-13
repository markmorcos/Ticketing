import { Message } from "node-nats-streaming";

import { Listener, OrderCreatedEvent, Subjects } from "@mmgittix/common";

import { Order } from "../../models/order";

import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = Order.build({
      id: data.id,
      userId: data.userId,
      price: data.ticket.price,
      status: data.status,
      version: data.version,
    });
    await order.save();

    msg.ack();
  }
}
