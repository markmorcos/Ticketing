import { Document, Model, Schema, model } from "mongoose";

export interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

type PaymentDoc = Document & PaymentAttrs;

interface PaymentModel extends Model<PaymentDoc> {
  build: (payment: PaymentAttrs) => PaymentDoc;
}

export interface PaymentPayload {
  orderId: string;
  stripeId: string;
}

const paymentSchema: Schema<PaymentDoc> = new Schema(
  {
    orderId: { type: String, required: true },
    stripeId: { type: String, required: true },
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

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

export const Payment = model<PaymentDoc, PaymentModel>(
  "Payment",
  paymentSchema
);
