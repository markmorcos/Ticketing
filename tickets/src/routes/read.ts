import express, { Request, Response } from "express";

import { NotFoundError, validateRequest } from "@mmgittix/common";

import { Ticket } from "../models/ticket";
import { param } from "express-validator";

const router = express.Router();

router.get(
  "/api/tickets/:id",
  [param("id").isMongoId()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new NotFoundError();
    }

    res.send(ticket);
  }
);

export { router as readTicketRouter };
