import { Model, Document } from "mongoose";

/* User model */
export interface IUserModel extends Model<IUser> {
  register: (
    username: string,
    password: string,
    p: number
  ) => Promise<IUser | null>;
  usernameTaken: (username: string) => Promise<boolean>;
}

/* User document */
export interface IUser extends Document {
  username: string;
  passwordHash: string;
  p: number;
  checkPassword: (password: string) => Promise<boolean>;
  setNewPassword: (password: string) => Promise<void>;
  allowedToGetUsers: () => boolean;
  allowedToAddUsers: () => boolean;
  allowedToEditUsers: () => boolean;
  allowedToRemoveUsers: () => boolean;
}
