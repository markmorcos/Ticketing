import request from "supertest";

import { app } from "../../app";
import { createTicket, signIn } from "../../test/global";

it("fetches orders for a particular user", async () => {
  const firstTicket = await createTicket();
  const secondTicket = await createTicket();
  const thirdTicket = await createTicket();

  const firstUser = signIn();
  const secondUser = signIn();

  await request(app)
    .post("/api/orders")
    .set("Cookie", firstUser)
    .send({ ticketId: firstTicket.id })
    .expect(201);
  const { body: firstOrder } = await request(app)
    .post("/api/orders")
    .set("Cookie", secondUser)
    .send({ ticketId: secondTicket.id })
    .expect(201);
  const { body: secondOrder } = await request(app)
    .post("/api/orders")
    .set("Cookie", secondUser)
    .send({ ticketId: thirdTicket.id })
    .expect(201);

  const { body } = await request(app)
    .get("/api/orders")
    .set("Cookie", secondUser)
    .expect(200);

  expect(body).toHaveLength(2);

  expect(body[0].id).toEqual(firstOrder.id);
  expect(body[0].ticket.id).toEqual(secondTicket.id);

  expect(body[1].id).toEqual(secondOrder.id);
  expect(body[1].ticket.id).toEqual(thirdTicket.id);
});
