import { Document, Model, Schema, model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export interface TicketAttrs {
  userId: string;
  title: string;
  price: number;
  orderId?: string;
}

type TicketDoc = Document & TicketAttrs & { version: number };

interface TicketModel extends Model<TicketDoc> {
  build: (ticket: TicketAttrs) => TicketDoc;
}

export interface TicketPayload {
  id: string;
  userId: string;
  title: string;
  price: number;
}

const ticketSchema: Schema<TicketDoc> = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    orderId: { type: String },
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
  return new Ticket(attrs);
};

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

export const Ticket = model<TicketDoc, TicketModel>("Ticket", ticketSchema);
