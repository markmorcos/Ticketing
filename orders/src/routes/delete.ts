import express, { Request, Response } from "express";
import { param } from "express-validator";

import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@mmgittix/common";

import { Order } from "../models/order";
import { nats } from "../nats";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";

const router = express.Router();

router.delete(
  "/api/orders/:id",
  requireAuth,
  [param("id").isMongoId()],
  validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (req.currentUser!.id !== order.userId) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();
    await new OrderCancelledPublisher(nats.client).publish({
      id: order.id,
      ticket: { id: order.ticket.id },
      version: order.version,
    });

    res.status(200).send(order);
  }
);

export { router as deleteOrderRouter };
