import { Publisher, Subjects, OrderCreatedEvent } from "@mmgittix/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
