import request from "supertest";

import { app } from "../../app";
import { signIn } from "../../test/global";
import { Ticket } from "../../models/ticket";
import { nats } from "../../nats";

it("has a route handler listening to POST /api/tickets", async () => {
  const { status } = await request(app).post("/api/tickets").send({});
  expect(status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", () => {
  return request(app).post("/api/tickets").send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const { status } = await request(app)
    .post("/api/tickets")
    .set("Cookie", signIn())
    .send({});
  expect(status).not.toEqual(401);
});

it("returns an error if an invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signIn())
    .send({ title: "", price: 10 })
    .expect(400);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signIn())
    .send({ price: 10 })
    .expect(400);
});

it("returns an error if an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signIn())
    .send({ title: "title", price: -10 })
    .expect(400);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signIn())
    .send({ title: "title" })
    .expect(400);
});

it("creates a ticket with valid input", async () => {
  const oldTickets = await Ticket.find({});
  expect(oldTickets).toHaveLength(0);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", signIn())
    .send({ title: "title", price: 10 })
    .expect(201);

  const newTickets = await Ticket.find({});
  expect(newTickets).toHaveLength(1);

  expect(nats.client.publish).toHaveBeenCalled();
});
