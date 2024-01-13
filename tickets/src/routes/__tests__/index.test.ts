import request from "supertest";

import { app } from "../../app";
import { createTicket } from "../../test/global";

it("can fetch a list of tickets", async () => {
  await createTicket({ title: "title", price: 10 });
  await createTicket({ title: "title", price: 20 });
  await createTicket({ title: "title", price: 30 });

  const response = await request(app).get("/api/tickets").send().expect(200);
  expect(response.body).toHaveLength(3);
});
