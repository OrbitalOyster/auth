import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { IUser, IUserModel } from "../../types/users";
import {
  allowedToAddUsers,
  allowedToEditUsers,
  allowedToGetUsers,
  allowedToRemoveUsers,
} from "../privilege.js";

/* Password caching level */
const bcryptSaltRounds = 12;

/* Schema */
const userSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, unique: true },
    passwordHash: { type: String },
    p: { type: Number },
  },
  {
    toJSON: {
      transform: function (_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

/* Statics */
userSchema.statics["register"] = async function (
  username: string,
  password: string,
  p: number
): Promise<IUser | null> {
  const passwordHash = await bcrypt.hash(password, bcryptSaltRounds);
  const usernameTaken = await (<IUserModel>this).usernameTaken(username);
  if (usernameTaken) return null;
  const user = new this({ username, passwordHash, p });
  return await user.save();
};

userSchema.statics["usernameTaken"] = async function (
  username: string
): Promise<boolean> {
  return !!(await this.findOne({ username }));
};

/* Methods */
userSchema.methods["checkPassword"] = async function (password: string) {
  return await bcrypt.compare(password, this.passwordHash);
};

userSchema.methods["setNewPassword"] = async function (password: string) {
  const passwordHash = await bcrypt.hash(password, bcryptSaltRounds);
  this.passwordHash = passwordHash;
};

userSchema.methods["allowedToGetUsers"] = function () {
  return allowedToGetUsers(this.p);
};

userSchema.methods["allowedToAddUsers"] = function () {
  return allowedToAddUsers(this.p);
};

userSchema.methods["allowedToEditUsers"] = function () {
  return allowedToEditUsers(this.p);
};

userSchema.methods["allowedToRemoveUsers"] = function () {
  return allowedToRemoveUsers(this.p);
};

/* Model */
mongoose.model<IUser, IUserModel>("user", userSchema);
