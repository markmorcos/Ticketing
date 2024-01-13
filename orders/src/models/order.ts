import { Document, Model, Schema, model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import { OrderStatus } from "@mmgittix/common";

import { TicketDoc } from "./ticket";

export interface OrderAttrs {
  userId: string;
  ticket: TicketDoc;
  status: OrderStatus;
  expiresAt: Date;
}

type OrderDoc = Document & OrderAttrs & { version: number };

interface OrderModel extends Model<OrderDoc> {
  build: (order: OrderAttrs) => OrderDoc;
}

export interface OrderPayload {
  id: string;
  userId: string;
  ticketId: string;
  status: OrderStatus;
}

const orderSchema: Schema<OrderDoc> = new Schema(
  {
    userId: { type: String, required: true },
    ticket: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: { type: Schema.Types.Date },
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

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

export const Order = model<OrderDoc, OrderModel>("Order", orderSchema);
