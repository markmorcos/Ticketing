import request from "supertest";

import { app } from "../../app";
import { createTicket } from "../../test/global";
import { Types } from "mongoose";

it("returns a 404 if the ticket is not found", async () => {
  const id = new Types.ObjectId().toHexString();

  await request(app).get("/api/tickets/invalid").send().expect(400);
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns a ticket if the ticket is found", async () => {
  const body = { title: "title", price: 10 };

  const ticket = await createTicket(body);
  const getResponse = await request(app)
    .get(`/api/tickets/${ticket.id}`)
    .send()
    .expect(200);
  expect(getResponse.body.title).toEqual(body.title);
  expect(getResponse.body.price).toEqual(body.price);
});
