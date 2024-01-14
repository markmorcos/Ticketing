import express, { Request, Response } from "express";
import { body } from "express-validator";

import { requireAuth, validateRequest } from "@mmgittix/common";

import { Ticket } from "../models/ticket";
import { nats } from "../nats";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";

const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("price")
      .notEmpty()
      .isCurrency({ allow_negatives: false })
      .withMessage("Price must be a valid non-negative number"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { body, currentUser } = req;
    const { id: userId } = currentUser!;
    const { title, price } = body;

    const ticket = await Ticket.build({ userId, title, price });
    await ticket.save();

    await new TicketCreatedPublisher(nats.client).publish({
      userId: ticket.userId,
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      version: ticket.version,
    });

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
