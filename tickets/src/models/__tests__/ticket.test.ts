import { Types } from "mongoose";
import { Ticket } from "../ticket";

it("should update the version key automatically", async () => {
  const { id } = await Ticket.build({
    userId: new Types.ObjectId().toHexString(),
    title: "Title",
    price: 5,
  }).save();

  const firstInstance = await Ticket.findById(id);
  const secondInstance = await Ticket.findById(id);

  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  await firstInstance!.save();

  try {
    await secondInstance!.save();
  } catch (error) {
    return;
  }

  throw new Error("Should not reach this point");
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    userId: new Types.ObjectId().toHexString(),
    title: "Title",
    price: 5,
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
