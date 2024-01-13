import express, { Request, Response } from "express";
import { body } from "express-validator";

import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@mmgittix/common";

import { nats } from "../nats";
import { Order } from "../models/order";
import { Payment } from "../models/payment";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { stripe } from "../stripe";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("orderId")
      .notEmpty()
      .isMongoId()
      .withMessage("Order ID must be provided"),
    body("token").notEmpty().withMessage("Token must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId, token } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (req.currentUser!.id !== order.userId) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for a cancelled order");
    }

    const { id: stripeId } = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });

    const payment = Payment.build({ orderId, stripeId });
    await payment.save();

    await new PaymentCreatedPublisher(nats.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send(payment);
  }
);

export { router as createPaymentRouter };
