import express, { Request, Response } from "express";
import { body } from "express-validator";

import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@mmgittix/common";

import { Order } from "../models/order";
import { Ticket } from "../models/ticket";
import { nats } from "../nats";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

const router = express.Router();

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .notEmpty()
      .isMongoId()
      .withMessage("Ticket ID must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { id: userId } = req.currentUser!;
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }

    const status = OrderStatus.Created;
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    const order = Order.build({
      userId,
      ticket,
      expiresAt,
      status,
    });
    await order.save();

    await new OrderCreatedPublisher(nats.client).publish({
      id: order.id,
      userId: order.userId,
      ticket: { id: order.ticket.id, price: order.ticket.price },
      status: order.status,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
    });

    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
