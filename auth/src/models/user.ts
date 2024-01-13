import { Document, Model, Schema, model } from "mongoose";

import { Password } from "../services/password";

export interface UserAttrs {
  email: string;
  password: string;
}

type UserDoc = Document & UserAttrs;

interface UserModel extends Model<UserDoc> {
  build: (user: UserAttrs) => UserDoc;
}

const userSchema: Schema<UserDoc> = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
      versionKey: false,
    },
  }
);

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    this.password = Password.toHash(this.password);
  }
  done();
});

export const User = model<UserDoc, UserModel>("User", userSchema);
