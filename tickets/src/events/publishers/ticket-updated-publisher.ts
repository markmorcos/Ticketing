import { Publisher, Subjects, TicketUpdatedEvent } from "@mmgittix/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
