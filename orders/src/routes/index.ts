import express, { Request, Response } from "express";

import { Order } from "../models/order";
import { requireAuth } from "@mmgittix/common";

const router = express.Router();

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
  const { id: userId } = req.currentUser!;

  const orders = await Order.find({ userId }).populate("ticket");

  res.send(orders);
});

export { router as indexOrderRouter };
