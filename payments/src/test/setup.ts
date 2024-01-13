import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

jest.mock("../nats");

let mongo: MongoMemoryServer;

process.env.STRIPE_KEY =
  "sk_test_51OXSmaHxxGduf7hIscERwmiJRBWCEKWJgJcBoc45iVzBymfxZLeYnEQlf77Wk0TZlAuh3OggGLpyE2WwuXYC0FcR00kBCONAc4";

beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();

  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany()));
});

afterAll(async () => {
  await mongo.stop();
});
