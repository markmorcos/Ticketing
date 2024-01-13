import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

export interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
      session?:
        | (CookieSessionInterfaces.CookieSessionObject & { jwt?: string })
        | null;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const jwt = req.session?.jwt;

  if (!jwt) {
    return next();
  }

  try {
    req.currentUser = verify(jwt, process.env.JWT_KEY!) as UserPayload;
  } catch (error) {}

  next();
};
