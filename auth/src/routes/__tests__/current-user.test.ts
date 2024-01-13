import request from "supertest";

import { app } from "../../app";
import { signUp } from "../../test/global";

it("responds with null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/current-user")
    .expect(401);
  expect(response.body.currentUser).toBeUndefined();
});

it("responds with details about the current user", async () => {
  const cookie = await signUp();
  const response = await request(app)
    .get("/api/users/current-user")
    .set("Cookie", cookie)
    .expect(200);
  expect(response.body.currentUser.email).toEqual("test@example.com");
});
