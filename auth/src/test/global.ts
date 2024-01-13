import request from "supertest";

import { app } from "../app";

export const signUp = async () => {
  const email = "test@example.com";
  const password = "password";

  const response = await request(app)
    .post("/api/users/sign-up")
    .send({ email, password })
    .expect(201);
  const cookie = response.get("Set-Cookie");

  expect(cookie).toBeDefined();

  return cookie;
};
