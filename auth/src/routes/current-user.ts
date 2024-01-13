import express, { Request, Response } from "express";

import { currentUser, requireAuth } from "@mmgittix/common";

const router = express.Router();

router.get(
  "/api/users/current-user",
  currentUser,
  requireAuth,
  (req: Request, res: Response) => {
    res.send({ currentUser: req.currentUser });
  }
);

export { router as currentUserRouter };
