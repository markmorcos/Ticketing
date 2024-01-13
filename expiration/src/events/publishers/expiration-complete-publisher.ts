import { Publisher, Subjects, ExpirationCompleteEvent } from "@mmgittix/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
