import "express-async-errors";
import express from "express";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { currentUser, errorHandler, NotFoundError } from "@mmgittix/common";

import { createOrderRouter } from "./routes/create";
import { deleteOrderRouter } from "./routes/delete";
import { indexOrderRouter } from "./routes";
import { readOrderRouter } from "./routes/read";

export const app = express();

app.set("trust proxy", true);

app.use(json());
app.use(
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== "test" })
);
app.use(currentUser);

app.use(createOrderRouter);
app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(readOrderRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);
