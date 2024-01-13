import { Publisher, Subjects, PaymentCreatedEvent } from "@mmgittix/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
