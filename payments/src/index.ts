import mongoose from "mongoose";

import { DatabaseConnectionError } from "@mmgittix/common";

import { app } from "./app";
import { nats } from "./nats";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";

const start = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }
  if (!process.env.STRIPE_KEY) {
    throw new Error("STRIPE_KEY must be defined");
  }

  try {
    await nats.connect(
      process.env.NATS_CLIENT_ID,
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_URL
    );
    nats.client.on("close", () => {
      console.log("NATS connection closed");
      process.exit();
    });
    process.on("SIGINT", () => nats.client.close());
    process.on("SIGTERM", () => nats.client.close());

    new OrderCreatedListener(nats.client).listen();
    new OrderCancelledListener(nats.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    throw new DatabaseConnectionError();
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
};

start();
