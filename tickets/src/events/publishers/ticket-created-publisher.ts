import { Publisher, Subjects, TicketCreatedEvent } from "@mmgittix/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
