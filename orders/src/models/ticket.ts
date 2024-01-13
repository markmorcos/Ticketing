import { Document, Model, Schema, model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import { OrderStatus } from "@mmgittix/common";

import { Order } from "./order";

export interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export type TicketDoc = Document &
  TicketAttrs & { isReserved: () => Promise<Boolean>; version: number };

interface TicketModel extends Model<TicketDoc> {
  build: (ticket: TicketAttrs) => TicketDoc;
  findByEvent: (event: {
    id: string;
    version: number;
  }) => Promise<TicketDoc | null>;
}

export interface TicketPayload {
  id: string;
  title: string;
  price: number;
}

const ticketSchema: Schema<TicketDoc> = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({ _id: attrs.id, ...attrs });
};
ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({ _id: event.id, version: event.version - 1 });
};

ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: { $ne: OrderStatus.Cancelled },
  });

  return !!existingOrder;
};

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

export const Ticket = model<TicketDoc, TicketModel>("Ticket", ticketSchema);
