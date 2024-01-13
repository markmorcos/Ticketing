export const nats = {
  client: {
    publish: jest.fn((subject: string, data: string, callback: () => void) => {
      callback();
    }),
  },
};
