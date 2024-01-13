import express, { Request, Response } from "express";
import { body } from "express-validator";
import { sign } from "jsonwebtoken";

import { BadRequestError, validateRequest } from "@mmgittix/common";

import { User } from "../models/user";
import { Password } from "../services/password";

const router = express.Router();

router.post(
  "/api/users/sign-in",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError("Invalid credentials");
    }

    const passwordsMatch = Password.compare(user.password, password);
    if (!passwordsMatch) {
      throw new BadRequestError("Invalid credentials");
    }

    req.session!.jwt = sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY!
    );

    res.status(200).send(user);
  }
);

export { router as signInRouter };
