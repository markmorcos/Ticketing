import request from "supertest";

import { app } from "../../app";
import { signUp } from "../../test/global";

it("returns a 201 on successful sign-up", () => {
  return signUp();
});

it("returns a 400 with an invalid email", () => {
  return request(app)
    .post("/api/users/sign-up")
    .send({ email: "invalid", password: "password" })
    .expect(400);
});

it("returns a 400 with an invalid password", () => {
  return request(app)
    .post("/api/users/sign-up")
    .send({ email: "mark.yehia@gmail.com", password: "p" })
    .expect(400);
});

it("returns a 400 with a missing email and password", async () => {
  await request(app)
    .post("/api/users/sign-up")
    .send({ password: "password" })
    .expect(400);
  await request(app)
    .post("/api/users/sign-up")
    .send({ email: "mark.yehia@gmail.com" })
    .expect(400);
});

it("disallows duplicate emails", async () => {
  await signUp();
  await request(app)
    .post("/api/users/sign-up")
    .send({ email: "test@example.com", password: "password" })
    .expect(400);
});

it("sets a cookie after a successful sign-up", async () => {
  return signUp();
});
