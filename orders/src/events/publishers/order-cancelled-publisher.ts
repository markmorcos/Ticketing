import { Publisher, Subjects, OrderCancelledEvent } from "@mmgittix/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
