import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

jest.mock("../nats");

let mongo: MongoMemoryServer;

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
